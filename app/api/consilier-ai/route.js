import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request) {
  try {
    const { message, history, userId } = await request.json();

    if (!message) {
      return NextResponse.json({ success: false, message: 'Mesajul utilizatorului lipsește.' }, { status: 400 });
    }

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

    const systemInstruction = `Ești "Consilierul Smart AI", un asistent virtual dinamic și agil, specializat exclusiv în legislație comercială (Codul Civil curent), contracte B2B, prestări servicii, freelancing și birocrație auto din România.
    
    Reguli absolute de operare:
    1. NU ești un magistrat. Ești un consultant de business orientat spre soluții rapide și sigure.
    2. Răspunde concis, folosește liste cu bife (•).
    3. Explică avantajul practic al clauzelor.
    4. Păstrează un ton amabil, profesionist și răspunde strict în limba română. (Reține: TVA standard este 21%)`;

    // ACTUALIZARE MODEL AICI
    const model = ai.getGenerativeModel({ 
      model: 'gemini-1.5-pro-latest',
      systemInstruction: systemInstruction 
    });

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

    const result = await model.generateContent({
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