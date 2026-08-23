import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cui = searchParams.get('cui');

  if (!cui) return NextResponse.json({ success: false, message: 'CUI lipsă' }, { status: 400 });

  try {
    // 1. Încercăm prima dată varianta 100% GRATUITĂ
    const resFree = await fetch(`https://lista-firme.info/api/v1/info?cui=${cui}`);
    if (resFree.ok) {
      const data = await resFree.json();
      
      let administrator = '';
      if (data.reprezentanti_legali && data.reprezentanti_legali.length > 0) {
        administrator = data.reprezentanti_legali.map(r => r.nume).join(', ');
      }

      let stare = data.stare || 'ACTIV';
      if ((stare.toUpperCase().includes('ACTIV') || stare.toUpperCase().includes('INREGISTRAT')) && !stare.toUpperCase().includes('INACTIV')) {
        stare = `ACTIV FISCAL`;
      }

      return NextResponse.json({
        success: true,
        data: {
          denumire: data.nume || data.denumire, cui: cui, regCom: data.nr_reg_com || data.numar_reg_com,
          adresa: data.adresa, administrator: administrator, stare: stare
        }
      });
    }

    // 2. Fallback la OpenAPI doar dacă API-ul gratuit e offline
    const openApiKey = process.env.OPENAPI_API_KEY;
    if (openApiKey) {
      const res = await fetch(`https://api.openapi.ro/api/companies/${cui}`, { headers: { 'x-api-key': openApiKey } });
      if (res.ok) {
        const data = await res.json();
        let administrator = '';
        if (data.reprezentanti && data.reprezentanti.length > 0) administrator = data.reprezentanti.map(r => r.nume).join(', ');

        return NextResponse.json({
          success: true,
          data: {
            denumire: data.denumire, cui: data.cif || cui, regCom: data.numar_reg_com,
            adresa: data.adresa, administrator: administrator, stare: data.stare || 'ACTIV'
          }
        });
      }
    }
    
    return NextResponse.json({ success: false, message: 'Firma nu a putut fi găsită.' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}