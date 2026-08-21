import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');

    if (!file || !userId) {
      return NextResponse.json({ success: false, message: 'Fișier sau utilizator lipsă.' }, { status: 400 });
    }

    // 1. Verificăm creditele utilizatorului
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, credits_remaining, is_pro')
      .eq('id', userId)
      .single();

    const isPremium = ['founder', 'pro'].includes(profile?.subscription_tier?.toLowerCase()) || profile?.is_pro;
    const availableCredits = profile?.credits_remaining || 0;

    if (!isPremium && availableCredits <= 0) {
      return NextResponse.json({ success: false, needsPayment: true, message: 'Ai nevoie de credite sau plan PRO.' }, { status: 403 });
    }

    // 2. Extragem buffer-ul fișierului PDF/DOCX
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Apelăm modelul AI în cascadă (3.7 Flash -> 3.6 Flash fallback)
    const prompt = `Ești un avocat de top în România, expert în litigii comerciale și Noul Cod Civil.
    Auditează documentul atașat. Identifică riscurile ascunse, penalitățile disproporționate, și lipsa unor clauze de protecție.
    
    Răspunde STRICT cu un obiect JSON valid, folosind această structură:
    {
      "scorRisc": 8.5, 
      "rezumat": "Un rezumat scurt, de maxim 3 propoziții, despre cât de periculos e contractul.",
      "clauzeToxice": [
        {
          "titlu": "Numele problemei (ex: Penalități Disproporționate)",
          "textExtras": "Scurt citat din contract",
          "recomandare": "Cum trebuie re-negociată clauza"
        }
      ],
      "lipsuri": [
        "Ce clauze majore lipsesc complet și ar trebui adăugate."
      ]
    }`;

    const payload = [
      prompt,
      {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: file.type // application/pdf
        }
      }
    ];

    let result;
    try {
      const model37 = genAI.getGenerativeModel({ model: 'gemini-3.7-flash' });
      result = await model37.generateContent(payload);
    } catch (error37) {
      console.warn("⚠️ Gemini 3.7 Flash rate-limit. Fallback pe 3.6 Flash...", error37.message);
      const model36 = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
      result = await model36.generateContent(payload);
    }

    const responseText = result.response.text();
    
    // Curățăm JSON-ul
    const cleanJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const raportJson = JSON.parse(cleanJsonText);

    // 4. Scădem creditul dacă e cont Free
    if (!isPremium && availableCredits > 0) {
      await supabase.from('profiles').update({ credits_remaining: availableCredits - 1 }).eq('id', userId);
    }

    // 5. Salvăm istoricul auditului în Supabase
    await supabase.from('ai_audits').insert({
      user_id: userId,
      nume_fisier: file.name,
      scor_risc: raportJson.scorRisc,
      raport_json: raportJson
    });

    return NextResponse.json({ success: true, raport: raportJson });

  } catch (error) {
    console.error('Eroare AI Audit:', error);
    return NextResponse.json({ success: false, message: 'A apărut o eroare la analizarea documentului.' }, { status: 500 });
  }
}