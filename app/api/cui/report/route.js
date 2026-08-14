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

    const cleanCui = String(cui).replace(/[^0-9]/g, '');

    // 1. Verificare Utilizator
    const { data: profile } = await supabase.from('profiles').select('subscription_tier, credits_remaining, is_pro').eq('id', userId).single();
    
    const tier = (profile?.subscription_tier || 'free').toLowerCase();
    const isPremium = tier.includes('founder') || tier.includes('pro') || profile?.is_pro;
    const availableCredits = profile?.credits_remaining || 0;

    if (!isPremium && availableCredits <= 0) {
      return NextResponse.json({ success: false, needsPayment: true, message: 'Fonduri insuficiente.' }, { status: 403 });
    }

    // 2. Extragere hibridă prin microserviciul local (DemoANAF)
    const firmaRes = await fetch(`http://localhost:3002/api/v1/demoanaf/${cleanCui}`, { cache: 'no-store' }).catch(() => null);

    if (!firmaRes || !firmaRes.ok) {
      throw new Error("Eroare la extragerea datelor financiare și de identificare din sistemul local.");
    }

    const rawResponse = await firmaRes.json();
    const dataFirma = rawResponse.data || {};

    // Extragere date financiare detaliate
    const cifraAfaceri = dataFirma.cifra_afaceri || 0;
    const profitNet = dataFirma.profit_net || 0;
    const nrAngajati = dataFirma.angajati || 0;
    const anBilant = dataFirma.an_bilant || 'N/A';
    
    const stareFiscala = dataFirma.stare || 'ACTIV FISCAL';
    const tvaStatus = dataFirma.tva || 'Conform ANAF';
    const adresaCompletata = dataFirma.adresa || 'Sediu social principal';
    const datoriiTotale = dataFirma.datorii || 0;

    // 3. Consumăm creditul dacă nu e premium
    if (!isPremium && availableCredits > 0) {
      await supabase.from('profiles').update({ credits_remaining: availableCredits - 1 }).eq('id', userId);
    }

    // 4. Salvăm în istoric rapoarte
    await supabase.from('company_reports').insert([{ user_id: userId, cui: cleanCui, company_name: dataFirma.denumire }]);

    // Funcții de formatare a sumelor
    const formatMoney = (val) => val !== null && val !== undefined ? Number(val).toLocaleString('ro-RO') + ' RON' : 'Date indisponibile';
    const formatNumber = (val) => val !== null && val !== undefined ? val : 'Date indisponibile';

    // 5. Generare PDF Premium Hibrid
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
          .badge { display: inline-block; padding: 5px 12px; background: ${stareFiscala.toUpperCase().includes('ACTIV') ? '#dcfce7' : '#fee2e2'}; color: ${stareFiscala.toUpperCase().includes('ACTIV') ? '#166534' : '#991b1b'}; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
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
            <tr><th>Denumire Companie:</th><td><strong>${dataFirma.denumire || 'N/A'}</strong></td></tr>
            <tr><th>Cod Unic Înregistrare (CUI):</th><td>${dataFirma.cui || cleanCui}</td></tr>
            <tr><th>Stare Fiscală / ANAF:</th><td><span class="badge">${stareFiscala}</span></td></tr>
            <tr><th>Adresă Sediu Social:</th><td>${adresaCompletata}</td></tr>
            <tr><th>Plătitor de TVA:</th><td>${tvaStatus}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">2. Date Financiare și Bilanț (Ultimul an disponibil: ${anBilant})</div>
            <table>
              <tr><th>Cifră de Afaceri Netă:</th><td>${formatMoney(cifraAfaceri)}</td></tr>
              <tr><th>Profit Net:</th><td>${formatMoney(profitNet)}</td></tr>
              <tr><th>Datorii Totale:</th><td style="color: ${datoriiTotale > 0 ? '#dc2626' : '#166534'}; font-weight:bold;">${formatMoney(datoriiTotale)}</td></tr>
              <tr><th>Număr Mediu Angajați:</th><td>${formatNumber(nrAngajati)}</td></tr>
            </table>
        </div>

        <div class="footer">
          Document generat digital prin infrastructura hibridă ContractSmart. Datele sunt preluate și procesate automat din registrele oficiale publice.
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
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename=Raport_${cleanCui}.pdf` }
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}