import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(request, { params }) {
  const { id } = params;
  
  if (!id) return NextResponse.redirect('https://contractsmart.ro');

  try {
    const { data: qr, error } = await supabase.from('qr_codes').select('*').eq('id', id).single();
    if (error || !qr) return NextResponse.redirect('https://contractsmart.ro');

    supabase.rpc('increment_qr_scan', { qr_id: id }).then();

    const userAgent = request.headers.get('user-agent') || '';
    const country = request.headers.get('x-vercel-ip-country') || 'DEFAULT';

    let destinationUrl = qr.url; 

    if (qr.type === 'smart') {
      const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
      const isAndroid = /Android/i.test(userAgent);
      
      if (isIOS && qr.ios_url) destinationUrl = qr.ios_url;
      else if (isAndroid && qr.android_url) destinationUrl = qr.android_url;
    } 
    else if (qr.type === 'geo' && qr.geo_rules) {
      const rules = typeof qr.geo_rules === 'string' ? JSON.parse(qr.geo_rules) : qr.geo_rules;
      const matchedRule = rules.find(r => r.country === country);
      const defaultRule = rules.find(r => r.country === 'DEFAULT');
      
      if (matchedRule && matchedRule.url) destinationUrl = matchedRule.url;
      else if (defaultRule && defaultRule.url) destinationUrl = defaultRule.url;
    }
    else if (qr.type === 'landing') {
      destinationUrl = `https://contractsmart.ro/l/${id}`;
    }

    return NextResponse.redirect(destinationUrl || 'https://contractsmart.ro');
    
  } catch (err) {
    return NextResponse.redirect('https://contractsmart.ro');
  }
}