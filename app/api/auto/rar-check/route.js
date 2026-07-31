import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req) {
  try {
    const { vin, userId } = await req.json();

    if (!vin || vin.toString().trim().length !== 17) {
      return NextResponse.json({ success: false, error: "Seria de șasiu (VIN) trebuie să aibă exact 17 caractere." }, { status: 400 });
    }

    const curatVin = vin.toString().toUpperCase().trim();

    let areDrepturi = false;
    if (userId) {
      const { data: profil } = await supabase.from('profiles').select('subscription_tier, subscription_status').eq('id', userId).single();
      const { data: achizitie } = await supabase.from('user_purchases').select('id').eq('user_id', userId).eq('product_id', 'auto_report').single();
      
      if ((profil && profil.subscription_status === 'active' && (profil.subscription_tier === 'founder' || profil.subscription_tier === 'pro')) || achizitie) {
        areDrepturi = true;
      }
    }

    return NextResponse.json({
      success: true,
      necesita_plata: !areDrepturi,
      rarReport: { itpValid: true, itpData: "14.11.2027" }, // Pentru fluxul din formular
      date: {
        vin: curatVin,
        anProductie: "2021",
        itpValid: true,
        dataExpirareItp: "14.11.2027",
        detalii_premium: areDrepturi ? {
          istoricKilometri: [
            { data: "10.12.2021", km: "45.200" },
            { data: "12.12.2023", km: "91.500" },
            { data: "24.05.2025", km: "134.000" }
          ],
          statusDaune: "Curat",
          odometruManipulat: false
        } : null
      }
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}