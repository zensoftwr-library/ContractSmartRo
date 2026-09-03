import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(req, { params }) {
    try {
        const { id } = params;
        const userAgent = req.headers.get('user-agent') || 'Unknown';

        const { data: qr } = await supabase.from('qr_codes').select('destination_url').eq('id', id).single();
        
        if (!qr) return NextResponse.redirect('https://contractsmart.ro/');

        // Salvăm scanarea silențios (fără await, pentru ca utilizatorul să fie redirectat instantaneu)
        supabase.from('qr_scans').insert([{ qr_code_id: id, user_agent: userAgent }]).then();

        let dest = qr.destination_url;
        if (!dest.startsWith('http://') && !dest.startsWith('https://')) {
            dest = 'https://' + dest;
        }
        
        return NextResponse.redirect(dest);
    } catch (e) {
        return NextResponse.redirect('https://contractsmart.ro/');
    }
}