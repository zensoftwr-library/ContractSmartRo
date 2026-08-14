import { NextResponse } from 'next/server';

async function generateReportData(cuiClean) {
  if (!cuiClean) {
    return [{ success: false, error: 'CUI invalid sau lipsă' }, 400];
  }

  try {
    const response = await fetch(`http://localhost:3002/api/v1/demoanaf/${cuiClean}`);
    if (!response.ok) throw new Error('Microserviciul nu a putut fi accesat');
    
    const result = await response.json();
    if (!result.success || !result.data) {
      return [{ success: false, error: 'Date indisponibile pentru acest CUI' }, 404];
    }

    const dataFirma = result.data;
    const formatMoney = (val) => Number(val || 0).toLocaleString('ro-RO') + ' RON';
    const formatNumber = (val) => Number(val || 0).toLocaleString('ro-RO');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; color: #1f2937; line-height: 1.4; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            .header h2 { margin: 0; color: #111827; font-size: 18px; }
            .section { margin-bottom: 20px; }
            .section-title { background: #f3f4f6; padding: 6px 10px; font-weight: bold; font-size: 12px; border-left: 4px solid #2563eb; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { width: 45%; color: #4b5563; }
            .text-green { color: #166534; font-weight: bold; }
            .text-red { color: #dc2626; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header"><h2>RAPORT FINANCIAR</h2></div>
          <div class="section">
            <div class="section-title">1. DATE IDENTIFICARE</div>
            <table>
              <tr><th>Denumire:</th><td>${dataFirma.denumire}</td></tr>
              <tr><th>Administrator:</th><td>${dataFirma.administrator || 'N/A'}</td></tr>
            </table>
          </div>
          <div class="section">
            <div class="section-title">2. DATE FINANCIARE (${dataFirma.an_bilant})</div>
            <table>
              <tr><th>Cifră Afaceri:</th><td>${formatMoney(dataFirma.cifra_afaceri)}</td></tr>
              <tr><th>Profit Net:</th><td class="text-green">${formatMoney(dataFirma.profit_net)}</td></tr>
              <tr><th>Datorii:</th><td class="text-red">${formatMoney(dataFirma.datorii)}</td></tr>
              <tr><th>Angajați:</th><td>${formatNumber(dataFirma.angajati)}</td></tr>
            </table>
          </div>
          <div class="section">
            <div class="section-title">3. ACTIVE ȘI PATRIMONIU</div>
            <table>
              <tr><th>Stocuri:</th><td>${formatMoney(dataFirma.stocuri)}</td></tr>
              <tr><th>Casa/Bănci:</th><td>${formatMoney(dataFirma.cash)}</td></tr>
            </table>
          </div>
        </body>
      </html>
    `;

    return [{ success: true, html: htmlContent }, 200];
  } catch (error) {
    console.error('Eroare raport:', error);
    return [{ success: false, error: error.message }, 500];
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cui = searchParams.get('cui');
  const [result, status] = await generateReportData(cui);
  return NextResponse.json(result, { status });
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
  const [result, status] = await generateReportData(cui);
  return NextResponse.json(result, { status });
}