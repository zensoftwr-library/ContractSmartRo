import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

function formateazaAdresa(addr) {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  return [
    addr.street ? `Str. ${addr.street}` : '',
    addr.number ? `nr. ${addr.number}` : '',
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

  // 1. Preluăm datele juridice de bază (Gratuit) de la lista-firme.info
  try {
    const resFree = await fetch(`https://lista-firme.info/api/v1/info?cui=${cuiClean}`, {
      signal: AbortSignal.timeout(3500)
    });
    if (resFree.ok) {
      const dataFree = await resFree.json();
      dataFirma.denumire = dataFree.name || dataFree.denumire || '';
      dataFirma.regCom = dataFree.reg_com || dataFree.numar_reg_com || '';
      dataFirma.adresa = formateazaAdresa(dataFree.address);
      
      const reps = [...(dataFree.legal_representatives || []), ...(dataFree.natural_person_representatives || [])];
      if (reps.length > 0) {
        dataFirma.administrator = reps.map(r => r.nume || r.name || '').filter(Boolean).join(', ');
      }
    }
  } catch (e) {
    console.warn("Eroare lista-firme.info în raport:", e.message);
  }

  // 2. Preluăm Bilanțurile Financiare și Starea Fiscală Reală de la FirmeAPI
  if (process.env.FIRMEAPI_KEY) {
    try {
      const resFirme = await fetch(`https://www.firmeapi.ro/api/v1/firma/${cuiClean}`, {
        headers: { 'Authorization': `Bearer ${process.env.FIRMEAPI_KEY}`, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4000)
      });
      
      if (resFirme.ok) {
        const resultFirme = await resFirme.json();
        const data = resultFirme.data || {};
        
        if (!dataFirma.denumire) dataFirma.denumire = data.denumire || '';
        if (!dataFirma.regCom) dataFirma.regCom = data.nr_reg_com || '';
        if (!dataFirma.adresa) dataFirma.adresa = typeof data.adresa === 'string' ? data.adresa : '';
        if (data.cod_caen) dataFirma.caen = data.cod_caen;
        if (data.tva && data.tva.platitor) dataFirma.tva = 'DA';

        // Verificare stadiu inactiv / radiat
        if (data.status_inactiv && data.status_inactiv.inactiv) {
          const dataInactivarii = data.status_inactiv.data_inactivare || '';
          dataFirma.stare = dataInactivarii ? `INACTIV FISCAL (din ${dataInactivarii})` : `INACTIV FISCAL`;
          dataFirma.stare_juridica = dataFirma.stare;
        } else if (data.stare) {
          dataFirma.stare = data.stare;
          dataFirma.stare_juridica = data.stare;
        }

        // Extragere istoric financiar / bilanțuri
        const bilanturi = data.bilant || data.istoric_financiar || data.financiare || [];
        if (bilanturi.length > 0) {
          dataFirma.istoric_financiar = bilanturi;
          const ultimulBilant = bilanturi[0]; // De obicei primul din listă este cel mai recent
          
          dataFirma.an_bilant = ultimulBilant.an_bilant || ultimulBilant.an || 'N/A';
          dataFirma.cifra_afaceri = ultimulBilant.cifra_afaceri || 0;
          dataFirma.profit_net = ultimulBilant.profit_net || 0;
          dataFirma.pierdere_neta = ultimulBilant.pierdere_neta || 0;
          dataFirma.datorii = ultimulBilant.datorii || 0;
          dataFirma.angajati = ultimulBilant.angajati || 0;
          dataFirma.active_imobilizate = ultimulBilant.active_imobilizate || 0;
          dataFirma.active_circulante = ultimulBilant.active_circulante || 0;
          dataFirma.stocuri = ultimulBilant.stocuri || 0;
          dataFirma.creante = ultimulBilant.creante || 0;
          dataFirma.cash = ultimulBilant.casa_si_conturi || ultimulBilant.cash || 0;
          dataFirma.capitaluri_proprii = ultimulBilant.capitaluri_proprii || 0;
        }
      }
    } catch (e) {
      console.warn("Eroare FirmeAPI în raport:", e.message);
    }
  }

  // Fallback final la OpenAPI dacă nu avem denumire din primele două surse
  if (!dataFirma.denumire && process.env.OPENAPI_API_KEY) {
    try {
      const resOpen = await fetch(`https://api.openapi.ro/api/companies/${cuiClean}`, {
        headers: { 'x-api-key': process.env.OPENAPI_API_KEY }
      });
      if (resOpen.ok) {
        const resultOpen = await resOpen.json();
        dataFirma.denumire = resultOpen.denumire;
        dataFirma.regCom = resultOpen.numar_reg_com;
        dataFirma.adresa = typeof resultOpen.adresa === 'string' ? resultOpen.adresa : '';
        dataFirma.caen = resultOpen.caen;
        dataFirma.tva = resultOpen.tva ? 'DA' : 'NU';
        dataFirma.stare = resultOpen.stare || 'ACTIV';
        dataFirma.stare_juridica = resultOpen.stare || 'ACTIV';
        if (resultOpen.reprezentanti && resultOpen.reprezentanti.length > 0) {
          dataFirma.administrator = resultOpen.reprezentanti.map(r => r.nume).join(', ');
        }
      }
    } catch (e) {
      console.warn("Eroare OpenAPI în raport:", e.message);
    }
  }

  if (!dataFirma.denumire) throw new Error('Date indisponibile pentru acest CUI în rețeaua oficială.');

  const formatMoney = (val) => Number(val || 0).toLocaleString('ro-RO') + ' RON';
  const formatNumber = (val) => Number(val || 0).toLocaleString('ro-RO');
  
  let istoricHtml = '';
  if (dataFirma.istoric_financiar && dataFirma.istoric_financiar.length > 0) {
    const randuriTabel = dataFirma.istoric_financiar.map(an => `
      <tr>
        <td style="text-align: center;"><strong>${an.an_bilant || an.an || 'N/A'}</strong></td>
        <td style="text-align: right;">${formatMoney(an.cifra_afaceri)}</td>
        <td style="text-align: right;" class="${(an.profit_net || 0) > 0 ? 'text-green' : 'text-red'}">${formatMoney(an.profit_net)}</td>
        <td style="text-align: right;" class="text-red">${formatMoney(an.datorii)}</td>
        <td style="text-align: center;">${formatNumber(an.angajati)}</td>
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
          <div style="width: 160px; height: 28px; margin: 0 auto 10px auto; display: inline-block;">
            <svg viewBox="0 0 240 40" style="width: 100%; height: 100%;">
              <g transform="translate(0, 2)">
                <path d="M24 6 C15 6, 8 13, 8 22 C8 31, 15 38, 24 38 C31 38, 37 33, 39 27" fill="none" stroke="#8ba888" stroke-width="4" stroke-linecap="round"/>
                <path d="M16 21 L21 26 L32 12" fill="none" stroke="#8ba888" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              </g>
              <text x="48" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="20" fill="#111827" letterSpacing="-0.5">
                Contract<tspan fill="#8ba888">Smart</tspan>
              </text>
            </svg>
          </div>
          <h2 style="margin: 0; color: #111827; font-size: 16px;">RAPORT FINANCIAR & JURIDIC DETALIAT</h2>
          <p style="margin: 4px 0 0; color: #6b7280; font-size: 10px;">Generat digital la: ${new Date().toLocaleString('ro-RO')}</p>
        </div>

        <div class="section">
          <div class="section-title">1. DATE DE IDENTIFICARE & ACTIVITATE</div>
          <table>
            <tr><th>Denumire Companie:</th><td><strong>${dataFirma.denumire || 'N/A'}</strong></td></tr>
            <tr><th>CUI / Reg. Com.:</th><td>${dataFirma.cui} / ${dataFirma.regCom || 'N/A'}</td></tr>
            <tr><th>Stare Fiscală / ANAF:</th><td><span class="badge">${dataFirma.stare || 'N/A'}</span></td></tr>
            <tr><th>Stare Juridică / Activitate:</th><td><span class="text-red">${dataFirma.stare_juridica || 'N/A'}</span></td></tr>
            <tr><th>Administrator / Reprezentant:</th><td>${dataFirma.administrator || 'N/A'}</td></tr>
            <tr><th>Adresă Sediu Social:</th><td>${dataFirma.adresa || 'N/A'}</td></tr>
            <tr><th>Domeniu de Activitate (CAEN):</th><td>${dataFirma.caen || 'N/A'}</td></tr>
            <tr><th>Plătitor de TVA:</th><td>${dataFirma.tva || 'N/A'}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">2. SITUAȚIA FINANCIARĂ PRINCIPALĂ (ULTIMUL AN DISPONIBIL: ${dataFirma.an_bilant || 'N/A'})</div>
          <table>
            <tr><th>Cifră de Afaceri Netă:</th><td>${formatMoney(dataFirma.cifra_afaceri)}</td></tr>
            <tr><th>Venituri Totale:</th><td>${formatMoney(dataFirma.venituri_totale)}</td></tr>
            <tr><th>Cheltuieli Totale:</th><td>${formatMoney(dataFirma.cheltuieli_totale)}</td></tr>
            <tr><th>Profit Net:</th><td class="text-green">${formatMoney(dataFirma.profit_net)}</td></tr>
            <tr><th>Pierdere Netă:</th><td class="text-red">${formatMoney(dataFirma.pierdere_neta)}</td></tr>
            <tr><th>Număr Mediu Angajați:</th><td>${formatNumber(dataFirma.angajati)} persoane</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">3. ACTIVE, DATORII ȘI PATRIMONIU (BILANȚ ${dataFirma.an_bilant || 'N/A'})</div>
          <table>
            <tr><th>Active Imobilizate:</th><td>${formatMoney(dataFirma.active_imobilizate)}</td></tr>
            <tr><th>Active Circulante (Total):</th><td>${formatMoney(dataFirma.active_circulante)}</td></tr>
            <tr><th>- Stocuri:</th><td>${formatMoney(dataFirma.stocuri)}</td></tr>
            <tr><th>- Creanțe:</th><td>${formatMoney(dataFirma.creante)}</td></tr>
            <tr><th>- Casa și Conturi la Bănci (Cash):</th><td>${formatMoney(dataFirma.cash)}</td></tr>
            <tr><th>Datorii Totale:</th><td class="text-red">${formatMoney(dataFirma.datorii)}</td></tr>
            <tr><th>Capitaluri Proprii:</th><td>${formatMoney(dataFirma.capitaluri_proprii)}</td></tr>
          </table>
        </div>
        ${istoricHtml}
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({ 
    headless: "new", 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  
  return pdfBuffer;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cui = searchParams.get('cui');
  try {
    const pdfBuffer = await generatePdfBuffer(cui);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Raport_Detaliat_Firma.pdf"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  let jsonBody = {};
  try {
    jsonBody = await request.json();
  } catch (e) {}

  const cui = jsonBody.cui || new URL(request.url).searchParams.get('cui');

  try {
    const pdfBuffer = await generatePdfBuffer(cui);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Raport_Detaliat_Firma.pdf"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}