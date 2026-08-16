import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cui = searchParams.get('cui');

  if (!cui) return NextResponse.json({ success: false, message: 'CUI lipsă' }, { status: 400 });

  try {
    const res = await fetch(`http://localhost:3002/api/v1/demoanaf/${cui}`);
    const data = await res.json();

    if (res.ok && data.success) {
      if (data.data) {
        
        // Extragere administrator
        if (!data.data.administrator && data.data.administrators && data.data.administrators.length > 0) {
          data.data.administrator = data.data.administrators[0].name;
        }
        
        // --- LOGICĂ NOUĂ: Lipim data completă SAU anul ---
        if (data.data.stare && data.data.stare.toUpperCase().includes('ACTIV') && !data.data.stare.toUpperCase().includes('INACTIV')) {
          
          const dataCompleta = data.data.data_inregistrare || data.data.data_infiintare || '';
          
          if (dataCompleta) {
            // Dacă găsește data completă, o pune pe toată!
            data.data.stare = `ACTIV FISCAL (din ${dataCompleta})`;
          } else {
            // Dacă nu o găsește (cazul Pepco), pune măcar anul din RegCom!
            const anMatch = data.data.regCom ? data.data.regCom.match(/(19|20)\d{2}/) : null;
            if (anMatch) {
              data.data.stare = `ACTIV FISCAL (din ${anMatch[0]})`;
            } else {
              data.data.stare = `ACTIV FISCAL`;
            }
          }
          
        }
        // -------------------------------------------------
      }
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ success: false, message: 'Firma nu a fost găsită' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}