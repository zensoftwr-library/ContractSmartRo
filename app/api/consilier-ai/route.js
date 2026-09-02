import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. IMPORTĂM NOMENCLATORUL CAEN REV. 3 (Ajustează calea către fișierul tău real)
import caenRev3 from './caen_rev3.json'; 

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request) {
  try {
    const { message, history, userId } = await request.json();

    if (!message) {
      return NextResponse.json({ success: false, message: 'Mesajul utilizatorului lipsește.' }, { status: 400 });
    }

    // 1. Verificarea limitelor utilizatorului
    if (userId) {
      const { data: profil } = await supabase
        .from('profiles')
        .select('subscription_tier, ai_messages_consumed')
        .eq('id', userId)
        .single();

      if (profil && ['founder', 'pro'].includes(profil.subscription_tier)) {
        const limitaAnualaMesaje = 5000;
        if ((profil.ai_messages_consumed || 0) >= limitaAnualaMesaje) {
          return NextResponse.json({ 
            success: false, 
            message: 'Ați atins limita anuală de protecție (5.000 interogări). Contactați asistența.' 
          }, { status: 429 });
        }
        
        await supabase
          .from('profiles')
          .update({ ai_messages_consumed: (profil.ai_messages_consumed || 0) + 1 })
          .eq('id', userId);
      }
    }

    // A. RAG cu Supabase (Vector Search)
    const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const embeddingResult = await embeddingModel.embedContent(message);
    const queryEmbedding = embeddingResult.embedding.values;

    const { data: contextLegal } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.75, 
      match_count: 3
    });

    let contextText = "";
    if (contextLegal && contextLegal.length > 0) {
      contextText = "CONTEXT LEGISLATIV EXTRAS (Folosește aceste informații pentru a răspunde):\n";
      contextLegal.forEach(doc => {
        contextText += `- ${doc.continut}\n`;
      });
    } else {
      contextText = "Nu s-au găsit actualizări specifice în baza de date. Răspunde folosind cunoștințele tale generale despre legislația din România.";
    }

    // 2. CONFIGURAREA PROMPT-ULUI DE SISTEM (Cu injecție CAEN Rev. 3)
    // Am transformat JSON-ul în string pentru a fi procesat de AI
    const caenContextData = JSON.stringify(caenRev3);

    const systemInstruction = `Ești "Consilierul Smart AI", un asistent virtual dinamic și agil, specializat exclusiv în legislație comercială (Codul Civil), contracte B2B, prestări servicii, freelancing și birocrație auto din România.
    
    REGULI ABSOLUTE DE OPERARE (Nerespectarea este interzisă):
    
    1. ROL ȘI TON: NU ești un magistrat. Ești un consultant de business orientat spre soluții sigure. Răspunde concis, profesionist, folosește liste cu bife (•) și explică mereu avantajul practic al clauzelor. (Reține cotele actualizate: TVA 21%, Impozit 16%, Dividende 10%).
    2. INTEROGAREA SURSELOR OFICIALE: Bazează-ți răspunsurile EXCLUSIV pe legislația în vigoare de la: Monitorul Oficial, Codul Civil/Fiscal, ANAF, MAI, DRPCIV, DITL, RAR, ASF, ORDA, ANSPDCP și ITM.
    3. CITARE EXACTĂ ȘI LINK-URI: Dacă informația există, oferă baza legală exactă (Lege, Articol). Include link-uri reale către sursele oficiale (ex: legislatie.just.ro, anaf.ro, drpciv.ro). NU genera link-uri inventate sau sparte.
    4. ZERO HALUCINAȚII (ANTI-INVENȚIE): Dacă utilizatorul întreabă ceva nereglementat sau în afara bazei tale, NU inventa. Răspunde strict: "Informația solicitată nu poate fi confirmată în mod cert în baza mea de date. Vă recomand să verificați procedura direct la [Nume Instituție] sau cu un specialist."
    5. PROTECȚIE LEGALĂ (DISCLAIMER): La finalul oricărui răspuns procedural sau juridic, adaugă obligatoriu: "Notă: Informațiile au caracter de ghidaj administrativ. Platforma ContractSmart nu își asumă răspunderea pentru posibile modificări legislative de ultimă oră. Recomandăm validarea spețelor complexe cu un expert."
    
    6. NOMENCLATOR CAEN REV. 3 (NOU): Ai interdicție strictă să folosești cunoștințele tale generale despre vechile coduri CAEN. Când un utilizator cere recomandări de coduri CAEN, TREBUIE să cauți și să extragi codurile EXCLUSIV din această listă de mai jos (Rev. 3).
    
    --- BAZĂ DE DATE CAEN REV. 3 ---
    ${caenContextData}
    --- SFÂRȘIT BAZĂ DE DATE CAEN ---

    BAZEAZĂ-TE ÎN PRIMUL RÂND pe următorul context legislativ extras din Monitorul Oficial pentru a răspunde la alte spețe:
    
    ${contextText}`;

    // 3. Formatarea istoricului
    const contents = [];
    if (history && history.length > 0) {
      history.forEach(msg => {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      });
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    // 4. Generarea răspunsului cu CASCADĂ (Fallback)
    let result;
    try {
      const primaryModel = genAI.getGenerativeModel({ 
        model: "gemini-3.7-flash",
        systemInstruction: { parts: [{ text: systemInstruction }] }
      });
      result = await primaryModel.generateContent({ contents: contents });
      
    } catch (primaryError) {
      console.warn("[Cascadă AI] Modelul 3.7 e suprasolicitat. Trecem automat pe 3.6. Motiv:", primaryError.message);
      
      const fallbackModel = genAI.getGenerativeModel({ 
        model: "gemini-3.6-flash",
        systemInstruction: { parts: [{ text: systemInstruction }] }
      });
      result = await fallbackModel.generateContent({ contents: contents });
    }

    let raspunsAI = result.response.text();
    raspunsAI += `\n\n---\n⚠️ **Notă:** *S-au interogat sursele oficiale pentru acuratețe. Informațiile au caracter de ghidaj administrativ. Platforma ContractSmart nu își asumă răspunderea pentru posibile modificări legislative de ultimă oră. Recomandăm validarea spețelor complexe cu un expert.*`;

    return NextResponse.json({ success: true, response: raspunsAI });

  } catch (error) {
    console.error("Crash critic API Consilier AI:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}