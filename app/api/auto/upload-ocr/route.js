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

    // 1. Pregătim FormData pentru OCR.space
    const ocrFormData = new FormData();
    ocrFormData.append('apikey', process.env.OCR_SPACE_API_KEY);
    ocrFormData.append('language', 'ron'); // Setăm limba română
    ocrFormData.append('file', file);
    ocrFormData.append('isOverlayRequired', 'false');

    // 2. Apelăm API-ul OCR.space
    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: ocrFormData
    });

    const ocrResult = await ocrResponse.json();
    
    if (ocrResult.IsErroredOnProcessing) {
      throw new Error(ocrResult.ErrorMessage || "Eroare OCR.space");
    }

    // 3. Extragem textul unit
    const text = ocrResult.ParsedResults?.[0]?.ParsedText || '';

    // 4. Extragere date cu logica ta
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
      extractedData = {
        autoNumeVanzator: "Verifică document",
        autoCnpVanzator: cnpMatch ? cnpMatch[1] : "",
        autoAdresaVanzator: "Verifică document"
      };
    }

    return NextResponse.json({ success: true, extractedData });

  } catch (err) {
    console.error("[Eroare OCR.space]:", err.message);
    return NextResponse.json({ success: false, error: err.message });
  }
}