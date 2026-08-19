import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const tipDocument = formData.get('tipDocument');

    if (!file) return NextResponse.json({ success: false, error: 'Lipsă fișier' });

    const apiKey = process.env.OCR_SPACE_API_KEY;
    if (!apiKey) return NextResponse.json({ success: false, error: 'Lipsește cheia OCR_SPACE_API_KEY în .env' });

    // Convertim fișierul în Base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;

    const ocrFormData = new URLSearchParams();
    ocrFormData.append('apikey', apiKey);
    ocrFormData.append('base64Image', base64Image);

    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: ocrFormData
    });

    const ocrResult = await ocrResponse.json();
    
    if (ocrResult.IsErroredOnProcessing) {
      const errMsg = Array.isArray(ocrResult.ErrorMessage) ? ocrResult.ErrorMessage.join(', ') : (ocrResult.ErrorMessage || "Eroare OCR");
      throw new Error(errMsg);
    }

    const text = ocrResult.ParsedResults?.[0]?.ParsedText || '';
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    let extractedData = {};
    if (tipDocument === 'civ') {
      const vinMatch = text.match(/\b([A-HJ-NPR-Z0-9]{17})\b/i);
      extractedData = {
        autoVin: vinMatch ? vinMatch[1].toUpperCase() : "",
        autoMarcaModel: "Verifică document",
        autoNumarInmatriculare: ""
      };
    } else {
      const cnpMatch = text.match(/\b([1-8]\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{6})\b/);
      
      // Căutare automată nume
      const ignoredWords = /ROMANIA|RO|CARTE|IDENTITATE|IDENTITY|CARD|SEX|CETATENIE|VALABILITATE|CNP|DATA|EMIS|DIRECTIA|DIRECTOR|SURNAME|SUMANE|NOM|GIVEN|GIVEO|NAMES|PRENUME|EXPIRY|BIRTH|ONTIT|CARE/i;
      
      const nameLine = lines.find(l => 
        l.length > 5 && 
        !/\d/.test(l) && 
        l.includes(' ') && 
        !l.includes('/') && // Etichetele au mereu "/" (ex: Prenume / Given names)
        !ignoredWords.test(l)
      ) || "";

      extractedData = {
        autoNumeVanzator: nameLine,
        autoCnpVanzator: cnpMatch ? cnpMatch[1] : "",
        autoAdresaVanzator: "" // Nu există pe buletinele noi
      };
    }

    return NextResponse.json({ success: true, extractedData });

  } catch (err) {
    console.error("[Eroare OCR.space]:", err.message);
    return NextResponse.json({ success: false, error: err.message });
  }
}