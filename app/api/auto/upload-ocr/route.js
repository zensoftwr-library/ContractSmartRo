import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const tipDocument = formData.get('tipDocument');

    if (!file) return NextResponse.json({ success: false, error: 'Lipsă fișier' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ success: false, error: 'Lipsește GEMINI_API_KEY în .env' });

    // Inițializăm SDK-ul oficial cu cheia ta AQ.
    const ai = new GoogleGenAI({ apiKey });

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString('base64');

    const promptText = tipDocument === 'civ' 
      ? "Extrage din acest CIV auto și returnează DOAR un JSON valid cu formatul: {\"autoVin\": \"seria de 17 caractere\", \"autoMarcaModel\": \"marca și modelul\", \"autoNumarInmatriculare\": \"numărul sau gol\"}" 
      : "Extrage din acest buletin românesc și returnează DOAR un JSON valid cu formatul: {\"autoNumeVanzator\": \"Numele și Prenumele complet\", \"autoCnpVanzator\": \"cnp-ul de 13 cifre\", \"autoAdresaVanzator\": \"\"}";

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: file.type || 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }
      ]
    });

    const rawText = response.text || '';

    let extractedData = {};
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      extractedData = JSON.parse(jsonMatch[0]);
    }

    return NextResponse.json({ success: true, extractedData });

  } catch (err) {
    console.error("[Eroare GoogleGenAI]:", err.message);
    return NextResponse.json({ success: false, error: err.message });
  }
}