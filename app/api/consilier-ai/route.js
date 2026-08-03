import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Inițializăm Gemini API cu cheia din .env
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

    // ==========================================
    // INCEPUT SISTEM RAG CU GEMINI EMBEDDINGS
    // ==========================================

    // A. Transformăm întrebarea într-un vector numeric
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const embeddingResult = await embeddingModel.embedContent(message);
    const queryEmbedding = embeddingResult.embedding.values;

    // B. Căutăm în Supabase cele mai relevante 3 articole de lege
    const { data: contextLegal } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.75, 
      match_count: 3
    });

    // C. Formatăm contextul găsit pentru a-l injecta în creierul AI-ului
    let contextText = "";
    if (contextLegal && contextLegal.length > 0) {
      contextText = "CONTEXT LEGISLATIV EXTRAS (Folosește aceste informații pentru a răspunde):\n";
      contextLegal.forEach(doc => {
        contextText += `- ${doc.continut}\n`;
      });
    } else {
      contextText = "Nu s-au găsit actualizări specifice în baza de date. Răspunde folosind cunoștințele tale generale despre legislația din România.";
    }

    // ==========================================
    // SFÂRȘIT SISTEM RAG
    // ==========================================

    // 2. Configurarea Prompt-ului de Sistem (acum include și RAG)
    const systemInstruction = `Ești "Consilierul Smart AI", un asistent virtual dinamic și agil, specializat exclusiv în legislație comercială (Codul Civil curent), contracte B2B, prestări servicii, freelancing și birocrație auto din România.
    
    Reguli absolute de operare:
    1. NU ești un magistrat. Ești un consultant de business orientat spre soluții rapide și sigure.
    2. Răspunde concis, folosește liste cu bife (•).
    3. Explică avantajul practic al clauzelor.
    4. Păstrează un ton amabil, profesionist și răspunde strict în limba română. (Reține: TVA standard este 21%, Impozit 16%, Dividende 10%).
    5. BAZEAZĂ-TE ÎN PRIMUL RÂND pe următorul context legislativ extras din Monitorul Oficial pentru a răspunde:
    
    ${contextText}`;

    // 3. Inițializăm modelul tău preferat (gemini-3.5-flash) și îi dăm instrucțiunile
    const chatModel = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      systemInstruction: { parts: [{ text: systemInstruction }] }
    });

    // 4. Formatarea istoricului pentru Gemini
    const contents = [];
    if (history && history.length > 0) {
      history.forEach(msg => {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      });
    }
    
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // 5. Generarea răspunsului final
    const result = await chatModel.generateContent({
      contents: contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 800
      }
    });

    let raspunsAI = result.response.text();
    raspunsAI += `\n\n---\n⚠️ DISCLAIMER: Informații cu caracter orientativ bazate pe legislația din România. Nu reprezintă consultanță juridică formală.`;

    return NextResponse.json({ success: true, response: raspunsAI });

  } catch (error) {
    console.error("Crash critic API Consilier AI:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}