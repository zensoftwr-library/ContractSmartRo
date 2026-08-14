import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

async function generatePdfBuffer(cuiClean) {
  if (!cuiClean) {
    throw new Error('CUI invalid sau lipsă');
  }

  // Apelăm microserviciul nostru de pe portul 3002
  const response = await fetch(`http://localhost:3002/api/v1/demoanaf/${cuiClean}`);
  const result = await response.json();
  
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Date indisponibile pentru acest CUI');
  }
  
  const dataFirma = result.data;
  const formatMoney = (val) => Number(val || 0).toLocaleString('ro-RO') + ' RON';
  const formatNumber = (val) => Number(val || 0).toLocaleString('ro-RO');

  // Șablonul HTML complet, cu logo-ul SVG inclus și toate datele extinse
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
          <!-- Logo SVG Vectorial -->
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
            <tr><th>Denumire Companie:</th><td><strong>${dataFirma.denumire}</strong></td></tr>
            <tr><th>CUI / Reg. Com.:</th><td>${dataFirma.cui} / ${dataFirma.regCom || 'N/A'}</td></tr>
            <tr><th>Stare Fiscală / ANAF:</th><td><span class="badge">${dataFirma.stare}</span></td></tr>
            <tr><th>Administrator / Reprezentant:</th><td>${dataFirma.administrator || 'N/A'}</td></tr>
            <tr><th>Adresă Sediu Social:</th><td>${dataFirma.adresa}</td></tr>
            <tr><th>Domeniu de Activitate (CAEN):</th><td>${dataFirma.caen || 'N/A'}</td></tr>
            <tr><th>Plătitor de TVA:</th><td>${dataFirma.tva}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">2. SITUAȚIA FINANCIARĂ PRINCIPALĂ (ULTIMUL AN DISPONIBIL: ${dataFirma.an_bilant})</div>
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
          <div class="section-title">3. ACTIVE, DATORII ȘI PATRIMONIU (BILANȚ ${dataFirma.an_bilant})</div>
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