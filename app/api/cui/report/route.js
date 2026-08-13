import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
  try {
    const { cui, userId } = await request.json();

    if (!userId || !cui) {
      return NextResponse.json({ success: false, message: 'Date incomplete.' }, { status: 400 });
    }

    // 1. Verificăm utilizatorul și creditele
    const { data: profile } = await supabase.from('profiles').select('subscription_tier, credits_remaining, is_pro').eq('id', userId).single();
    
    const tier = (profile?.subscription_tier || 'free').toLowerCase();
    const isPremium = tier.includes('founder') || tier.includes('pro') || profile?.is_pro;
    const availableCredits = profile?.credits_remaining || 0;

    if (!isPremium && availableCredits <= 0) {
      return NextResponse.json({ success: false, needsPayment: true, message: 'Fonduri insuficiente.' }, { status: 403 });
    }

    // 2. Tragem datele financiare via FIRMEAPI (URL și structură corectate)
    const apiKey = process.env.OPENAPI_KEY || process.env.FIRMEAPI_KEY; 
    const apiRes = await fetch(`https://www.firmeapi.ro/api/v1/firma/${cui}`, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' }
    });
    
    if (!apiRes.ok) throw new Error("Nu am putut prelua datele financiare de la sursă.");
    const rawData = await apiRes.json();
    const data = rawData.data;

    // 3. Dacă e free, consumăm un credit
    if (!isPremium && availableCredits > 0) {
      await supabase.from('profiles').update({ credits_remaining: availableCredits - 1 }).eq('id', userId);
    }

    // 4. Salvăm istoricul în DB
    await supabase.from('company_reports').insert([{ user_id: userId, cui: cui, company_name: data.denumire }]);

    // 5. Construim PDF-ul Premium (Design Branding ContractSmart)
    const htmlReport = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; }
          .header { text-align: center; border-bottom: 2px solid #8ba888; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 900; color: #0B0F12; letter-spacing: -1px; }
          .logo span { color: #8ba888; }
          .title { font-size: 20px; font-weight: bold; margin-top: 10px; text-transform: uppercase; color: #334155; }
          .badge { display: inline-block; padding: 5px 12px; background: ${data.stare?.includes('Activ') ? '#dcfce7' : '#fee2e2'}; color: ${data.stare?.includes('Activ') ? '#166534' : '#991b1b'}; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 14px; font-weight: bold; color: #8ba888; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          th { background: #f8fafc; color: #475569; width: 35%; }
          .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Contract<span>Smart</span></div>
          <div class="title">RAPORT FINANCIAR & JURIDIC DETALIAT</div>
          <p style="font-size: 12px; color: #64748b;">Generat la: ${new Date().toLocaleString('ro-RO')}</p>
        </div>

        <div class="section">
          <div class="section-title">1. Date de Identificare Principale</div>
          <table>
            <tr><th>Denumire Companie:</th><td><strong>${data.denumire || 'N/A'}</strong></td></tr>
            <tr><th>Cod Unic Înregistrare (CUI):</th><td>${data.cui || 'N/A'}</td></tr>
            <tr><th>Nr. Înmatriculare (ONRC):</th><td>${data.nr_reg_com || 'N/A'}</td></tr>
            <tr><th>Stare ANAF:</th><td><span class="badge">${data.stare || 'Necunoscută'}</span></td></tr>
            <tr><th>Adresă Sediu Social:</th><td>${data.adresa?.judet || ''}, ${data.adresa?.localitate || ''}</td></tr>
            <tr><th>Plătitor de TVA:</th><td>${data.tva?.platitor ? 'DA' : 'NU'}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">2. Date Financiare și Datorii (Ultimul Bilanț)</div>
          <table>
            <tr><th>Cifră de Afaceri Netă:</th><td>${data.financiar?.cifra_de_afaceri ? data.financiar.cifra_de_afaceri.toLocaleString('ro-RO') + ' RON' : 'Date indisponibile'}</td></tr>
            <tr><th>Profit Net:</th><td>${data.financiar?.profit_net ? data.financiar.profit_net.toLocaleString('ro-RO') + ' RON' : 'Date indisponibile'}</td></tr>
            <tr><th>Datorii Totale ANAF:</th><td style="color: #dc2626; font-weight:bold;">${data.financiar?.datorii ? data.financiar.datorii.toLocaleString('ro-RO') + ' RON' : '0 RON (sau nedeclarat)'}</td></tr>
            <tr><th>Număr Mediu Angajați:</th><td>${data.financiar?.numar_angajati || '0'}</td></tr>
          </table>
        </div>

        <div class="footer">
          Document generat digital prin sistemul ContractSmart. Aceste date au caracter informativ și sunt preluate automat din bazele de date deschise ale statului român.
        </div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlReport, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    return new NextResponse(pdfBuffer, { 
      status: 200, 
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename=Raport_${cui}.pdf` }
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}