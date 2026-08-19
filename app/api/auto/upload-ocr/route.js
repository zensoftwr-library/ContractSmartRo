import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Folosește cheile dedicate de server sau le ia automat pe cele publice ca fallback
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const tipDocument = formData.get('tipDocument');

    if (!file) return NextResponse.json({ success: false, error: 'Lipsă fișier' });

    // 1. Salvare în Supabase Storage (opțională pentru backup, ignorată dacă crapă bucket-ul)
    const fileName = `${Date.now()}-${file.name}`;
    let publicUrl = '';
    try {
      const { error } = await supabase.storage.from('auto-documents').upload(fileName, file);
      if (!error) {
        const urlObj = supabase.storage.from('auto-documents').getPublicUrl(fileName);
        publicUrl = urlObj.data?.publicUrl || '';
      }
    } catch (e) {
      console.log("Supabase storage skip");
    }

    // 2. GOOGLE CLOUD VISION API
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const base64Image = fileBuffer.toString('base64');
    
    const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: "DOCUMENT_TEXT_DETECTION" }]
          }
        ]
      })
    });

    if (!visionResponse.ok) {
      const errText = await visionResponse.text();
      throw new Error(`Google Vision API Error ${visionResponse.status}: ${errText}`);
    }

    const visionResult = await visionResponse.json();
    const textExtras = visionResult.responses?.[0]?.fullTextAnnotation?.text || '';

    // 3. EXTRAGERE DATE (Regex)
    let extractedData = {};
    
    if (tipDocument === 'civ') {
      const vinMatch = textExtras.match(/\b([A-HJ-NPR-Z0-9]{17})\b/i);
      extractedData = {
        autoVin: vinMatch ? vinMatch[1].toUpperCase() : "",
        autoMarcaModel: "Verifică document",
        autoNumarInmatriculare: ""
      };
    } else {
      // Regex îmbunătățit pentru CNP românesc (13 cifre)
      const cnpMatch = textExtras.match(/\b([1-8]\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{6})\b/);
      extractedData = {
        autoNumeVanzator: "Verifică document",
        autoCnpVanzator: cnpMatch ? cnpMatch[1] : "",
        autoAdresaVanzator: "Verifică document"
      };
    }

    // 4. GDPR CLEANUP (Ștergere fișier din Supabase)
    if (fileName) {
      try {
        await supabase.storage.from('auto-documents').remove([fileName]);
      } catch(e) {}
    }

    return NextResponse.json({ success: true, fileUrl: publicUrl, extractedData });

  } catch (err) {
    console.error("[Eroare Detaliată OCR Backend]:", err.message);
    return NextResponse.json({ success: false, error: err.message || "Eroare de procesare." });
  }
}