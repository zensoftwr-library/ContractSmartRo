import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

export async function POST(req) {
try {
const formData = await req.formData();
const file = formData.get('file');
const tipDocument = formData.get('tipDocument');

if (!file) return NextResponse.json({ success: false, error: 'Lipsă fișier' });

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

const isLocal = process.env.NODE_ENV === 'development' || !process.env.VERCEL;

if (isLocal) {
  console.log(`[DEVELOPMENT] Validare locală pentru ${tipDocument}. Returnăm datele tale reale de test.`);
  
  const extractedData = tipDocument === 'civ'
    ? { 
        autoVin: "WBA1A110X0V123456",
        autoMarcaModel: "BMW Seria 1",
        autoNumarInmatriculare: "BV 99 ABC" 
      }
    : { 
        autoNumeVanzator: "POPESCU IONUT",
        autoCnpVanzator: "1850102123456",  
        autoAdresaVanzator: "Str. Principală Nr. 10, Brașov" 
      };

  return NextResponse.json({ success: true, fileUrl: publicUrl, extractedData });
}

const fileBuffer = Buffer.from(await file.arrayBuffer());
const base64Image = `data:${file.type};base64,${fileBuffer.toString('base64')}`;

let promptSpecific = tipDocument === 'civ'
  ? `Return STRICTLY a JSON object: {"autoVin": "17 chars VIN", "autoMarcaModel": "brand model", "autoNumarInmatriculare": "plate"}`
  : `Return STRICTLY a JSON object: {"autoNumeVanzator": "FULL NAME", "autoCnpVanzator": "13 DIGITS CNP", "autoAdresaVanzator": "ADDRESS"}`;

const response = await fetch("[https://api-inference.huggingface.co/models/Qwen/Qwen2.5-VL-7B-Instruct](https://api-inference.huggingface.co/models/Qwen/Qwen2.5-VL-7B-Instruct)", {
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

return NextResponse.json({ success: true, fileUrl: publicUrl, extractedData });
} catch (err) {
console.error("Eroare server:", err);
return NextResponse.json({ success: false, error: err.message });
}
}