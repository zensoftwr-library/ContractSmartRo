import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cui = searchParams.get('cui');

  if (!cui) {
    return NextResponse.json({ success: false, error: 'CUI invalid sau lipsă' }, { status: 400 });
  }

  try {
    // 1. Apelăm microserviciul nostru de pe portul 3002 care returnează datele extinse din OpenAPI/DemoANAF
    const response = await fetch(`http://localhost:3002/api/v1/demoanaf/${cui}`);
    const result = await response.json();

    if (!result.success || !result.data) {
      return NextResponse.json({ success: false, error: 'Nu s-au putut prelua datele financiare pentru acest CUI' }, { status: 404 });
    }

    const dataFirma = result.data;

    // Funcții de formatare sume și numere
    const formatMoney = (val) => Number(val || 0).toLocaleString('ro-RO') + ' RON';
    const formatNumber = (val) => Number(val || 0).toLocaleString('ro-RO');

    // 2. Construim șablonul HTML extins pentru PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; color: #1f2937; line-height: 1.4; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            .header h2 { margin: 0; color: #111827; font-size: 18px; }
            .header p { margin: 5px 0 0; color: #6b7280; font-size: 10px; }
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
            <h2>RAPORT FINANCIAR & JURIDIC DETALIAT</h2>
            <p>Generat digital la: ${new Date().toLocaleString('ro-RO')}</p>
          </div>

          <div class="section">
            <div class="section-title">1. DATE DE IDENTIFICARE & ACTIVITATE</div>
            <table>
              <tr><th>Denumire Companie:</th><td><strong>${dataFirma.denumire}</strong></td></tr>
              <tr><th>CUI / Reg. Com.:</th><td>${dataFirma.cui} / ${dataFirma.regCom || 'N/A'}</td></tr>
              <tr><th>Stare Fiscală / ANAF:</th><td><span class="badge">${dataFirma.stare}</span></td></tr>
              <tr><th>Administrator / Reprezentant:</th><td>${dataFirma.administrator || 'N/A'}</td></tr>
              <tr><th>Adresă Sediu Social:</th><td>${dataFirma.adresa}</td></tr>
              <tr><th>Domeniu de Activitate (CAEN):</th><td>${dataFirma.caen_code ? `${dataFirma.caen_code} - ${dataFirma.caen_description}` : 'N/A'}</td></tr>
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

    // Aici apelezi libraria ta de generat PDF (ex: html-pdf-node, puppeteer, etc.) pe baza lui `htmlContent`
    // Exemplu de return buffer PDF:
    // const pdfBuffer = ...;
    // return new NextResponse(pdfBuffer, { headers: { 'Content-Type': 'application/pdf' } });

    // Momentan returnăm HTML-ul direct sau logica ta curentă de PDF generat:
    return NextResponse.json({ success: true, html: htmlContent });

  } catch (error) {
    console.error('Eroare la generarea raportului PDF:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă server' }, { status: 500 });
  }
}