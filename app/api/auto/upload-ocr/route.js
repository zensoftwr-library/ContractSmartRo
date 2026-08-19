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

    // Folosim modelul indicat de tine cu configurarea pentru JSON
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash', 
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
      ],
      // MAGIA PENTRU VITEZĂ (Răspuns nativ JSON)
      config: { 
        responseMimeType: "application/json" 
      }
    });

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