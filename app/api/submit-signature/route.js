import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function POST(request) {
  try {
    const { token, signature } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    if (!token || !signature) {
      return NextResponse.json({ success: false, message: 'Date de semnare incomplete.' }, { status: 400 });
    }

    // 1. Verificăm existența contractului în regim de producție
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('*')
      .eq('token_semnare_client', token)
      .single();

    if (fetchError || !contract) {
      return NextResponse.json({ success: false, message: 'Contractul nu există sau a fost șters.' }, { status: 404 });
    }

    if (contract.status === 'semnat') {
      return NextResponse.json({ success: false, message: 'Acest document a fost deja semnat.' }, { status: 400 });
    }

    // 2. SALVARE FIȘIER SEMNĂTURĂ ÎN SUPABASE STORAGE (Pasul 4 din Plan)
    let storagePublicUrl = signature; // Fallback b64 inline în caz de eroare storage
    try {
      const base64Data = signature.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `signatures/${token}-${Date.now()}.png`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('contract-assets')
        .upload(fileName, buffer, {
          contentType: 'image/png',
          upsert: true
        });

      if (!storageError && storageData) {
        const { data: urlData } = supabase.storage
          .from('contract-assets')
          .getPublicUrl(fileName);
        if (urlData?.publicUrl) storagePublicUrl = urlData.publicUrl;
      }
    } catch (errStorage) {
      console.error("Supabase Storage bucket error (Verifică dacă bucket-ul 'contract-assets' este creat):", errStorage);
    }

    // 3. ACTUALIZARE STATUS ȘI SALVARE METADATE ÎN DB
    const { data: records, error: updateError } = await supabase
      .from('contracts')
      .update({ 
        status: 'semnat', 
        semnatura_grafica_client: storagePublicUrl, 
        ip_client: ip, 
        data_semnare_client: new Date().toISOString() 
      })
      .eq('token_semnare_client', token)
      .select();

    if (updateError || !records?.length) {
      throw new Error('Eroare la securizarea stării contractului.');
    }
    
    const updatedContract = records[0];

    // 4. INTEGRARARE DINAMICĂ SMARTBILL LIVE LA SEMNARE (Firma Freelancerului)
    if (updatedContract.emite_factura_avans && updatedContract.valoare_totala > 0) {
      try {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('smartbill_user, smartbill_token')
          .eq('email', updatedContract.prestator_email)
          .single();

        if (!userError && userData?.smartbill_token && userData?.smartbill_user) {
          const smartBillAuth = btoa(`${userData.smartbill_user}:${userData.smartbill_token}`);
          
          await fetch('https://ia.smartbill.ro/api/invoice', {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${smartBillAuth}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              companyVatCode: updatedContract.prestator_cui,
              client: { 
                name: updatedContract.client_nume, 
                vatCode: updatedContract.client_cui, 
                email: updatedContract.client_email 
              },
              isAsDraft: false,
              products: [{ 
                name: `Avans conform contract servicii ref: ${token.substring(0,6).toUpperCase()}`, 
                price: Math.round(Number(updatedContract.valoare_totala) * 0.3), 
                isTaxIncluded: false, 
                quantity: 1, 
                measuringUnitName: 'buc',
                currency: 'RON'
              }]
            })
          });
        }
      } catch (sbError) {
        console.error("Eroare SmartBill API la semnare:", sbError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}