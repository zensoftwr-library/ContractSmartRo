import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cui = searchParams.get('cui');

  if (!cui) return NextResponse.json({ success: false, message: 'CUI lipsă' }, { status: 400 });

  try {
    // Interogăm direct noul server DemoANAF de pe portul 3002
    const res = await fetch(`http://localhost:3002/api/v1/demoanaf/${cui}`);
    const data = await res.json();

    if (res.ok && data.success) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ success: false, message: 'Firma nu a fost găsită' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}