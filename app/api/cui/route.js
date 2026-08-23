import { NextResponse } from 'next/server';

function formateazaAdresa(addr) {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  const parti = [
    addr.street ? `Str. ${addr.street}` : '',
    addr.number ? `nr. ${addr.number}` : '',
    addr.block ? `bl. ${addr.block}` : '',
    addr.scara ? `sc. ${addr.scara}` : '',
    addr.floor ? `et. ${addr.floor}` : '',
    addr.apartment ? `ap. ${addr.apartment}` : '',
    addr.city || '',
    addr.county || ''
  ];
  return parti.filter(Boolean).join(', ');
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cui = searchParams.get('cui');

  if (!cui) {
    return NextResponse.json({ success: false, message: 'CUI lipsă sau invalid' }, { status: 400 });
  }

  const cleanCui = cui.replace(/[^0-9]/g, '');

  try {
    let denumire = '';
    let regCom = '';
    let adresa = '';
    let stare = 'ACTIV FISCAL';
    let administrator = '';

    // 🚀 PASUL 1: Luăm datele de bază și administratorii de la lista-firme.info (Gratuit)
    try {
      const resFreeApi = await fetch(`https://lista-firme.info/api/v1/info?cui=${cleanCui}`, {
        signal: AbortSignal.timeout(3500)
      });
      if (resFreeApi.ok) {
        const dataFree = await resFreeApi.json();
        if (dataFree && dataFree.cui) {
          denumire = dataFree.name || dataFree.denumire || '';
          regCom = dataFree.reg_com || dataFree.numar_reg_com || '';
          adresa = formateazaAdresa(dataFree.address);
          
          const reps = [...(dataFree.legal_representatives || []), ...(dataFree.natural_person_representatives || [])];
          if (reps.length > 0) {
            administrator = reps.map(r => r.nume || r.name || '').filter(Boolean).join(', ');
          }
        }
      }
    } catch (e) {
      console.warn("Eroare lista-firme.info:", e.message);
    }

    // 🚀 PASUL 2: Interogăm FirmeAPI pentru a obține STAREA FISCALĂ REALĂ (Inactiv/Radiat) și Bilanțuri
    const apiKey = process.env.FIRMEAPI_KEY; 
    if (apiKey) {
      try {
        const resFirme = await fetch(`https://www.firmeapi.ro/api/v1/firma/${cleanCui}`, {
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' },
          signal: AbortSignal.timeout(3500)
        });

        if (resFirme.ok) {
          const raw = await resFirme.json();
          const data = raw.data || {};
          
          if (!denumire) denumire = data.denumire || '';
          if (!regCom) regCom = data.nr_reg_com || '';
          if (!adresa) adresa = typeof data.adresa === 'string' ? data.adresa : '';

          // Verificare critică pentru starea fiscală (Inactiv / Radiat)
          if (data.status_inactiv && data.status_inactiv.inactiv) {
            const dataInactivarii = data.status_inactiv.data_inactivare || '';
            stare = dataInactivarii ? `INACTIV FISCAL (din ${dataInactivarii})` : `INACTIV FISCAL`;
          } else if (data.stare) {
            stare = data.stare.toUpperCase();
            if (stare.includes('INREGISTRAT') || stare.includes('ACTIV')) {
              const an = data.data_inregistrare ? data.data_inregistrare.substring(0, 4) : '';
              stare = an ? `ACTIV FISCAL (din ${an})` : `ACTIV FISCAL`;
            }
          }
        }
      } catch (e) {
        console.warn("Eroare FirmeAPI stare:", e.message);
      }
    }

    // Dacă nu am găsit denumirea în niciuna dintre surse
    if (!denumire) {
      return NextResponse.json({ success: false, message: 'Firma nu a fost găsită.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      source: 'combo-gratuit-firmeapi',
      data: {
        denumire,
        cui: cleanCui,
        regCom,
        adresa,
        stare,
        administrator
      }
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}