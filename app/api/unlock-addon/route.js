import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { userId, addonType, creditCost } = await req.json();

    if (!userId || !addonType || !creditCost) {
      return NextResponse.json({ success: false, message: 'Date incomplete' }, { status: 400 });
    }

    // 1. Luăm profilul curent al userului
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('credits_remaining, subscription_tier')
      .eq('id', userId)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ success: false, message: 'Utilizatorul nu a fost găsit în baza de date' }, { status: 404 });
    }

    const tier = (profile.subscription_tier || '').toLowerCase().trim();
    const hasBypass = ['founder', 'business'].includes(tier);

    // Dacă are bypass (Business/Founder), nu-i scădem nimic, considerăm deblocat
    if (hasBypass) {
      return NextResponse.json({ success: true, message: 'Inclus în abonament', newCredits: profile.credits_remaining }, { status: 200 });
    }

    const currentCredits = profile.credits_remaining || 0;

    if (currentCredits < creditCost) {
      return NextResponse.json({ success: false, message: 'Credite insuficiente în portofel' }, { status: 403 });
    }

    const newCredits = currentCredits - creditCost;

    // 2. Actualizăm soldul în Supabase
    const { error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update({ credits_remaining: newCredits })
      .eq('id', userId);

    if (updateErr) {
      throw new Error(updateErr.message);
    }

    // Salvăm deblocarea în tabelul de achiziții ca să rămână deblocat permanent pentru acest utilizator!
    await supabaseAdmin.from('user_purchases').insert({
      user_id: userId,
      product_id: addonType,
      amount_paid: creditCost, // Salvăm costul real în credite în loc de 0
      currency: 'CREDITS'
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Add-on deblocat cu succes', 
      newCredits 
    }, { status: 200 });

  } catch (error) {
    console.error('Eroare API unlock-addon:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}