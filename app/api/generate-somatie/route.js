import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { contractId, userId } = body;

    if (!contractId || !userId) {
      return NextResponse.json({ success: false, message: 'ID contract sau utilizator lipsă.' }, { status: 400 });
    }

    // Preluăm contractul din baza de date
    const { data: contract, error } = await supabase
      .from('user_contracts')
      .select('*')
      .eq('id', contractId)
      .eq('user_id', userId)
      .single();

    if (error || !contract) {
      return NextResponse.json({ success: false, message: 'Contractul nu a fost găsit.' }, { status: 404 });
    }

    const dataCurenta = new Date().toLocaleDateString('ro-RO');
    
    // HTML-ul oficial pentru Notificarea de Plată pe Codul Civil (Art. 1522)
    const htmlSomatie = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Times New Roman', Times, serif; padding: 50px; color: #000000; line-height: 1.6; font-size: 14px; }
          .header { font-family: Arial, sans-serif; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-bottom: 35px; color: #64748b; }
          .title { text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
          .subtitle { text-align: center; font-size: 12px; margin-bottom: 35px; font-style: italic; }
          .section-title { font-weight: bold; margin-top: 25px; margin-bottom: 10px; text-transform: uppercase; font-size: 14px; }
          .paragraph { text-align: justify; margin-bottom: 12px; text-indent: 30px; }
          .accent-box { border: 1px solid #000000; padding: 15px; margin: 20px 0; background-color: #f8fafc; }
          .footer { margin-top: 70px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #64748b; text-align: center; font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>
        <div class="header">Notificare Oficială de Plată // Cadru Legal Noul Cod Civil // ContractSmart 2026</div>
        
        <div class="title">NOTIFICARE DE PLATĂ ȘI PUNERE ÎN ÎNTÂRZIERE</div>
        <div class="subtitle">Emisă în temeiul Art. 1522 din Codul Civil român</div>

        <div class="paragraph" style="text-indent: 0;">
          <strong>CĂTRE:</strong> ${contract.client_nume || 'Client'}<br>
          <strong>CUI / Identificare:</strong> ${contract.client_cui || 'N/A'}<br>
          <strong>DATA EMITERII:</strong> ${dataCurenta}
        </div>

        <div class="section-title">CAPITOLUL I. EXPUNEREA SITUAȚIEI DE FAPT</div>
        <div class="paragraph">
          Prin prezenta, vă aducem la cunoștință că înregistrați un debit restant în cuantum total de <strong>${contract.valoare} ${contract.moneda}</strong>, aferent raportului contractual înregistrat în sistem cu titlul <em>„${contract.titlu_contract}”</em>. Deși termenul de scadență agreat a fost depășit, sumele menționate nu au fost achitate până la data emitentei prezentului înscris.
        </div>

        <div class="section-title">CAPITOLUL II. TEMEIUL JURIDIC ȘI PUNEREA ÎN ÎNTÂRZIERE</div>
        <div class="paragraph">
          În conformitate cu prevederile imperative ale <strong>Art. 1522 din Noul Cod Civil</strong>, prin intermediul acestui document VĂ PUNEM ÎN ÎNTÂRZIERE și vă solicităm achitarea integrală a debitului restant în termen de <strong>maximum 5 (cinci) zile lucrătoare</strong> de la data primirii prezentei notificări.
        </div>

        <div class="accent-box">
          <strong>ATENȚIE:</strong> Neachitarea sumei în termenul acordat va atrage în mod automat aplicarea penalităților de întârziere stipulate contractual, precum și demararea procedurilor legale/judiciare pentru recuperarea silită a debitului, incluzând cheltuielile de judecată și onorariile aferente.
        </div>

        <div class="section-title">CAPITOLUL III. MODALITATEA DE STINGERE A DEBITULUI</div>
        <div class="paragraph">
          Plata se va efectua prin virament bancar în contul menționat în documentul inițial. Vă rugăm să transmiteți confirmarea plății pe adresa electronică asociată.
        </div>

        <div style="margin-top: 50px; display: flex; justify-content: space-between;">
          <div><strong>CREDITOR / EMIȚĂTOR</strong><br>ContractSmart (Sistem Certificat)</div>
        </div>

        <div class="footer">
          Document generat electronic în baza datelor contractuale validate prin amprentă criptografică SHA-256.
        </div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--single-process']
    });
    const page = await browser.newPage();
    await page.setContent(htmlSomatie, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '40px', bottom: '40px', left: '40px', right: '40px' } });
    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Somatie_Plata_${contract.id.split('-')[0]}.pdf`,
        'Content-Length': pdfBuffer.length
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}