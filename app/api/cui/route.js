import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cui = searchParams.get('cui');

  if (!cui) {
    return NextResponse.json({ success: false, message: 'CUI lipsă sau invalid' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // Mărit la 3.5s pentru siguranță la CUI nou

    // 🚀 PASUL 1: Microserviciul Local (Sursa ultra-rapidă / cauta-firma)
    try {
      const resPrimary = await fetch(`http://localhost:3001/api/v1/firma/${cui}`, {
        signal: controller.signal
      });
      
      if (resPrimary.ok) {
        clearTimeout(timeoutId);
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
            stare: (data.stare?.toUpperCase().includes('ACTIV') && !data.stare?.toUpperCase().includes('INACTIV') && (data.data_inregistrare || data.data_infiintare)) ? `ACTIV FISCAL (din ${data.data_inregistrare || data.data_infiintare})` : (data.stare || 'ÎNREGISTRAT'), 
            administrator: data.administrator || data.reprezentant || ''
          }
        });
      }
    } catch (err) {
      console.warn(`[CUI API] Nu s-a găsit în DB local CUI: ${cui}. Trecem la DemoANAF...`);
    }
    clearTimeout(timeoutId); // Curățăm timeout-ul dacă localul a eșuat curat

    // 🚀 PASUL 2: Fallback pe DemoANAF (Doar dacă e CUI nou și lipsește din baza locală)
    let numeAdmin = '';
    let dateFirma = {};
    try {
      const resAdmin = await fetch(`http://localhost:3002/api/v1/demoanaf/${cui}`);
      if (resAdmin.ok) {
        const admData = await resAdmin.json();
        dateFirma = admData.data || {};
        if (dateFirma.administrator) numeAdmin = dateFirma.administrator;
        
        return NextResponse.json({
          success: true,
          source: 'demoanaf-fallback',
          data: {
            denumire: dateFirma.denumire || '',
            cui: cui,
            regCom: dateFirma.regCom || '',
            adresa: dateFirma.adresa || '',
            stare: (dateFirma.stare?.toUpperCase().includes('ACTIV') && !dateFirma.stare?.toUpperCase().includes('INACTIV') && (dateFirma.data_inregistrare || dateFirma.data_infiintare)) ? `ACTIV FISCAL (din ${dateFirma.data_inregistrare || dateFirma.data_infiintare})` : (dateFirma.stare || 'ÎNREGISTRAT'),
            administrator: numeAdmin
          }
        });
      }
    } catch (e) {
      console.warn(`[CUI API] DemoANAF a eșuat. Trecem la FirmeAPI...`);
    }

    // 🚀 PASUL 3: Fallback final pe FirmeAPI.ro (Roata de rezervă)
    const apiKey = process.env.FIRMEAPI_KEY; 
    if (apiKey) {
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
            stare: (data.stare?.toUpperCase().includes('ACTIV') && !data.stare?.toUpperCase().includes('INACTIV') && (data.data_inregistrare || data.data_infiintare)) ? `ACTIV FISCAL (din ${data.data_inregistrare || data.data_infiintare})` : (data.stare || 'ÎNREGISTRAT'),
            administrator: numeAdmin
          }
        });
      }
    }

    // 🛑 Dacă absolut toate sursele pică
    return NextResponse.json({ success: false, message: 'Firma nu a fost găsită.' }, { status: 404 });
  } catch (error) {
    console.error("[CUI ERROR]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}