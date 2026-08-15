import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cui = searchParams.get('cui');

  if (!cui) {
    return NextResponse.json({ success: false, message: 'CUI lipsă sau invalid' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // Max 2.5 secunde așteptare

    // 🕵️ Extragem administratorul în fundal din DemoANAF (microserviciul de pe portul 3002) la nivel global
    let numeAdmin = '';
    try {
      const resAdmin = await fetch(`http://localhost:3002/api/v1/demoanaf/${cui}`);
      if (resAdmin.ok) {
        const admData = await resAdmin.json();
        if (admData.data?.administrator) numeAdmin = admData.data.administrator;
      }
    } catch (e) {}

    // 🛡️ PASUL 1: Microserviciul Local (Sursa primară care rezolvă bulina roșie/verde)
    try {
      const resPrimary = await fetch(`http://localhost:3001/api/v1/firma/${cui}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (resPrimary.ok) {
        const result = await resPrimary.json();
        const data = result.data || {};
        
        return NextResponse.json({
          success: true,
          source: 'local-microservice',
          data: {
            denumire: data.denumire || data.nume || '',
            cui: cui,
            regCom: data.regCom || data.nr_reg_com || '',
            adresa: data.adresa || '',
            stare: data.stare, // Aceasta returnează "INACTIV" și activează corect bulina roșie
            administrator: numeAdmin
          }
        });
      }
    } catch (err) {
      console.warn(`[CUI API] Sursa locală a eșuat pentru CUI: ${cui}. Trecem la Fallback...`);
    }

    // 🚀 PASUL 2: Fallback pe FirmeAPI.ro
    const apiKey = process.env.FIRMEAPI_KEY; 
    
    const resSecondary = await fetch(`https://www.firmeapi.ro/api/v1/firma/${cui}`, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' }
    });

    if (resSecondary.ok) {
      const raw = await resSecondary.json();
      const data = raw.data || {};
      return NextResponse.json({
        success: true,
        source: 'firmeapi-fallback',
        data: {
          denumire: data.denumire,
          cui: data.cui,
          regCom: data.nr_reg_com,
          adresa: typeof data.adresa === 'string' ? data.adresa : (data.adresa ? `${data.adresa.judet || ''}, ${data.adresa.localitate || ''}` : ''),
          stare: data.stare,
          administrator: numeAdmin // Adăugat aici pentru a merge și pe Fallback
        }
      });
    }

    // 🛑 Dacă ambele surse pică
    return NextResponse.json({ success: false, message: 'Firma nu a fost găsită.' }, { status: 404 });
  } catch (error) {
    console.error("[CUI ERROR]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}