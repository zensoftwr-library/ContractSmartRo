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

    // 2. Extragere PARALELĂ: FirmeAPI (Bază + Datorii) + Cauta-Firma.ro (Bilanțuri directe)
    const apiKey = process.env.OPENAPI_KEY || process.env.FIRMEAPI_KEY; 
    const reqHeaders = { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' };

    // Apelăm microserviciul local de pe portul 3001
    const firmaRes = await fetch(`http://localhost:3001/api/v1/firma/${cleanCui}`).catch(() => null);

    if (!firmaRes || !firmaRes.ok) throw new Error("Eroare la extragerea datelor din microserviciul local.");

    const rawResponse = await firmaRes.json();
    const dataFirma = rawResponse.data || {};

    // Extragere date financiare livrate de serverul local
    const cifraAfaceri = dataFirma.cifra_afaceri || 0;
    const profitNet = dataFirma.profit_net || 0;
    const nrAngajati = dataFirma.angajati || 0;
    const anBilant = dataFirma.an_bilant || 'N/A';
    
    const stareFiscala = dataFirma.stare || 'ACTIV FISCAL';
    const tvaStatus = 'Conform ANAF';
    const adresaCompletata = dataFirma.adresa || 'Sediu social principal';
    const datoriiTotale = 0;

    if (!firmaRes || !firmaRes.ok) throw new Error("Eroare la extragerea datelor firmei.");

    const rawFirma = await firmaRes.json();
    const rawDatorii = datoriiRes && datoriiRes.ok ? await datoriiRes.json() : {};
    const rawFinante = finanteRes && finanteRes.ok ? await finanteRes.json() : {};
      console.log("--- DEBUG CUI:", cleanCui);
    console.log("--- RĂSPUNS FINANCIARE CAUTA-FIRMA:", JSON.stringify(rawFinante, null, 2));
    const dataFirma = rawFirma.data || {};
    const dataDatorii = rawDatorii.data || {};

    // Extragere date financiare corectate
    let cifraAfaceri = null, profitNet = null, nrAngajati = null, anBilant = 'N/A';
    
    // Căutăm proprietatea corectă (bilant sau finante)
    const finanteArray = rawFinante.bilant || rawFinante.finante || rawFinante.bilanturi || [];
    
    if (Array.isArray(finanteArray) && finanteArray.length > 0) {
      // Găsim cel mai recent an (ex: 2023, 2022)
      const ultimeleFinante = finanteArray.sort((a, b) => (b.an || 0) - (a.an || 0))[0];
      cifraAfaceri = ultimeleFinante.cifra_afaceri || ultimeleFinante.cifraAfaceri || 0;
      profitNet = ultimeleFinante.profit_net || ultimeleFinante.profitNet || ultimeleFinante.profit || 0;
      nrAngajati = ultimeleFinante.angajati || ultimeleFinante.numar_angajati || 0;
      anBilant = ultimeleFinante.an || ultimeleFinante.an_bilant || 'N/A';
    }

    // Mapare Date Formatate
    const stareFiscala = dataFirma.status_inactiv?.inactiv ? 'INACTIV FISCAL (RISC MAJOR)' : 'ACTIV FISCAL';
    const tvaStatus = dataFirma.tva?.platitor ? 'DA' : 'NU';
    const adresaCompletata = typeof dataFirma.adresa === 'string' 
      ? dataFirma.adresa 
      : Object.values(dataFirma.adresa || {}).filter(Boolean).join(', ');

    const datoriiTotale = dataDatorii.total_datorii || dataDatorii.buget_stat_total || 0;

    // 3. Consumăm creditul
    if (!isPremium && availableCredits > 0) {
      await supabase.from('profiles').update({ credits_remaining: availableCredits - 1 }).eq('id', userId);
    }

    // 4. Istoric
    await supabase.from('company_reports').insert([{ user_id: userId, cui: cleanCui, company_name: dataFirma.denumire }]);

    // Funcții de formatare
    const formatMoney = (val) => val !== null && val !== undefined ? Number(val).toLocaleString('ro-RO') + ' RON' : 'Date indisponibile';
    const formatNumber = (val) => val !== null && val !== undefined ? val : 'Date indisponibile';

    // 5. PDF Premium
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
          .badge { display: inline-block; padding: 5px 12px; background: ${stareFiscala.includes('ACTIV') ? '#dcfce7' : '#fee2e2'}; color: ${stareFiscala.includes('ACTIV') ? '#166534' : '#991b1b'}; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
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
            <tr><th>Cod Unic Înregistrare (CUI):</th><td>${dataFirma.cui || 'N/A'}</td></tr>
            <tr><th>Nr. Înmatriculare (ONRC):</th><td>${dataFirma.nr_reg_com || 'N/A'}</td></tr>
            <tr><th>Stare ANAF:</th><td><span class="badge">${stareFiscala}</span></td></tr>
            <tr><th>Adresă Sediu Social:</th><td>${adresaCompletata || 'Adresă indisponibilă'}</td></tr>
            <tr><th>Plătitor de TVA:</th><td>${tvaStatus}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">2. Date Financiare și Datorii (Ultimul Bilanț: Anul ${anBilant})</div>
            <table>
              <tr><th>Cifră de Afaceri Netă:</th><td>${formatMoney(cifraAfaceri)}</td></tr>
              <tr><th>Profit Net:</th><td>${formatMoney(profitNet)}</td></tr>
              <tr><th>Datorii Totale ANAF:</th><td style="color: ${datoriiTotale > 0 ? '#dc2626' : '#166534'}; font-weight:bold;">${datoriiTotale.toLocaleString('ro-RO')} RON</td></tr>
              <tr><th>Număr Mediu Angajați:</th><td>${formatNumber(nrAngajati)}</td></tr>
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
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename=Raport_${cleanCui}.pdf` }
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}