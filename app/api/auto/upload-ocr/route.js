import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const tipDocument = formData.get('tipDocument');

    if (!file) return NextResponse.json({ success: false, error: 'Lipsă fișier' });

    // 1. Salvare în Supabase Storage (Funcționează peste tot)
    const fileName = `${Date.now()}-${file.name}`;
    let publicUrl = '';
    try {
      const { error } = await supabase.storage.from('auto-documents').upload(fileName, file);
      if (!error) {
        const urlObj = supabase.storage.from('auto-documents').getPublicUrl(fileName);
        publicUrl = urlObj.data?.publicUrl || '';
      }
    } catch (e) {
      console.log("Supabase storage skip pe local dacă nu e configurat");
    }

    // 2. VERIFICARE MEDIU: Dacă suntem local, trimitem datele tale REALE de test pe care le configurezi mai jos
    const isLocal = process.env.NODE_ENV === 'development' || !process.env.VERCEL;
    
    if (isLocal) {
      console.log(`[DEVELOPMENT] Validare locală pentru ${tipDocument}. Returnăm datele tale reale de test.`);
      
      const extractedData = tipDocument === 'civ'
        ? { 
            autoVin: "WBA1A110X0V123456", // SCHIMBĂ CU SERIA TA REALĂ DE CIV PENTRU TESTE
            autoMarcaModel: "BMW Seria 1",
            autoNumarInmatriculare: "BV 99 ABC" 
          }
        : { 
            autoNumeVanzator: "POPESCU IONUT", // SCHIMBĂ CU NUMELE TĂU REAL PENTRU TESTE
            autoCnpVanzator: "1850102123456",   // SCHIMBĂ CU CNP-UL TĂU REAL PENTRU TESTE
            autoAdresaVanzator: "Str. Principală Nr. 10, Brașov" // ADRESA TA REALĂ
          };

      return NextResponse.json({ success: true, fileUrl: publicUrl, extractedData });
    }

    // 3. CODUL DE PRODUCȚIE (Rulează DOAR pe Vercel, unde internetul și DNS-ul sunt curate)
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const base64Image = `data:${file.type};base64,${fileBuffer.toString('base64')}`;
    
    let promptSpecific = tipDocument === 'civ'
      ? `Return STRICTLY a JSON object: {"autoVin": "17 chars VIN", "autoMarcaModel": "brand model", "autoNumarInmatriculare": "plate"}`
      : `Return STRICTLY a JSON object: {"autoNumeVanzator": "FULL NAME", "autoCnpVanzator": "13 DIGITS CNP", "autoAdresaVanzator": "ADDRESS"}`;

    const response = await fetch("https://api-inference.huggingface.co/models/Qwen/Qwen2.5-VL-7B-Instruct", {
      headers: { 
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`, 
        "Content-Type": "application/json" 
      },
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: [{ type: "text", text: promptSpecific }, { type: "image_url", image_url: { url: base64Image } }] }],
        max_tokens: 300
      })
    });

    if (!response.ok) throw new Error(`HF Cloud Error: ${response.status}`);

    const result = await response.json();
    const textBrut = result.choices?.[0]?.message?.content || '{}';
    const jsonMatch = textBrut.match(/\{[\s\S]*\}/);
    const extractedData = jsonMatch ? JSON.parse(jsonMatch[0].trim()) : {};

    // --- 4. SCRIPTUL DE CURĂȚENIE SUPREMĂ (AUTO-DELETE SUPABASE) ---
    // Ștergem fișierul din Supabase fix în secunda în care am extras textul!
    if (fileName && !isLocal) {
      await supabase.storage.from('auto-documents').remove([fileName]);
      console.log(`[GDPR CLEANUP] Poza ${fileName} a fost ștearsă definitiv.`);
    }

    return NextResponse.json({ success: true, fileUrl: publicUrl, extractedData });

  } catch (err) {
    // --- 5. DATA MASKING (CENZURARE LOG-URI) ---
    let errorMessage = err.message || String(err);
    
    // Cenzurare CNP (lasă primele 3 cifre, ascunde restul de 10)
    errorMessage = errorMessage.replace(/\b([1-9]\d{2})\d{10}\b/g, '$1**********');
    
    // Cenzurare Serie Șasiu (lasă primele 3, ascunde restul de 14)
    errorMessage = errorMessage.replace(/\b([A-HJ-NPR-Z0-9]{3})[A-HJ-NPR-Z0-9]{14}\b/gi, '$1**************');
    
    console.error("[Eroare Mascată GDPR]:", errorMessage);
    
    // Nu trimitem detalii tehnice în frontend, dăm o eroare generică:
    return NextResponse.json({ success: false, error: "Eroare de procesare. Datele au fost protejate." });
  }
}