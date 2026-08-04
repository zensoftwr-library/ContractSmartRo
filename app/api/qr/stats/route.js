import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        
        if (!userId) return NextResponse.json({ success: false });

        const { data: codes } = await supabase.from('qr_codes').select('id, destination_url').eq('user_id', userId);
        if (!codes || codes.length === 0) return NextResponse.json({ success: true, stats: [] });

        const codeIds = codes.map(c => c.id);
        const { data: scans } = await supabase.from('qr_scans').select('qr_code_id, scanned_at').in('qr_code_id', codeIds);

        const stats = codes.map(c => {
            const myScans = scans?.filter(s => s.qr_code_id === c.id) || [];
            return {
                id: c.id,
                url: c.destination_url,
                totalScans: myScans.length,
                lastScan: myScans.length > 0 ? myScans[myScans.length - 1].scanned_at : null
            }
        });

        return NextResponse.json({ success: true, stats });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}