import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';
import JSZip from 'jszip';
import twilio from 'twilio';

export const dynamic = 'force-dynamic';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID || '', process.env.TWILIO_AUTH_TOKEN || '');

async function randeazaHtmlInPdf(htmlContent) {
  const launchOptions = { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] };
  if (process.env.NODE_ENV === 'development') launchOptions.executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  return pdfBuffer;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const rawData = formData.get('autoDataJson');
    const data = rawData ? JSON.parse(rawData) : {};
    
    // VERIFICARE DREPTURI ACCES AUTO
    if (!data.userId) return NextResponse.json({ success: false, message: 'Neautentificat' }, { status: 401 });
    const { data: profile } = await supabase.from('profiles').select('subscription_tier, subscription_status').eq('id', data.userId).single();
    const isFounder = profile?.subscription_tier === 'founder' && profile?.subscription_status === 'active';

    if (!isFounder) {
      const { data: achizitie } = await supabase.from('user_purchases').select('id').eq('user_id', data.userId).eq('product_id', 'contract_auto').single();
      if (!achizitie) {
        return NextResponse.json({ success: false, needsPayment: true, message: 'Acces interzis. Necesită achiziție sau cont Fondator.' }, { status: 403 });
      }
    }

    // AICI PUI RESTUL LOGICII TALE CU JSZIP ȘI GENERAREA HTML, EXACT CUM O AI, DAR FĂRĂ BLOCUL RAR
    // (Șterge bucata `if (data.rarReportBonus)` și referințele la Fișierul 08 din Ghid).
    
    // La final, returnează arhiva...
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}