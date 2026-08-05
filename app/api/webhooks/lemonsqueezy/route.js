import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    const signature = request.headers.get('x-signature');

    if (!signature || !secret) {
      return NextResponse.json({ success: false, message: 'Semnătură sau secret lipsă.' }, { status: 401 });
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const hmacHeader = Buffer.from(signature, 'utf8');

    if (digest.length !== hmacHeader.length || !crypto.timingSafeEqual(digest, hmacHeader)) {
      return NextResponse.json({ success: false, message: 'Semnătură webhook invalidă.' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    
    const customData = payload.meta.custom_data; 
    const userId = customData?.user_id;
    const tipProdus = customData?.product_id; 
    const templateId = customData?.template_id; 

    if (!userId || userId === 'anonim') {
      return NextResponse.json({ success: true, message: 'Eveniment ignorat (user anonim).' });
    }

    if (eventName === 'order_created' || eventName === 'subscription_created') {
      // --- CONTRACTE / SĂBLOANE / AUTO ---
      if (tipProdus === 'contract_auto') {
        await supabase.rpc('increment_auto_credits', { user_id: userId, quantity: 1 });
      } 
      else if (tipProdus === 'one_time_contract') {
        await supabase.rpc('add_cr', { u: userId });
      }
      else if (tipProdus === 'sabloane' && templateId) {
        await supabase.from('user_purchases').insert([{ user_id: userId, product_id: templateId }]);
      }
      
      // --- MEGA-QR STUDIO ---
      else if (tipProdus === 'qr_branding') {
        await supabase.from('profiles').update({ has_qr_branding: true }).eq('id', userId);
      }
      else if (tipProdus === 'qr_vcard') {
        await supabase.from('profiles').update({ has_qr_vcard: true }).eq('id', userId);
      }
      else if (tipProdus === 'qr_dynamic') {
        // Pachetul Dynamic & Analytics (39 RON) deblochează și PDF Hosting
        await supabase.from('profiles').update({ has_qr_dynamic: true, has_qr_pdf: true }).eq('id', userId);
      }

      // --- ABONAMENTE & LIFETIME ---
      else if (tipProdus === 'pro') {
        await supabase
          .from('profiles')
          .update({ 
            subscription_tier: 'pro', 
            is_pro: true,
            has_qr_dynamic: true,
            has_qr_pdf: true,
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
      }
      else if (tipProdus === 'founder') {
        await supabase
          .from('profiles')
          .update({ 
            subscription_tier: 'founder', 
            is_pro: true,
            has_qr_branding: true,
            has_qr_vcard: true,
            has_qr_dynamic: true,
            has_qr_pdf: true,
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}