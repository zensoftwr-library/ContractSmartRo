import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    // 1. SECURITATE: Verificăm dacă secretul din URL coincide cu cel din .env.local
    const secret = req.nextUrl.searchParams.get('secret');
    if (secret !== process.env.GUMROAD_WEBHOOK_SECRET) {
      console.error('Tentativă de plată neautorizată (Secret Invalid).');
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }

    // 2. PARSARE DATE: Gumroad trimite cereri x-www-form-urlencoded
    const formData = await req.formData();
    
    const email = formData.get('email');
    const permalink = formData.get('permalink'); // Ex: 'abonament-pro'
    let userId = formData.get('user_id'); // Preluat din Custom Field-ul ascuns

    if (!permalink || !email) {
      return NextResponse.json({ error: 'Date insuficiente primite de la Gumroad.' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 3. IDENTIFICARE USER (Fallback în caz că user_id nu a fost transmis corect pe site)
    if (!userId) {
      const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).single();
      if (profile) userId = profile.id;
    }

    // Dacă încă nu avem user, e posibil să fi cumpărat fără cont - înregistrăm log-ul, dar nu alocăm.
    if (!userId) {
      console.warn(`Plată primită pentru ${email}, dar user_id nu a fost găsit în platformă.`);
      return NextResponse.json({ success: true, message: 'Plată procesată fără alocare de cont.' });
    }

    // 4. LOGICA DE ALOCARE PRODUSE
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    const currentCredits = profile?.credits_remaining || 0;

    let updatePayload = {};

    switch(permalink) {
      case 'founder-lifetime':
        updatePayload = { subscription_tier: 'founder', is_pro: true };
        break;
      case 'abonament-pro':
        updatePayload = { subscription_tier: 'pro', is_pro: true };
        break;
      case 'pachet-acte-auto':
        // Adăugăm credite sau flag specific pentru a-l debloca
        updatePayload = { credits_remaining: currentCredits + 5 }; 
        break;
      case 'qr-vcard-pro':
        updatePayload = { has_qr_vcard: true };
        break;
      case 'qr-branding':
        updatePayload = { has_qr_branding: true };
        break;
      case 'qr-dinamic':
        updatePayload = { has_qr_dynamic: true };
        break;
      case 'contract-b2b':
        updatePayload = { credits_remaining: currentCredits + 1 };
        break;
      case 'raport-companie': // <--- AICI ESTE NOUL PRODUS ADAUGAT
        updatePayload = { credits_remaining: currentCredits + 1 };
        break;
      case 'sablon-tipizat-legal':
        await supabase.from('user_purchases').insert({ user_id: userId, product_id: 'prestari_gratuit' });
        break;
    }

    // 5. UPDATE ÎN BAZA DE DATE SUPABASE
    if (Object.keys(updatePayload).length > 0) {
      const { error } = await supabase.from('profiles').update(updatePayload).eq('id', userId);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, message: 'Plata a fost securizată și alocată cu succes!' });

  } catch (err) {
    console.error("Eroare Webhook Gumroad:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}