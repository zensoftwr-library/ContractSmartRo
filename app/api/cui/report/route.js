import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

function formateazaAdresa(addr) {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  return [
    addr.street ? `Str. ${addr.street}` : '',
    addr.number ? `nr. ${addr.number}` : '',
    addr.block ? `bl. ${addr.block}` : '',
    addr.scara ? `sc. ${addr.scara}` : '',
    addr.floor ? `et. ${addr.floor}` : '',
    addr.apartment ? `ap. ${addr.apartment}` : '',
    addr.city || '',
    addr.county || ''
  ].filter(Boolean).join(', ');
}

async function generatePdfBuffer(cuiClean) {
  if (!cuiClean) throw new Error('CUI invalid sau lipsă');

  let dataFirma = {
    cui: cuiClean,
    denumire: '',
    regCom: '',
    adresa: '',
    stare: 'ACTIV',
    stare_juridica: 'Societate Comercială',
    administrator: '',
    caen: '',
    tva: 'NU',
    istoric_financiar: [],
    an_bilant: 'N/A',
    cifra_afaceri: 0,
    venituri_totale: 0,
    cheltuieli_totale: 0,
    profit_net: 0,
    pierdere_neta: 0,
    datorii: 0,
    angajati: 0,
    active_imobilizate: 0,
    active_circulante: 0,
    stocuri: 0,
    creante: 0,
    cash: 0,
    capitaluri_proprii: 0
  };

  // 🚀 PASUL 1: Preluăm tot ce este Gratuit din baza bazată pe CSV-uri (lista-firme.info)
  try {
    const resFree = await fetch(`https://lista-firme.info/api/v1/info?cui=${cuiClean}`, {
      signal: AbortSignal.timeout(3500)
    });
    if (resFree.ok) {
      const dFree = await resFree.json();
      if (dFree && dFree.cui) {
        dataFirma.denumire = dFree.name || dFree.denumire || '';
        dataFirma.regCom = dFree.reg_com || dFree.numar_reg_com || '';
        dataFirma.adresa = formateazaAdresa(dFree.address);
        
        // Extragem administratorii direct din CSV-uri (legal_representatives)
        const reps = [...(dFree.legal_representatives || []), ...(dFree.natural_person_representatives || [])];
        if (reps.length > 0) {
          dataFirma.administrator = reps.map(r => r.nume || r.name || '').filter(Boolean).join(', ');
        }

        if (dFree.status && dFree.status.details && dFree.status.details.description) {
          dataFirma.stare = dFree.status.details.description.toUpperCase();
          dataFirma.stare_juridica = dataFirma.stare;
        }

        if (dFree.caen && dFree.caen.length > 0) {
          dataFirma.caen = String(dFree.caen[0].code || '');
        }
      }
    }
  } catch (e) {
    console.warn("Eroare preluare date gratuite:", e.message);
  }

  // 🚀 PASUL 2: Apelăm FirmeAPI strict pentru Bilanțuri Financiare și Status Fiscal Avansat
  const apiKey = process.env.FIRMEAPI_KEY;
  if (apiKey) {
    const headers = { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' };

    // Verificăm statusul fiscal detaliat (inactiv / TVA)
    try {
      const resFirma = await fetch(`https://www.firmeapi.ro/api/v1/firma/${cuiClean}`, { headers, signal: AbortSignal.timeout(3000) });
      if (resFirma.ok) {
        const json = await resFirma.json();
        const d = json.data || {};
        if (!dataFirma.denumire) dataFirma.denumire = d.denumire || '';
        if (!dataFirma.regCom) dataFirma.regCom = d.nr_reg_com || '';
        if (!dataFirma.adresa) dataFirma.adresa = typeof d.adresa === 'string' ? d.adresa : formateazaAdresa(d.adresa_sediu_social);
        if (d.cod_caen) dataFirma.caen = d.cod_caen;
        if (d.tva && d.tva.platitor) dataFirma.tva = 'DA';

        if (d.status_inactiv && d.status_inactiv.inactiv) {
          dataFirma.stare = `INACTIV FISCAL (din ${d.status_inactiv.data_inactivare || ''})`;
          dataFirma.stare_juridica = dataFirma.stare;
        }
      }
    } catch (e) {}

    // Dacă nu am găsit administratorul în CSV, îl luăm de la FirmeAPI
    if (!dataFirma.administrator) {
      try {
        const resAdmin = await fetch(`https://www.firmeapi.ro/api/v1/administratori/${cuiClean}`, { headers, signal: AbortSignal.timeout(3000) });
        if (resAdmin.ok) {
          const jsonAdmin = await resAdmin.json();
          const adminiList = jsonAdmin.data || jsonAdmin.administratori || jsonAdmin || [];
          if (Array.isArray(adminiList) && adminiList.length > 0) {
            dataFirma.administrator = adminiList.map(a => a.nume || a.nume_prenume || '').filter(Boolean).join(', ');
          }
        }
      } catch (e) {}
    }

    // Preluăm Bilanțul Financiar de la /bilant/{cui}
    try {
      const resBilant = await fetch(`https://www.firmeapi.ro/api/v1/bilant/${cuiClean}`, { headers, signal: AbortSignal.timeout(3000) });
      if (resBilant.ok) {
        const jsonBilant = await resBilant.json();
        const bilanturi = jsonBilant.data || jsonBilant.bilant || jsonBilant || [];
        if (Array.isArray(bilanturi) && bilanturi.length > 0) {
          dataFirma.istoric_financiar = bilanturi;
          const ultimul = bilanturi[0];
          dataFirma.an_bilant = ultimul.an_bilant || ultimul.an || 'N/A';
          dataFirma.cifra_afaceri = ultimul.cifra_afaceri || ultimul.cifra_de_afaceri || 0;
          dataFirma.venituri_totale = ultimul.venituri_totale || ultimul.venituri || 0;
          dataFirma.cheltuieli_totale = ultimul.cheltuieli_totale || ultimul.cheltuieli || 0;
          dataFirma.profit_net = ultimul.profit_net || ultimul.profit || 0;
          dataFirma.pierdere_neta = ultimul.pierdere_neta || ultimul.pierdere || 0;
          dataFirma.datorii = ultimul.datorii || ultimul.datorii_totale || 0;
          dataFirma.angajati = ultimul.angajati || ultimul.numar_angajati || 0;
          dataFirma.active_imobilizate = ultimul.active_imobilizate || 0;
          dataFirma.active_circulante = ultimul.active_circulante || 0;
          dataFirma.stocuri = ultimul.stocuri || 0;
          dataFirma.creante = ultimul.creante || 0;
          dataFirma.cash = ultimul.casa_si_conturi || ultimul.cash || 0;
          dataFirma.capitaluri_proprii = ultimul.capitaluri_proprii || 0;
        }
      }
    } catch (e) {}
  }

  if (!dataFirma.denumire) throw new Error('Date indisponibile pentru acest CUI în rețeaua oficială.');

  const formatMoney = (val) => Number(val || 0).toLocaleString('ro-RO') + ' RON';
  const formatNumber = (val) => Number(val || 0).toLocaleString('ro-RO');
  
  let istoricHtml = '';
  if (dataFirma.istoric_financiar && dataFirma.istoric_financiar.length > 0) {
    const randuriTabel = dataFirma.istoric_financiar.map(an => `
      <tr>
        <td style="text-align: center;"><strong>${an.an_bilant || an.an || 'N/A'}</strong></td>
        <td style="text-align: right;">${formatMoney(an.cifra_afaceri || an.cifra_de_afaceri)}</td>
        <td style="text-align: right;" class="${(an.profit_net || an.profit || 0) > 0 ? 'text-green' : 'text-red'}">${formatMoney(an.profit_net || an.profit)}</td>
        <td style="text-align: right;" class="text-red">${formatMoney(an.datorii || an.datorii_totale)}</td>
        <td style="text-align: center;">${formatNumber(an.angajati || an.numar_angajati)}</td>
      </tr>
    `).join('');

    istoricHtml = `
      <div class="section">
        <div class="section-title">4. ISTORIC FINANCIAR (PÂNĂ LA 8 ANI)</div>
        <table>
          <thead style="background: #f9fafb;">
            <tr>
              <th style="text-align: center;">An</th>
              <th style="text-align: right;">Cifră de Afaceri</th>
              <th style="text-align: right;">Profit Net</th>
              <th style="text-align: right;">Datorii Totale</th>
              <th style="text-align: center;">Angajați</th>
            </tr>
          </thead>
          <tbody>
            ${randuriTabel}
          </tbody>
        </table>
      </div>
    `;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; color: #1f2937; line-height: 1.4; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #e5e7eb; padding-bottom: 15px; }
          .section { margin-bottom: 20px; }
          .section-title { background: #f3f4f6; padding: 6px 10px; font-weight: bold; font-size: 12px; border-left: 4px solid #2563eb; margin-bottom: 10px; color: #1f2937; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { width: 45%; color: #4b5563; font-weight: 600; }
          td { color: #111827; }
          .badge { display: inline-block; padding: 2px 8px; background: #dfeeeb; color: #065f46; font-weight: bold; border-radius: 4px; font-size: 10px; }
          .text-green { color: #166534; font-weight: bold; }
          .text-red { color: #dc2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="margin: 0; color: #111827; font-size: 16px;">RAPORT FINANCIAR & JURIDIC DETALIAT</h2>
          <p style="margin: 4px 0 0; color: #6b7280; font-size: 10px;">Generat la: ${new Date().toLocaleString('ro-RO')}</p>
        </div>
        <div class="section">
          <div class="section-title">1. DATE DE IDENTIFICARE & ACTIVITATE</div>
          <table>
            <tr><th>Denumire:</th><td><strong>${dataFirma.denumire}</strong></td></tr>
            <tr><th>CUI / Reg. Com.:</th><td>${dataFirma.cui} / ${dataFirma.regCom || 'N/A'}</td></tr>
            <tr><th>Stare:</th><td><span class="badge">${dataFirma.stare}</span></td></tr>
            <tr><th>Administrator:</th><td><strong>${dataFirma.administrator || 'N/A'}</strong></td></tr>
            <tr><th>Adresă:</th><td>${dataFirma.adresa}</td></tr>
            <tr><th>CAEN:</th><td>${dataFirma.caen || 'N/A'}</td></tr>
            <tr><th>TVA:</th><td>${dataFirma.tva}</td></tr>
          </table>
        </div>
        <div class="section">
          <div class="section-title">2. SITUAȚIA FINANCIARĂ (AN: ${dataFirma.an_bilant})</div>
          <table>
            <tr><th>Cifră de Afaceri Netă:</th><td>${formatMoney(dataFirma.cifra_afaceri)}</td></tr>
            <tr><th>Venituri Totale:</th><td>${formatMoney(dataFirma.venituri_totale)}</td></tr>
            <tr><th>Cheltuieli Totale:</th><td>${formatMoney(dataFirma.cheltuieli_totale)}</td></tr>
            <tr><th>Profit Net:</th><td class="text-green">${formatMoney(dataFirma.profit_net)}</td></tr>
            <tr><th>Pierdere Netă:</th><td class="text-red">${formatMoney(dataFirma.pierdere_neta)}</td></tr>
            <tr><th>Angajați:</th><td>${formatNumber(dataFirma.angajati)}</td></tr>
          </table>
        </div>
        <div class="section">
          <div class="section-title">3. ACTIVE ȘI DATORII</div>
          <table>
            <tr><th>Active Imobilizate:</th><td>${formatMoney(dataFirma.active_imobilizate)}</td></tr>
            <tr><th>Active Circulante:</th><td>${formatMoney(dataFirma.active_circulante)}</td></tr>
            <tr><th>Datorii Totale:</th><td class="text-red">${formatMoney(dataFirma.datorii)}</td></tr>
            <tr><th>Capitaluri Proprii:</th><td>${formatMoney(dataFirma.capitaluri_proprii)}</td></tr>
          </table>
        </div>
        ${istoricHtml}
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  return pdfBuffer;
}

export async function GET(request) {
  const cui = new URL(request.url).searchParams.get('cui');
  try {
    const buf = await generatePdfBuffer(cui);
    return new NextResponse(buf, { status: 200, headers: { 'Content-Type': 'application/pdf' } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  let body = {};
  try { body = await request.json(); } catch(e) {}
  const cui = body.cui || new URL(request.url).searchParams.get('cui');
  try {
    const buf = await generatePdfBuffer(cui);
    return new NextResponse(buf, { status: 200, headers: { 'Content-Type': 'application/pdf' } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}