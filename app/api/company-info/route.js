import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request) {
  try {
    const body = await request.json();
    const cui = body?.cui ? body.cui.toString().replace(/[^0-9]/g, '') : '';
    const userId = body?.userId;

    if (!cui) return NextResponse.json({ success: false, message: 'CUI lipsă sau invalid.' }, { status: 400 });

    let esteCererePremium = false;

    // Backend-ul verifică singur în baza de date statutul user-ului
    if (userId) {
      const { data: profil } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      if (profil && ['founder', 'pro', 'premium'].includes(profil.subscription_tier)) {
        esteCererePremium = true;
      }
    }

    const res = await fetch(`https://api.romania-api.ro/v1/cui/${cui}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      const fin = data?.date_financiare || data?.bilant || data?.latest_financial || {};

      const adresaSediuSocial = data?.adresa || data?.adresa_sediu || data?.sediu || 'Adresă indisponibilă în registrul public';

      const raspunsFiltat = {
        success: true,
        nume: (data?.denumire || data?.nume || `Firma CUI ${cui}`).toUpperCase(),
        stare: (data?.inactiv || data?.stare === 'INACTIV') ? "INACTIVĂ ANAF" : "ACTIVĂ",
        platitor_tva: data?.platitor_tva === true || data?.tva === true,
        adresa: adresaSediuSocial,
        detalii_fiscale: {
          an_bilant: fin?.an || "2024",
          cifra_afaceri: Number(fin?.cifra_afaceri || fin?.turnover || 0),
          profit_net: Number(fin?.profit_net || fin?.net_profit || 0),
          angajati: Number(fin?.numar_mediu_angajati || fin?.employees || 0)
        }
      };

      if (esteCererePremium) {
        raspunsFiltat.detalii_premium = {
          datorii: Number(fin?.datorii || 0),
          active_imobilizate: Number(fin?.active_imobilizate || 0),
          capitaluri_proprii: Number(fin?.capitaluri_proprii || 0),
          risc_insolventa: "EVALUARE REALIZATĂ"
        };
      }

      return NextResponse.json(raspunsFiltat);
    } else {
      return NextResponse.json({ success: false, message: 'Nu s-au putut prelua datele de la ANAF. Verificați CUI-ul.' }, { status: 404 });
    }
  } catch (e) {
    console.error("Eroare la interogare pe serverul guvernamental ANAF:", e);
    return NextResponse.json({ success: false, message: 'Eroare de comunicare cu serverele ANAF.' }, { status: 500 });
  }
}