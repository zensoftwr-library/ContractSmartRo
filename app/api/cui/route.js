import { NextResponse } from 'next/server';

// 🛠️ Funcție inteligentă care extrage ANUL din RegCom dacă firma e Activă
function formateazaStare(stareOriginala, regCom) {
  let stare = stareOriginala || 'ÎNREGISTRAT';
  
  if (stare.toUpperCase().includes('ACTIV') && !stare.toUpperCase().includes('INACTIV')) {
    // Căutăm orice an care începe cu 19.. sau 20.. în numărul de RegCom (ex: J.../2013)
    const anMatch = regCom ? regCom.match(/(19|20)\d{2}/) : null;
    if (anMatch) {
      return `ACTIV FISCAL (din ${anMatch[0]})`;
    }
    return `ACTIV FISCAL`;
  }
  
  return stare;
}

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
            stare: formateazaStare(data.stare, data.regCom || data.nr_reg_com), 
            administrator: data.administrator || data.reprezentant || ''
          }
        });
      }
    } catch (err) {
      console.warn(`[CUI API] Nu s-a găsit în DB local CUI: ${cui}. Trecem la DemoANAF...`);
    }
    clearTimeout(timeoutId);

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
            stare: formateazaStare(dateFirma.stare, dateFirma.regCom),
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
            stare: formateazaStare(data.stare, data.nr_reg_com),
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