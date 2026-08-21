import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(request) {
  try {
    // 1. Securizăm ruta printr-un CRON_SECRET trimis în header
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, message: 'Acces interzis. Secret invalid.' }, { status: 401 });
    }

    // 2. Calculăm datele țintă (exact 30 de zile și 15 zile de la data curentă)
    const today = new Date();
    
    const target30 = new Date();
    target30.setDate(today.getDate() + 30);
    const date30Str = target30.toISOString().split('T')[0];

    const target15 = new Date();
    target15.setDate(today.getDate() + 15);
    const date15Str = target15.toISOString().split('T')[0];

    // 3. Interogăm baza de date după contracte care expiră la aceste date
    const { data: contracts, error } = await supabase
      .from('user_contracts')
      .select('id, titlu_contract, client_nume, data_expirare, user_id')
      .in('data_expirare', [date30Str, date15Str]);

    if (error) throw error;
    if (!contracts || contracts.length === 0) {
      return NextResponse.json({ success: true, message: 'Niciun contract nu necesită alertă astăzi.' });
    }

    // 4. Trimitem email-urile prin Resend
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      for (const c of contracts) {
        // Preluăm email-ul utilizatorului din auth.users sau profiles
        const { data: userData } = await supabase.auth.admin.getUserById(c.user_id);
        const userEmail = userData?.user?.email;

        if (userEmail) {
          const zileRamas = c.data_expirare === date30Str ? 30 : 15;
          await resend.emails.send({
            from: 'ContractSmart Alerte < alerte@contractsmart.ro >',
            to: userEmail,
            subject: `⚠️ Alertă Expirare Contract: ${c.titlu_contract} (${zileRamas} zile)`,
            text: `Salutare,\n\nContractul ${c.titlu_contract} încheiat cu ${c.client_nume} va expira în curând (la data de ${c.data_expirare}). Te rugăm să iei măsurile necesare pentru prelungire sau renegociere.\n\nEchipa ContractSmart`
          });
        }
      }
    }

    return NextResponse.json({ success: true, alerteTrimise: contracts.length });

  } catch (err) {
    console.error('Eroare Cronjob Alerte:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}