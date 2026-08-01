import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req) {
  try {
    const { cui, userId } = await req.json();
    
    if (!cui || cui.toString().trim() === '') {
      return NextResponse.json({ success: false, error: "Codul CUI este obligatoriu." }, { status: 400 });
    }

    const curatCui = cui.toString().replace(/[^0-9]/g, '');
    const dataAzi = new Date().toISOString().split('T')[0];

    // Verificare drepturi abonament în Supabase
    let areDrepturi = false;
    if (userId) {
      const { data: profil } = await supabase.from('profiles').select('subscription_tier, subscription_status').eq('id', userId).single();
      const { data: achizitie } = await supabase.from('user_purchases').select('id').eq('user_id', userId).eq('product_id', 'auto_report').single();
      
      if ((profil && profil.subscription_status === 'active' && (profil.subscription_tier === 'founder' || profil.subscription_tier === 'pro')) || achizitie) {
        areDrepturi = true;
      }
    }

    // Interogare directă la noul API oficial ANAF V9
    const anafResponse = await fetch('https://webservicesp.anaf.ro/PlatitorTvaRest/api/v9/ws/tva', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ cui: parseInt(curatCui, 10), data: dataAzi }])
    });

    if (!anafResponse.ok) {
      throw new Error("Eroare de comunicare la serverul ANAF");
    }

    const anafJson = await anafResponse.json();

    if (!anafJson || !anafJson.found || anafJson.found.length === 0) {
      return NextResponse.json({ success: false, error: "CUI-ul interogat nu a fost găsit în baza de date a Ministerului Finanțelor." }, { status: 404 });
    }

    const infoFirma = anafJson.found[0];
    const dateGenerale = infoFirma.date_generale || {};

    return NextResponse.json({
      success: true,
      necesita_plata: !areDrepturi,
      date: {
        cui: curatCui,
        denumire: dateGenerale.denumire || "Denumire indisponibilă",
        statusTva: infoFirma.inregistrare_scop_Tva?.scpTVA ? "Plătitor de TVA" : "Neplătitor de TVA",
        stareInactivitate: dateGenerale.stare_inregistrare?.includes("INACTIV") ? "INACTIVĂ FISCAL" : "ACTIVĂ",
        adresaSediu: dateGenerale.adresa || "Adresă nespecificată",
        detalii_premium: areDrepturi ? {
          formaJuridica: dateGenerale.forma_juridica || "Nespecificat",
          organFiscal: dateGenerale.organFiscalCompetent || "Nespecificat",
          stareInregistrare: dateGenerale.stare_inregistrare || "ACTIV",
          data1: dateGenerale.data_inregistrare || "-"
        } : null
      }
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}