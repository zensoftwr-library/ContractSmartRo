import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) return NextResponse.json({ success: false, error: 'Lipsă fișier' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ success: false, error: 'Lipsește GEMINI_API_KEY în .env' });

    // Inițializăm SDK-ul oficial
    const ai = new GoogleGenAI({ apiKey });

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString('base64');

    // Prompt universal strict pentru Pachetul Auto
    const promptText = `Analizează acest document (poate fi Buletin, CIV, Talon auto).
    Returnează STRICT un obiect JSON cu următoarele chei (dacă o informație nu există, lasă valoarea goală ""):
    {
      "autoVin": "seria de șasiu de 17 caractere",
      "autoMarcaModel": "marca și modelul mașinii",
      "autoNumarInmatriculare": "numărul de înmatriculare",
      "numePersoana": "Numele și prenumele persoanei (fără etichete)",
      "cnpPersoana": "CNP-ul exact de 13 cifre",
      "adresaPersoana": "Adresa completă"
    }`;

    // Pregătim datele comune pentru ambele modele
    const reqContents = [
      {
        parts: [
          { text: promptText },
          {
            inlineData: { mimeType: file.type || 'image/jpeg', data: base64Image }
          }
        ]
      }
    ];

    let response;
    try {
      // 1. Încercăm prima dată cu NOUL model 3.7 Flash + Viteză Maximă
      response = await ai.models.generateContent({
        model: 'gemini-3.7-flash', 
        contents: reqContents,
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: "low" } 
        }
      });
    } catch (primaryError) {
      console.warn("[OCR Cascadă] Modelul 3.7 e suprasolicitat (503). Trecem automat pe 3.6. Motiv:", primaryError.message);
      
      // 2. Fallback: Dacă pică, trecem pe 3.6 Flash (aici nu mai punem parametrul thinkingLevel, 3.6 nu-l cunoaște)
      response = await ai.models.generateContent({
        model: 'gemini-3.6-flash', 
        contents: reqContents,
        config: { 
          responseMimeType: "application/json" 
        }
      });
    }

    const rawText = response.text || '{}';
    
    let extractedData = {};
    try {
      extractedData = JSON.parse(rawText);
    } catch (e) {
      console.error("Eroare parsare JSON Gemini:", e);
    }

    // Curățăm datele (transformăm null/undefined în string gol)
    Object.keys(extractedData).forEach(key => {
      if (!extractedData[key]) extractedData[key] = "";
    });

    return NextResponse.json({ success: true, extractedData });

  } catch (err) {
    console.error("[Eroare GoogleGenAI]:", err.message);
    return NextResponse.json({ success: false, error: err.message });
  }
}