import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token || token.trim() === '') {
      return NextResponse.json({ success: false, message: 'Token lipsă sau invalid.' }, { status: 400 });
    }

    // Interogare strictă în tabelul de producție din Supabase
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('token_semnare_client', token)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, message: 'Documentul nu a fost găsit sau a expirat.' }, { status: 404 });
    }

    // Verificare securitate: prevenirea accesului dacă starea documentului este compromisă
    if (data.status === 'anulat') {
      return NextResponse.json({ success: false, message: 'Acest contract a fost anulat de către emitent.' }, { status: 410 });
    }

    return NextResponse.json({ success: true, contract: data });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}