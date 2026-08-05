import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { tipProdus, userEmail, userId } = body;

    const API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
    const STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID;

    // MAPARE EXACTĂ PE CELE 8 PRODUSE PUBLISHED
    const variants = {
      'one_time_contract': process.env.LEMON_VARIANT_ONE_TIME, // 19 RON
      'contract_auto': process.env.LEMON_VARIANT_AUTO, // 99 RON
      'sabloane': process.env.LEMON_VARIANT_SABLON_FIX, // 49 RON
      'pro': process.env.LEMON_VARIANT_PRO, // 99 RON
      'founder': process.env.LEMON_VARIANT_LIFETIME, // 999 RON
      'qr_branding': process.env.LEMON_VARIANT_QR_BRANDING, // 49 RON
      'qr_vcard': process.env.LEMON_VARIANT_QR_VCARD, // 69 RON
      'qr_dynamic': process.env.LEMON_VARIANT_QR_DYNAMIC // 39 RON
    };

    const variantId = variants[tipProdus];
    if (!variantId) throw new Error("Produs invalid.");

    const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: { custom: { user_id: userId ? String(userId) : 'anonim', product_id: tipProdus } }
          },
          relationships: {
            store: { data: { type: "stores", id: STORE_ID } },
            variant: { data: { type: "variants", id: variantId.toString() } }
          }
        }
      })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.errors?.[0]?.detail || "Eroare LemonSqueezy");

    return NextResponse.json({ success: true, redirectUrl: json.data.attributes.url });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}