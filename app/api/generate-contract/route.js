import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';

export const dynamic = 'force-dynamic';
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ success: false, message: 'Invalid Content-Type' }, { status: 400 });
    }

    const body = await request.json();
    const { tipContract, initiatorRol, obiect, valoare, moneda, prestatorNume, prestatorCui, clientNume, clientCui, semnăturaBase64, userId } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Utilizator neautentificat.' }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('subscription_tier, subscription_status, credits_remaining').eq('id', userId).single();

    const isPremium = ['pro', 'founder', 'premium'].includes(profile?.subscription_tier) && profile?.subscription_status === 'active';
    const availableCredits = profile?.credits_remaining || 0;

    if (!isPremium && availableCredits <= 0) {
      return NextResponse.json({ success: false, needsPayment: true, message: 'Ai atins limita gratuită lunară. Achiziționează un credit sau un plan Pro.' }, { status: 403 });
    }

    // Temei Juridic (Restul codului tău rămâne intact)
    let temeiJuridicHtml = '';
    let titluContractOficial = '';

    switch(tipContract) {
      case 'prestari':
        titluContractOficial = "CONTRACT-CADRU DE PRESTĂRI SERVICII COMERCIALE";
        temeiJuridicHtml = `Prezentul acord este guvernat de prevederile <strong>Art. 1851 - Art. 1880 din Codul Civil român</strong>...`;
        break;
      case 'nda':
        titluContractOficial = "ACORD PRIVIND NEPROMOVAREA ȘI PROTECȚIA SECRETELOR COMERCIALE (NDA)";
        temeiJuridicHtml = `Prezentul înscris se fundamentează pe dispozițiile <strong>Art. 1184 și Art. 1200 din Codul Civil român</strong>...`;
        break;
      case 'cda':
        titluContractOficial = "CONTRACT DE CESIUNE EXCLUSIVĂ A DREPTURILOR PATRIMONIALE DE AUTOR";
        temeiJuridicHtml = `Raportul juridic este reglementat de normele imperative ale <strong>Legea nr. 8/1996 privind dreptul de autor...</strong>`;
        break;
      case 'inchiriere_imobil':
        titluContractOficial = "CONTRACT DE LOCAȚIUNE ȘI EXPLOATARE SPAȚIU IMOBILIAR";
        temeiJuridicHtml = `Prezentul înscris reprezintă voința părților în deplină concordanță cu <strong>Art. 1777 - Art. 1835 din Codul Civil român</strong>...`;
        break;
      case 'promisiune_vanzare':
        titluContractOficial = "ANTECONTRACT / PROMISIUNE BILATERALĂ DE VÂNZARE-CUMPĂRARE IMOBIL";
        temeiJuridicHtml = `Contractul este guvernat de normele de drept cuprinse în <strong>Art. 1669 și Art. 1279 din Codul Civil român</strong>...`;
        break;
      default:
        titluContractOficial = "CONTRACT COMERCIAL DE COLABORARE";
        temeiJuridicHtml = `Prezentul acord comercial reprezintă legea părților...`;
    }

    let clauzeInjectateHtml = '';
    // (Aici intră logica ta intactă de injectare clauze `if (body.clauzaPi)` etc.)

    const field = (valoare, minWidth = "120px") => {
      if (valoare && valoare.toString().trim() !== '') return `<span class="valoare-importata">${valoare.toString().trim()}</span>`;
      return `<span class="linia-dinamica" style="min-width: ${minWidth};">&nbsp;</span>`;
    };

    const htmlContract = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:'Times New Roman',Times,serif;padding:50px;color:#000;line-height:1.6;font-size:14px;}</style></head><body><h1>${titluContractOficial}</h1></body></html>`; // Am scurtat aici pentru spațiu, pui html-ul tău complet

    let browser = await puppeteer.launch(process.env.NODE_ENV === 'development' ? { headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" } : { args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'], headless: true });
    
    const page = await browser.newPage();
    await page.setContent(htmlContract, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '40px', bottom: '40px', left: '40px', right: '40px' } });
    await browser.close();

    if (!isPremium && availableCredits > 0) {
      await supabase.from('profiles').update({ credits_remaining: availableCredits - 1 }).eq('id', userId);
    }

    return new NextResponse(pdfBuffer, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename=contract_${tipContract}_securizat.pdf`, 'Content-Length': pdfBuffer.length }});
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}