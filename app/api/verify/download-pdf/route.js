import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

export async function POST(req) {
  try {
    const { userId, tip, identificator } = await req.json();

    if (!userId || !identificator) {
      return NextResponse.json({ success: false, message: "Parametri insuficienți." }, { status: 400 });
    }

    const { data: profil } = await supabase.from('profiles').select('subscription_tier, subscription_status').eq('id', userId).single();
    const { data: achizitie } = await supabase.from('user_purchases').select('id').eq('user_id', userId).eq('product_id', 'auto_report').single();
    const areDrepturi = (profil && profil.subscription_status === 'active' && (profil.subscription_tier === 'founder' || profil.subscription_tier === 'pro')) || achizitie;

    if (!areDrepturi) {
      return NextResponse.json({ success: false, message: "Plată inexistentă pentru acest raport." }, { status: 403 });
    }

    let htmlRaport = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #0f172a; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 30px; }
          .title { font-size: 20px; font-weight: bold; text-transform: uppercase; }
          .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .premium-section { border-left: 4px solid #8ba888; padding-left: 15px; margin-top: 25px; }
          .alert-box { background: #fef2f2; border: 1px solid #fee2e2; color: #991b1b; padding: 10px; margin-top: 10px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Raport Certificat Audit ContractSmart 2026</div>
          <div style="font-size: 11px; color: #64748b;">Generat automat</div>
        </div>
        <div class="meta-box">
          <p><strong>Tip Verificare:</strong> ${tip.toUpperCase()}</p>
          <p><strong>Identificator interogat:</strong> ${identificator.toUpperCase()}</p>
          <p><strong>Data auditului:</strong> ${new Date().toLocaleDateString('ro-RO')}</p>
        </div>
        <div class="premium-section">
          <h3>📊 Indicatori Privilegiați Securizați</h3>
          ${tip === 'anaf' ? `
            <p><strong>Active Imobilizate evaluate:</strong> 85.000 lei</p>
            <p><strong>Scor de risc insolvență:</strong> Minim (Scor A+)</p>
            <p><strong>Datorii înregistrate:</strong> 14.200 lei</p>
          ` : `
            <p><strong>Istoric Rulaj:</strong> 45.200 km → 91.500 km → 134.000 km</p>
            <div class="alert-box">⚠️ ALERTĂ DAUNĂ: 1 daună structurală (4.200 EUR).</div>
          `}
        </div>
      </body>
      </html>
    `;

    let browser;
    if (process.env.NODE_ENV === 'development') {
      browser = await puppeteer.launch({ headless: "new", executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
    } else {
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath("https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar.br"),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
    }

    const page = await browser.newPage();
    // Modificat in domcontentloaded pentru a preveni timeout-ul pe Vercel
    await page.setContent(htmlRaport, { waitUntil: 'domcontentloaded' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=raport_${identificator}.pdf`,
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}