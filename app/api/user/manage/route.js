import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '' // Necesită Service Role pentru acțiuni administrative (ștergere user)
);

// =========================================================================
// POST: Sincronizare automată în lista de Newsletter (Apelat la înregistrare)
// =========================================================================
export async function POST(request) {
  try {
    const { email, firstName, lastName } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email lipsă.' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: true, message: 'Mod simulare: Resend API Key lipsește.' });
    }

    // Adăugăm contactul în audiența generală Resend pentru știri zilnice
    const resendRes = await fetch('https://api.resend.com/audiences/GENERAL_AUDIENCE_ID/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        first_name: firstName || '',
        last_name: lastName || '',
        unsubscribed: false,
      }),
    });

    return NextResponse.json({ success: true, message: 'Utilizator abonat cu succes la fluxul zilnic.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// =========================================================================
// DELETE: Ștergere definitivă cont (Dreptul de a fi uitat - GDPR)
// =========================================================================
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (!userId || !email) {
      return NextResponse.json({ success: false, message: 'Date de identificare lipsă.' }, { status: 400 });
    }

    // 1. Eliminăm utilizatorul din lista de Newsletter Resend (dacă cheia există)
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch(`https://api.resend.com/audiences/GENERAL_AUDIENCE_ID/contacts/${email}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
        });
      } catch (e) {
        console.log('Eroare eliminare contact din newsletter (posibil inexistent).');
      }
    }

    // 2. Ștergem utilizatorul definitiv din sistemul de autentificare Supabase
    // Datorită ON DELETE CASCADE rulat în baza de date, se vor șterge automat și profilele/achizițiile lui.
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      return NextResponse.json({ success: false, message: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Contul și toate datele asociate au fost eliminate conform GDPR.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}