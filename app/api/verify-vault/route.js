import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, message: 'Niciun fișier furnizat pentru verificare.' }, { status: 400 });
    }

    // 1. Extragem buffer-ul fișierului încărcat
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Calculăm hash-ul SHA-256 al fișierului prezentat
    const calculatedHash = crypto
      .createHash('sha256')
      .update(buffer)
      .digest('hex');

    // 3. Căutăm amprenta în baza de date Supabase (Smart Vault)
    const { data: contract, error } = await supabase
      .from('user_contracts')
      .select('id, titlu_contract, client_nume, valoare, moneda, created_at, hash_sha256')
      .eq('hash_sha256', calculatedHash)
      .single();

    if (error || !contract) {
      return NextResponse.json({ 
        success: true, 
        verified: false, 
        message: 'Atenție! Amprenta criptografică nu a fost găsită în baza de date Smart Vault. Documentul a fost modificat sau nu aparține platformei ContractSmart.' 
      });
    }

    // 4. Document validat cu succes
    return NextResponse.json({
      success: true,
      verified: true,
      contract: {
        id: contract.id,
        titlu: contract.titlu_contract,
        client: contract.client_nume,
        valoare: `${contract.valoare} ${contract.moneda}`,
        dataEmitere: new Date(contract.created_at).toLocaleDateString('ro-RO'),
        hash: contract.hash_sha256
      },
      message: 'Document validat criptografic cu succes. Integritate 100% garantată.'
    });

  } catch (error) {
    console.error('Eroare la verificarea Smart Vault:', error);
    return NextResponse.json({ success: false, message: 'Eroare internă de server la procesarea amprentei.' }, { status: 500 });
  }
}