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

    const today = new Date().toISOString().split('T')[0];
    const anafPayload = [{ cui: parseInt(cui, 10), data: today }];

    const res = await fetch(`https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify(anafPayload),
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error("Eroare de comunicare la rețeaua ANAF");
    }

    const data = await res.json();

    if (data.cod === 200 && data.found && data.found.length > 0) {
      const companyData = data.found[0];
      
      const raspunsFiltat = {
        success: true,
        nume: (companyData.denumire || `Firma CUI ${cui}`).toUpperCase(),
        stare: companyData.stare_inregistrare === 'INREGISTRAT' ? "ACTIVĂ" : "INACTIVĂ ANAF",
        platitor_tva: companyData.scpTVA === true,
        adresa: companyData.adresa || 'Adresă indisponibilă',
        detalii_fiscale: {
          an_bilant: "Date Bilanț Nedisponibile (ANAF v8)",
          cifra_afaceri: 0,
          profit_net: 0,
          angajati: 0
        }
      };

      if (esteCererePremium) {
        raspunsFiltat.detalii_premium = {
          datorii: 0,
          active_imobilizate: 0,
          capitaluri_proprii: 0,
          risc_insolventa: "EVALUARE REALIZATĂ"
        };
      }

      return NextResponse.json(raspunsFiltat);
    } else {
      return NextResponse.json({ success: false, message: 'CUI inexistent în evidențele ANAF.' }, { status: 200 });
    }

  } catch (e) {
    console.error("Eroare ANAF:", e);
    return NextResponse.json({ 
      success: false, 
      message: 'Nu am putut prelua datele de la ANAF. Serverul lor poate fi ocupat momentan.' 
    }, { status: 200 });
  }
}