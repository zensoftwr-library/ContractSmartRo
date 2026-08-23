import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function formateazaAdresa(addr) {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  return [
    addr.street ? `Str. ${addr.street}` : '',
    addr.number ? `nr. ${addr.number}` : '',
    addr.block ? `bl. ${addr.block}` : '',
    addr.scara ? `sc. ${addr.scara}` : '',
    addr.floor ? `et. ${addr.floor}` : '',
    addr.apartment ? `ap. ${addr.apartment}` : '',
    addr.city || '',
    addr.county || ''
  ].filter(Boolean).join(', ');
}

export async function GET(request) {
  const cui = new URL(request.url).searchParams.get('cui');
  const cleanCui = cui ? cui.replace(/[^0-9]/g, '') : '';

  if (!cleanCui || cleanCui.length < 5) {
    return NextResponse.json({ success: false, message: 'CUI invalid.' }, { status: 400 });
  }

  let dataFirma = {
    cui: cleanCui,
    denumire: '',
    regCom: '',
    adresa: '',
    stare: 'ACTIV',
    administrator: ''
  };

  let esteInactiv = false;
  const apiKey = process.env.FIRMEAPI_KEY;

  // 1. Interogare FirmeAPI.ro (Sursa sigură pentru ANAF real-time)
  if (apiKey) {
    try {
      const headers = { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' };
      const resFirma = await fetch(`https://www.firmeapi.ro/api/v1/firma/${cleanCui}`, { headers, signal: AbortSignal.timeout(3500) });
      
      if (resFirma.ok) {
        const json = await resFirma.json();
        const d = json.data || {};
        
        dataFirma.denumire = d.denumire || '';
        dataFirma.regCom = d.nr_reg_com || '';
        dataFirma.adresa = typeof d.adresa === 'string' ? d.adresa : formateazaAdresa(d.adresa_sediu_social);

        // Verificare critică starea de inactivitate ANAF
        if (d.status_inactiv && d.status_inactiv.inactiv) {
          esteInactiv = true;
          const dataInactivarii = d.status_inactiv.data_inactivare || '';
          dataFirma.stare = dataInactivarii ? `INACTIV FISCAL (din ${dataInactivarii})` : `INACTIV FISCAL`;
        } else if (d.stare) {
          dataFirma.stare = d.stare;
        }
      }
    } catch (e) {}

    // Preluare administrator pentru completare completă
    try {
      const headers = { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' };
      const resAdmin = await fetch(`https://www.firmeapi.ro/api/v1/administratori/${cleanCui}`, { headers, signal: AbortSignal.timeout(3000) });
      if (resAdmin.ok) {
        const jsonAdmin = await resAdmin.json();
        const adminiList = jsonAdmin.data || jsonAdmin.administratori || jsonAdmin || [];
        if (Array.isArray(adminiList) && adminiList.length > 0) {
          dataFirma.administrator = adminiList.map(a => a.nume || a.nume_prenume || '').filter(Boolean).join(', ');
        }
      }
    } catch (e) {}
  }

  // 2. Fallback prin listafirme.info (dacă lipsește ceva din FirmeAPI)
  if (!dataFirma.denumire) {
    try {
      const resFree = await fetch(`https://lista-firme.info/api/v1/info?cui=${cleanCui}`, { signal: AbortSignal.timeout(3500) });
      if (resFree.ok) {
        const dFree = await resFree.json();
        if (dFree && dFree.cui) {
          dataFirma.denumire = dFree.name || dFree.denumire || '';
          dataFirma.regCom = dFree.reg_com || dFree.numar_reg_com || '';
          dataFirma.adresa = formateazaAdresa(dFree.address);
          
          const reps = [...(dFree.legal_representatives || []), ...(dFree.natural_person_representatives || [])];
          if (reps.length > 0) {
            dataFirma.administrator = reps.map(r => r.nume || r.name || '').filter(Boolean).join(', ');
          }

          if (!esteInactiv && dFree.status && dFree.status.details && dFree.status.details.description) {
            dataFirma.stare = dFree.status.details.description.toUpperCase();
          }
        }
      }
    } catch (e) {}
  }

  if (!dataFirma.denumire) {
    return NextResponse.json({ success: false, message: 'Firma nu a fost găsită în registrele oficiale.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: dataFirma });
}