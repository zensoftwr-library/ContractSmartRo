import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cui = searchParams.get('cui');

  if (!cui) {
    return NextResponse.json({ success: false, message: 'CUI lipsă sau invalid' }, { status: 400 });
  }

  try {
    // 🛡️ PASUL 1: Sursa Open-Source Nelimitată (Primary)
    // Folosim un controller de abort pentru a nu bloca request-ul dacă API-ul răspunde greu
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // Max 2.5 secunde așteptare

    try {
      const resPrimary = await fetch(`https://api.lista-firme.info/v1/cui/${cui}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (resPrimary.ok) {
        const data = await resPrimary.json();
        return NextResponse.json({
          success: true,
          source: 'lista-firme-os',
          data: {
            denumire: data.nume,
            cui: data.cui,
            regCom: data.nr_reg_com,
            adresa: data.adresa,
            stare: data.stare // ex: "Activ" sau "Inactiv"
          }
        });
      }
    } catch (err) {
      console.warn(`[CUI API] Sursa primară a eșuat (Timeout/Eroare) pentru CUI: ${cui}. Trecem la Fallback...`);
    }

    // 🚀 PASUL 2: Fallback pe FirmeAPI.ro
    const apiKey = process.env.FIRMEAPI_KEY; 
    
    const resSecondary = await fetch(`https://www.firmeapi.ro/api/v1/firma/${cui}`, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' }
    });

    if (resSecondary.ok) {
      const raw = await resSecondary.json();
      const data = raw.data;
      return NextResponse.json({
        success: true,
        source: 'firmeapi-fallback',
        data: {
          denumire: data.denumire,
          cui: data.cui,
          regCom: data.nr_reg_com,
          adresa: data.adresa ? `${data.adresa.judet || ''}, ${data.adresa.localitate || ''}` : '',
          stare: data.stare
        }
      });
    }

    // 🛑 Dacă absolut ambele au picat
    return NextResponse.json({ success: false, message: 'Nu a fost găsită.' }, { status: 404 });
  } catch (error) {
    console.error("[CUI ERROR]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}