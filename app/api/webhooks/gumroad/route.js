import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Folosim SERVICE_ROLE_KEY pentru puteri de Admin în Supabase
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    
    const email = params.get('email');
    const permalink = params.get('permalink'); // Ex: 'credite-starter', 'abonament-business'

    if (!email || !permalink) {
      return NextResponse.json({ success: false, message: 'Date incomplete de la Gumroad' }, { status: 400 });
    }

    // 1. Găsim ID-ul userului în Supabase pe baza email-ului
    const { data: usersData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    const user = usersData?.users?.find(u => u.email === email);

    if (!user) {
      console.error('Webhook: Userul nu a fost găsit în baza de date cu emailul:', email);
      return NextResponse.json({ success: true, message: 'User not found, dar am confirmat primirea' }, { status: 200 });
    }

    // 2. Extragem profilul curent
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('credits_remaining, subscription_tier')
      .eq('id', user.id)
      .single();

    let crediteCurente = profile?.credits_remaining || 0;

    // 3. ACTUALIZĂM CONTUL ÎN FUNCȚIE DE PRODUSUL CUMPĂRAT
    if (permalink.includes('credite-starter')) {
      // Pachet Starter: +50 credite
      await supabaseAdmin.from('profiles').update({ credits_remaining: crediteCurente + 50 }).eq('id', user.id);
    } 
    else if (permalink.includes('credite-smart')) {
      // Pachet Smart: +180 credite (cu tot cu bonus)
      await supabaseAdmin.from('profiles').update({ credits_remaining: crediteCurente + 180 }).eq('id', user.id);
    }
    else if (permalink.includes('abonament-pro')) {
      // Tiers: PRO
      await supabaseAdmin.from('profiles').update({ subscription_tier: 'pro' }).eq('id', user.id);
    }
    else if (permalink.includes('abonament-business')) {
      // Tiers: BUSINESS (Nelimitat)
      await supabaseAdmin.from('profiles').update({ subscription_tier: 'business' }).eq('id', user.id);
    }
    else if (permalink.includes('founder-lifetime')) {
      // Tiers: FOUNDER (VIP)
      await supabaseAdmin.from('profiles').update({ subscription_tier: 'founder' }).eq('id', user.id);
    }

    return NextResponse.json({ success: true, message: 'Webhook procesat cu succes' }, { status: 200 });
    
  } catch (error) {
    console.error("Eroare Webhook Gumroad:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}