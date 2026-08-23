import { NextResponse } from 'next/server';

function formateazaAdresa(addr) {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  return [
    addr.street ? `Str. ${addr.street}` : '',
    addr.number ? `nr. ${addr.number}` : '',
    addr.city || '',
    addr.county || ''
  ].filter(Boolean).join(', ');
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cui = searchParams.get('cui');

  if (!cui) return NextResponse.json({ success: false, message: 'CUI lipsă' }, { status: 400 });
  const cleanCui = cui.replace(/[^0-9]/g, '');

  try {
    const resFree = await fetch(`https://lista-firme.info/api/v1/info?cui=${cleanCui}`, {
      signal: AbortSignal.timeout(4000)
    });
    
    if (resFree.ok) {
      const data = await resFree.json();
      
      if (data && data.cui) {
        let administrator = '';
        const reps = [...(data.legal_representatives || []), ...(data.natural_person_representatives || [])];
        if (reps.length > 0) {
          administrator = reps.map(r => r.nume || r.name || '').filter(Boolean).join(', ');
        }

        let stare = 'ACTIV FISCAL';
        if (data.status && data.status.details && data.status.details.description) {
          stare = data.status.details.description.toUpperCase();
        }

        return NextResponse.json({
          success: true,
          data: {
            denumire: data.name || data.denumire,
            cui: cleanCui,
            regCom: data.reg_com || data.numar_reg_com,
            adresa: formateazaAdresa(data.address),
            administrator,
            stare
          }
        });
      }
    }

    return NextResponse.json({ success: false, message: 'Firma nu a putut fi găsită.' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}