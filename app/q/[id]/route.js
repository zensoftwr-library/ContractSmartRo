import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(req, { params }) {
    try {
        // În versiunile noi de Next.js, params este o promisiune și necesită await
        const { id } = await params; 
        
        const userAgent = req.headers.get('user-agent') || 'Unknown';

        const { data: qr, error } = await supabase
            .from('qr_codes')
            .select('destination_url')
            .eq('id', id)
            .single();
        
        // Dacă ID-ul nu există în baza de date sau Supabase returnează o eroare
        if (error || !qr || !qr.destination_url) {
            console.error('QR nu a fost găsit sau eroare DB:', error?.message);
            return NextResponse.redirect('https://contractsmart.ro/');
        }

        // Înregistrăm scanarea în fundal, fără să blocăm redirecționarea clientului
        supabase.from('qr_scans').insert([{ qr_code_id: id, user_agent: userAgent }]).then();

        let dest = qr.destination_url.trim();
        
        // Validarea și formatarea URL-ului pentru ca NextResponse.redirect să nu crape
        if (!dest.startsWith('http://') && !dest.startsWith('https://')) {
            dest = 'https://' + dest;
        }
        
        return NextResponse.redirect(dest);
    } catch (e) {
        console.error('Eroare globală la procesarea QR-ului:', e.message);
        return NextResponse.redirect('https://contractsmart.ro/');
    }
}