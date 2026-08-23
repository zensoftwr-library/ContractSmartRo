import { NextResponse } from 'next/server';

function formateazaStare(stareOriginala, regCom, dataCompleta) {
  let stare = stareOriginala || 'ÎNREGISTRAT';
  if (stare.toUpperCase().includes('ACTIV') || stare.toUpperCase().includes('INREGISTRAT') || !stare.toUpperCase().includes('INACTIV')) {
    if (dataCompleta) return `ACTIV FISCAL (din ${dataCompleta})`;
    const anMatch = regCom ? regCom.match(/(19|20)\d{2}/) : null;
    if (anMatch) return `ACTIV FISCAL (din ${anMatch[0]})`;
    return `ACTIV FISCAL`;
  }
  return stare;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cui = searchParams.get('cui');

  if (!cui) return NextResponse.json({ success: false, message: 'CUI lipsă' }, { status: 400 });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    // 🚀 PASUL 1: Microserviciul Local (Doar date rapide)
    try {
      const resPrimary = await fetch(`http://localhost:3001/api/v1/firma/${cui}`, { signal: controller.signal });
      if (resPrimary.ok) {
        clearTimeout(timeoutId);
        const result = await resPrimary.json();
        const data = result.data || {};
        return NextResponse.json({
          success: true, source: 'local-microservice',
          data: {
            denumire: data.denumire || data.nume || '', cui: cui, regCom: data.regCom || data.nr_reg_com || '',
            adresa: data.adresa || '', stare: formateazaStare(data.stare, data.regCom || data.nr_reg_com, data.data_inregistrare), 
            administrator: data.administrator || data.reprezentant || ''
          }
        });
      }
    } catch (err) {}
    clearTimeout(timeoutId);

    // 🚀 PASUL 2: Fallback pe Lista-Firme.info (Open-Source, Gratuit, cu Reprezentanți!)
    try {
      const resFreeApi = await fetch(`https://lista-firme.info/api/v1/info?cui=${cui}`);
      if (resFreeApi.ok) {
        const dataFree = await resFreeApi.json();
        let administratorFree = '';
        
        // Extragem reprezentanții din structura lor (baza data.gov.ro)
        if (dataFree.reprezentanti_legali && dataFree.reprezentanti_legali.length > 0) {
          administratorFree = dataFree.reprezentanti_legali.map(r => r.nume).join(', ');
        } else if (dataFree.reprezentanti && dataFree.reprezentanti.length > 0) {
          administratorFree = dataFree.reprezentanti.map(r => r.nume).join(', ');
        }

        return NextResponse.json({
          success: true, source: 'lista-firme-gratis',
          data: {
            denumire: dataFree.nume || dataFree.denumire || '',
            cui: cui,
            regCom: dataFree.numar_reg_com || dataFree.nr_reg_com || '',
            adresa: dataFree.adresa || '',
            stare: formateazaStare(dataFree.stare || 'ACTIV', dataFree.numar_reg_com, null),
            administrator: administratorFree
          }
        });
      }
    } catch (e) {
      console.warn("[CUI API] Lista-Firme gratuit a picat. Trecem la Premium.");
    }

    // 🚀 PASUL 3: Fallback Premium pe OpenAPI
    const openApiKey = process.env.OPENAPI_API_KEY;
    if (openApiKey) {
      try {
        const resOpenApi = await fetch(`https://api.openapi.ro/api/companies/${cui}`, { headers: { 'x-api-key': openApiKey } });
        if (resOpenApi.ok) {
          const data = await resOpenApi.json();
          let administrator = '';
          if (data.reprezentanti && data.reprezentanti.length > 0) administrator = data.reprezentanti.map(r => r.nume).join(', ');
          
          return NextResponse.json({
            success: true, source: 'openapi-premium',
            data: {
              denumire: data.denumire || '', cui: data.cif || cui, regCom: data.numar_reg_com || '',
              adresa: data.adresa || '', stare: formateazaStare(data.stare, data.numar_reg_com, data.data_inregistrare),
              administrator: administrator
            }
          });
        }
      } catch (e) {}
    }

    return NextResponse.json({ success: false, message: 'Firma nu a fost găsită în nicio bază.' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}