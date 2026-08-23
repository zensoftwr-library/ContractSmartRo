import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

async function generatePdfBuffer(cuiClean) {
  if (!cuiClean) throw new Error('CUI invalid sau lipsă');

  let dataFirma = {};
  
  // 1. Preluăm Istoricul Financiar de la FirmeAPI
  if (process.env.FIRMEAPI_KEY) {
    try {
      const resFirme = await fetch(`https://www.firmeapi.ro/api/v1/firma/${cuiClean}`, {
        headers: { 'Authorization': `Bearer ${process.env.FIRMEAPI_KEY}`, 'Accept': 'application/json' }
      });
      if (resFirme.ok) {
        const resultFirme = await resFirme.json();
        if (resultFirme.data) {
          dataFirma = {
            ...resultFirme.data,
            regCom: resultFirme.data.nr_reg_com,
            istoric_financiar: resultFirme.data.bilant || [],
            an_bilant: resultFirme.data.bilant?.[0]?.an || 'N/A',
            cifra_afaceri: resultFirme.data.bilant?.[0]?.cifra_afaceri || 0,
            profit_net: resultFirme.data.bilant?.[0]?.profit_net || 0,
            pierdere_neta: resultFirme.data.bilant?.[0]?.pierdere_neta || 0,
            datorii: resultFirme.data.bilant?.[0]?.datorii || 0,
            angajati: resultFirme.data.bilant?.[0]?.angajati || 0,
            active_imobilizate: resultFirme.data.bilant?.[0]?.active_imobilizate || 0,
            active_circulante: resultFirme.data.bilant?.[0]?.active_circulante || 0,
            stocuri: resultFirme.data.bilant?.[0]?.stocuri || 0,
            creante: resultFirme.data.bilant?.[0]?.creante || 0,
            cash: resultFirme.data.bilant?.[0]?.casa_si_conturi || 0,
            capitaluri_proprii: resultFirme.data.bilant?.[0]?.capitaluri_proprii || 0
          };
        }
      }
    } catch(e) { console.warn("FirmeAPI bilant error:", e); }
  }

  // 2. Preluăm Datele Juridice + Administratorii de la OpenAPI (Suprascrie datele de bază)
  if (process.env.OPENAPI_API_KEY) {
    try {
      const resOpen = await fetch(`https://api.openapi.ro/api/companies/${cuiClean}`, {
        headers: { 'x-api-key': process.env.OPENAPI_API_KEY }
      });
      if (resOpen.ok) {
        const resultOpen = await resOpen.json();
        let admin = '';
        if (resultOpen.reprezentanti && resultOpen.reprezentanti.length > 0) {
          admin = resultOpen.reprezentanti.map(r => r.nume).join(', ');
        }
        
        dataFirma.denumire = resultOpen.denumire || dataFirma.denumire;
        dataFirma.cui = resultOpen.cif || cuiClean;
        dataFirma.regCom = resultOpen.numar_reg_com || dataFirma.regCom;
        dataFirma.stare = resultOpen.stare || dataFirma.stare || 'ACTIV';
        dataFirma.stare_juridica = resultOpen.stare || 'Societate Comercială';
        dataFirma.adresa = resultOpen.adresa || dataFirma.adresa;
        dataFirma.caen = resultOpen.caen || dataFirma.caen;
        dataFirma.administrator = admin;
        dataFirma.tva = resultOpen.tva ? 'DA' : 'NU';
      }
    } catch(e) { console.warn("OpenAPI basic error:", e); }
  }

  if (!dataFirma.denumire) throw new Error('Date indisponibile pentru acest CUI în rețeaua oficială.');

  const formatMoney = (val) => Number(val || 0).toLocaleString('ro-RO') + ' RON';
  const formatNumber = (val) => Number(val || 0).toLocaleString('ro-RO');
  
  let istoricHtml = '';
  if (dataFirma.istoric_financiar && dataFirma.istoric_financiar.length > 0) {
    const randuriTabel = dataFirma.istoric_financiar.map(an => `
      <tr>
        <td style="text-align: center;"><strong>${an.an_bilant || an.an}</strong></td>
        <td style="text-align: right;">${formatMoney(an.cifra_afaceri)}</td>
        <td style="text-align: right;" class="${an.profit_net > 0 ? 'text-green' : 'text-red'}">${formatMoney(an.profit_net)}</td>
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
            <tr><th>CUI / Reg. Com.:</th><td>${dataFirma.cui || cuiClean} / ${dataFirma.regCom || 'N/A'}</td></tr>
            <tr><th>Stare Fiscală / ANAF:</th><td><span class="badge">${dataFirma.stare || 'N/A'}</span></td></tr>
            <tr><th>Stare Juridică / Activitate:</th><td><span class="text-red">${dataFirma.stare_juridica || 'N/A'}</span></td></tr>
            <tr><th>Administrator / Reprezentant:</th><td>${dataFirma.administrator || 'N/A'}</td></tr>
            <tr><th>Adresă Sediu Social:</th><td>${typeof dataFirma.adresa === 'string' ? dataFirma.adresa : 'N/A'}</td></tr>
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
  let cui = null;
  try {
    const body = await request.json();
    cui = body.cui;
  } catch (e) {
    const { searchParams } = new URL(request.url);
    cui = searchParams.get('cui');
  }

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