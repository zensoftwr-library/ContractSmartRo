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
    const tipProdus = customData?.product_id; // mapat din checkout
    const templateId = customData?.template_id; 

    if (!userId || userId === 'anonim') {
      return NextResponse.json({ success: true, message: 'Eveniment ignorat (user anonim).' });
    }

    if (eventName === 'order_created' || eventName === 'subscription_created') {
      if (tipProdus === 'contract_auto') {
        await supabase.rpc('increment_auto_credits', { user_id: userId, quantity: 1 });
      } 
      else if (tipProdus === 'auto_report' || tipProdus === 'auto_anaf') {
        await supabase.rpc('increment_rar_credits', { user_id: userId, quantity: 1 });
      }
      else if (tipProdus === 'one_time_contract') {
  // Deblochează +1 contract folosind funcția RPC (evită Race Conditions)
  await supabase.rpc('add_cr', { u: userId });
}
      else if (tipProdus === 'sabloane' && templateId) {
        await supabase
          .from('user_purchases')
          .insert([{ user_id: userId, product_id: templateId }]);
      }
      else if (tipProdus === 'onrc_package') {
        await supabase
          .from('user_purchases')
          .insert([{ user_id: userId, product_id: 'onrc_package' }]);
      }
      else if (tipProdus === 'founder' || tipProdus === 'premium' || tipProdus === 'pro') {
        await supabase
          .from('profiles')
          .update({ 
            subscription_tier: tipProdus, 
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