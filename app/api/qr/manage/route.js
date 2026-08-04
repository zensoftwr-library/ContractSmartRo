import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function PUT(req) {
    try {
        const { id, newUrl, userId } = await req.json();
        if (!id || !newUrl || !userId) return NextResponse.json({ success: false });

        // Updatează linkul de destinație doar dacă codul aparține userului logat
        const { error } = await supabase.from('qr_codes').update({ destination_url: newUrl }).match({ id, user_id: userId });
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { id, userId } = await req.json();
        if (!id || !userId) return NextResponse.json({ success: false });

        // Șterge codul (cascade va șterge automat și scanările asociate lui din baza de date)
        const { error } = await supabase.from('qr_codes').delete().match({ id, user_id: userId });
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}