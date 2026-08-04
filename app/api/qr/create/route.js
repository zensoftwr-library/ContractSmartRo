import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
    try {
        const { url, userId } = await req.json();
        if (!url || !userId) return NextResponse.json({ success: false, message: 'URL sau Date utilizator lipsă.' }, { status: 400 });

        const shortId = crypto.randomBytes(3).toString('hex'); // Generează ex: a1b2c3
        
        const { error } = await supabase.from('qr_codes').insert([{
            id: shortId,
            user_id: userId,
            destination_url: url
        }]);

        if (error) throw error;

        // În producție, poți pune NEXT_PUBLIC_BASE_URL="https://contractsmart.ro" în .env.local
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://contractsmart.ro';
        const shortUrl = `${baseUrl}/q/${shortId}`;
        
        return NextResponse.json({ success: true, shortUrl });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}