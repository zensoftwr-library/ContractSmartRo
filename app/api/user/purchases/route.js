import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '' // Folosim Service Role pentru a ocoli RLS la citire securizată
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email lipsă în parametri.' }, { status: 400 });
    }

    // 1. Aflăm ID-ul utilizatorului din tabela `profiles` pe baza email-ului primit
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: true, ids: [] }); // Returnăm array gol dacă userul nu are profil creat încă
    }

    // 2. Extragem toate rândurile cumpărate la bucată din tabela `user_purchases`
    const { data: purchases, error: purchasesError } = await supabase
      .from('user_purchases')
      .select('product_id')
      .eq('user_id', profile.id);

    if (purchasesError) {
      throw new Error(purchasesError.message);
    }

    // 3. Mapăm rezultatul într-un array curat de string-uri: ['nda_premium', 'cda_premium']
    const listaIduri = purchases ? purchases.map(p => p.product_id) : [];

    return NextResponse.json({ success: true, ids: listaIduri });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}