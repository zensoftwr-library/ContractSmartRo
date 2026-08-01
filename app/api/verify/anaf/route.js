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

    let areDrepturi = false;
    if (userId) {
      const { data: profil } = await supabase.from('profiles').select('subscription_tier, subscription_status').eq('id', userId).single();
      const { data: achizitie } = await supabase.from('user_purchases').select('id').eq('user_id', userId).eq('product_id', 'auto_report').single();
      
      if ((profil && profil.subscription_status === 'active' && (profil.subscription_tier === 'founder' || profil.subscription_tier === 'pro')) || achizitie) {
        areDrepturi = true;
      }
    }

    // Interogăm prin API-ul public validat care ocolește protecția anti-scraping a ANAF pe VPS
    const response = await fetch(`https://pre-prod.openapi.ro/api/companies/${curatCui}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ContractSmart'
      }
    }).catch(() => null);

    if (!response || !response.ok) {
      // Fallback secundar peregistrul public open-data ANAF direct
      const altResponse = await fetch(`https://anaf.かに.ro/api/v1/pesh/cui/${curatCui}`);
      if (!altResponse.ok) {
        return NextResponse.json({ success: false, error: "CUI negăsit sau eroare de rețea ANAF." }, { status: 404 });
      }
      const altJson = await altResponse.json();
      const gen = altJson.date_generale || {};
      return NextResponse.json({
        success: true,
        necesita_plata: !areDrepturi,
        date: {
          cui: curatCui,
          denumire: gen.denumire || `Firma CUI ${curatCui}`,
          statusTva: altJson.inregistrare_scop_tva?.scptva ? "Plătitor de TVA" : "Neplătitor de TVA",
          stareInactivitate: gen.stare_inregistrare || "ACTIVĂ",
          adresaSediu: gen.adresa_sediu_social || "România",
          detalii_premium: areDrepturi ? {CUI: curatCui, stare: "ACTIV"} : null
        }
      });
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      necesita_plata: !areDrepturi,
      date: {
        cui: curatCui,
        denumire: data.name || data.denumire || `Firma CUI ${curatCui}`,
        statusTva: data.vat ? "Plătitor de TVA" : "Neplătitor de TVA",
        stareInactivitate: data.state || data.stare || "ACTIVĂ",
        adresaSediu: data.address || data.adresa || "România",
        detalii_premium: areDrepturi ? {
          tva: data.vat,
          stare: data.state,
          adresa: data.address
        } : null
      }
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}