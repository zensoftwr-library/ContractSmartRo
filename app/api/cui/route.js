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

    // 🚀 PASUL 2: Fallback pe FirmeAPI.ro (Limita de 100/zi)
    // Se execută DOAR dacă Pasul 1 a picat sau a dat eroare 404
    const apiKey = process.env.FIRMEAPI_KEY; // Cheia ta gratuită din .env.local
    
    const resSecondary = await fetch(`https://api.firmeapi.ro/v1/firme/${cui}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    if (resSecondary.ok) {
      const data = await resSecondary.json();
      return NextResponse.json({
        success: true,
        source: 'firmeapi-fallback',
        data: {
          denumire: data.nume,
          cui: data.cui,
          regCom: data.numar_inmatriculare,
          adresa: `${data.adresa.judet}, ${data.adresa.localitate}`,
          stare: data.stare
        }
      });
    }

    // 🛑 Dacă absolut ambele au picat
    return NextResponse.json({ 
      success: false, 
      message: 'Firma nu a putut fi extrasă automat. Te rugăm să completezi manual.' 
    }, { status: 404 });

  } catch (error) {
    return NextResponse.json({ success: false, message: 'Eroare internă de server.' }, { status: 500 });
  }
}