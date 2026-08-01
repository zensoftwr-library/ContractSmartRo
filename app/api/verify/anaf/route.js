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

    // Verificăm drepturile în baza de date Supabase (Pro/Founder sau achiziție punctuală)
    let areDrepturi = false;
    if (userId) {
      const { data: profil } = await supabase.from('profiles').select('subscription_tier, subscription_status').eq('id', userId).single();
      const { data: achizitie } = await supabase.from('user_purchases').select('id').eq('user_id', userId).eq('product_id', 'auto_report').single();
      
      if ((profil && profil.subscription_status === 'active' && (profil.subscription_tier === 'founder' || profil.subscription_tier === 'pro')) || achizitie) {
        areDrepturi = true;
      }
    }

    // Interogare OFICIALĂ, LIVE și GRATUITĂ ANAF API v8
    let dateFirma = null;
    try {
      const anafReq = await fetch('https://api.anaf.ro/PlatitorTvaRest/api/v8/ws/tva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ cui: parseInt(curatCui), data: new Date().toISOString().split('T')[0] }])
      });
      const anafRes = await anafReq.json();
      
      // Dacă ANAF a găsit firma, salvăm datele reale
      if (anafRes && anafRes.cod === 200 && anafRes.found && anafRes.found.length > 0) {
        dateFirma = anafRes.found[0];
      }
    } catch (e) {
      console.error("Eroare fetch ANAF:", e);
    }

    // Dacă ANAF nu răspunde sau nu găsește CUI-ul, returnăm eroare
    if (!dateFirma) {
        return NextResponse.json({ success: false, error: "Firma nu a fost găsită la ANAF." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      necesita_plata: !areDrepturi,
      date: {
        cui: curatCui,
        denumire: dateFirma.denumire || "Denumire indisponibilă",
        statusTva: dateFirma.scpTVA ? "Plătitor de TVA" : "Neplătitor de TVA",
        stareInactivitate: dateFirma.stare_inregistrare === "INACTIV" ? "INACTIVĂ FISCAL" : "ACTIVĂ",
        adresaSediu: dateFirma.adresa || "Adresă nespecificată",
        // Datele sensibile sunt blocate server-side dacă utilizatorul nu are cont Premium (pentru MVP lăsăm mock la premium)
        detalii_premium: areDrepturi ? {
          datorii: 14200,
          activeImobilizate: 85000,
          riscInsolventa: "MINIM (Scor A+ conform algoritmului fiscal 2026)"
        } : null
      }
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}