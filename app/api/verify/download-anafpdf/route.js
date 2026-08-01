import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { denumire, cui, adresa, statusTva, stareInactivitate } = await req.json();

    const htmlRaport = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.5; }
          h1 { color: #2c3e50; font-size: 20px; border-bottom: 2px solid #8ba888; padding-bottom: 10px; }
          .info-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; margin-top: 20px; border-radius: 6px; }
          .label { font-weight: bold; color: #64748b; }
          .footer { margin-top: 50px; font-size: 10px; text-align: center; color: #94a3b8; }
        </style>
      </head>
      <body>
        <h1>Raport Oficial Verificare Fiscală ANAF</h1>
        <p>Generat prin platforma ContractSmart la data de ${new Date().toLocaleDateString('ro-RO')}</p>
        
        <div class="info-box">
          <p><span class="label">Denumire Firmă:</span> ${denumire}</p>
          <p><span class="label">Cod Unic de Înregistrare (CUI):</span> ${cui}</p>
          <p><span class="label">Adresă Sediu Social:</span> ${adresa}</p>
          <p><span class="label">Status TVA:</span> ${statusTva}</p>
          <p><span class="label">Stare Inactivitate:</span> ${stareInactivitate}</p>
        </div>

        <div class="footer">
          Document informativ bazat pe date publice extrase din sistemul Ministerului Finanțelor Publice (ANAF).
        </div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlRaport, { waitUntil: 'domcontentloaded' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=raport_anaf_${cui}.pdf`,
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}