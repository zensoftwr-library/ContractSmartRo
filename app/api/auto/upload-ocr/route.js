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

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const base64Image = fileBuffer.toString('base64');
    
    const apiKey = process.env.GEMINI_API_KEY || '';
    
    // Configurăm cererea în funcție de tipul cheii (AQ folosește Bearer, AIza folosește ?key=)
    let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent`;
    const headers = { "Content-Type": "application/json" };

    if (apiKey.startsWith('AIza')) {
      url += `?key=${apiKey}`;
    } else {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const geminiResponse = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        contents: [{
          parts: [
            { 
              text: tipDocument === 'civ' 
                ? "Analizează această imagine de CIV auto. Extrage datele și returnează DOAR un obiect JSON valid cu formatul exact: {\"autoVin\": \"seria de șasiu de 17 caractere\", \"autoMarcaModel\": \"marca și modelul mașinii\", \"autoNumarInmatriculare\": \"numărul sau gol\"}" 
                : "Analizează această imagine de buletin / carte de identitate românească. Extrage datele și returnează DOAR un obiect JSON valid cu formatul exact: {\"autoNumeVanzator\": \"numele complet\", \"autoCnpVanzator\": \"cnp-ul de 13 cifre\", \"autoAdresaVanzator\": \"adresa completă\"}" 
            },
            { 
              inline_data: { 
                mime_type: file.type || "image/jpeg", 
                data: base64Image 
              } 
            }
          ]
        }]
      })
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      throw new Error(`Gemini API Error: ${errText}`);
    }

    const geminiResult = await geminiResponse.json();
    const rawText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let extractedData = {};
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      extractedData = {};
    }

    return NextResponse.json({ success: true, extractedData });

  } catch (err) {
    console.error("[Eroare OCR Gemini]:", err.message);
    return NextResponse.json({ success: false, error: err.message });
  }
}