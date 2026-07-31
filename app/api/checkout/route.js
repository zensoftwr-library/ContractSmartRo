import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { userEmail, userId, tipProdus, template_id } = await req.json();

    let storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    let variantId = ""; 
    let pretCustom = 0;

    // Maparea exactă a prețurilor și pachetelor din modelul financiar 2026
    switch(tipProdus) {
      case 'founder':
        variantId = process.env.LEMON_VARIANT_LIFETIME || "variant_founder_199";
        pretCustom = 19900; // exprimat în cenți
        break;
      case 'pro':
        variantId = process.env.LEMON_VARIANT_PRO || "variant_pro_69_monthly";
        pretCustom = 6900;
        break;
      case 'contract_auto':
        variantId = process.env.LEMON_VARIANT_AUTO || "variant_auto_99";
        pretCustom = 9900;
        break;
      case 'auto_report':
        variantId = process.env.LEMON_VARIANT_RAR || "variant_rar_19";
        pretCustom = 1900;
        break;
      case 'auto_anaf':
        variantId = process.env.LEMON_VARIANT_ANAF || "variant_anaf_19";
        pretCustom = 1900;
        break;
      case 'one_time_contract': // PAYWALL-ul pentru 1 singur contract B2B
        variantId = process.env.LEMON_VARIANT_ONE_TIME || "variant_19";
        pretCustom = 1900;
        break; 
      case 'sabloane': 
        variantId = process.env.LEMON_VARIANT_SABLON_FIX || "variant_sablon_49";
        pretCustom = 4900;
        break;
      default:
        variantId = process.env.LEMON_VARIANT_PRO || "variant_pro_69_monthly";
        pretCustom = 6900;
    }

    // Apel securizat către API-ul oficial LemonSqueezy
    const responseLemon = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json'
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: userEmail,
              custom: { user_id: userId, product_id: template_id || tipProdus }
            }
          },
          relationships: {
            store: { data: { type: "stores", id: storeId.toString() } },
            variant: { data: { type: "variants", id: variantId.toString() } }
          }
        }
      })
    }).then(res => res.json()).catch(() => null);

    if (!responseLemon || !responseLemon.data) {
      throw new Error("Eroare la inițierea plății LemonSqueezy. Verificați conexiunea cu procesatorul de plăți.");
    }

    return NextResponse.json({ success: true, redirectUrl: responseLemon.data.attributes.url });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}