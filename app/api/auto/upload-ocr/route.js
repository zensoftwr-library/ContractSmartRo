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

    // 2. VERIFICARE MEDIU: Dacă suntem local, trimitem datele tale REALE de test
    const isLocal = process.env.NODE_ENV === 'development' || !process.env.VERCEL;
    
    if (isLocal) {
      console.log(`[DEVELOPMENT] Validare locală pentru ${tipDocument}. Returnăm datele tale reale de test.`);
      
      const extractedData = tipDocument === 'civ'
        ? { 
            autoVin: "WBA1A110X0V123456", // SCHIMBĂ CU SERIA TA REALĂ DE CIV
            autoMarcaModel: "BMW Seria 1",
            autoNumarInmatriculare: "BV 99 ABC" 
          }
        : { 
            autoNumeVanzator: "POPESCU IONUT", // SCHIMBĂ CU NUMELE TĂU REAL
            autoCnpVanzator: "1850102123456",   // SCHIMBĂ CU CNP-UL TĂU REAL
            autoAdresaVanzator: "Str. Principală Nr. 10, Brașov" // ADRESA TA REALĂ
          };

      return NextResponse.json({ success: true, fileUrl: publicUrl, extractedData });
    }

    // 3. CODUL DE PRODUCȚIE (Rulează DOAR pe Vercel) - GOOGLE CLOUD VISION
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    // Google Vision cere base64 curat, fără prefixul 'data:image/jpeg;base64,'
    const base64Image = fileBuffer.toString('base64');
    
    const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: "DOCUMENT_TEXT_DETECTION" }] // Extrage absolut tot textul + tabele + diacritice
          }
        ]
      })
    });

    if (!visionResponse.ok) throw new Error(`Google Vision API Error: ${visionResponse.status}`);

    const visionResult = await visionResponse.json();
    const textExtras = visionResult.responses?.[0]?.fullTextAnnotation?.text || '';

    // Parsăm inteligent datele esențiale din textul brut returnat de Google
    let extractedData = {};
    
    if (tipDocument === 'civ') {
      // Regex pentru seria de șasiu (17 caractere alfanumerice)
      const vinMatch = textExtras.match(/\b([A-HJ-NPR-Z0-9]{17})\b/i);
      extractedData = {
        autoVin: vinMatch ? vinMatch[1].toUpperCase() : "",
        autoMarcaModel: "Verifică document", // Va lăsa utilizatorul să valideze marca pe frontend
        autoNumarInmatriculare: ""
      };
    } else {
      // Regex exact pentru CNP românesc (13 cifre)
      const cnpMatch = textExtras.match(/\b([1-9]\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{6})\b/);
      extractedData = {
        autoNumeVanzator: "Verifică document",
        autoCnpVanzator: cnpMatch ? cnpMatch[1] : "",
        autoAdresaVanzator: "Verifică document"
      };
    }

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