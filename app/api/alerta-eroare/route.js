import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { mesaj, stack, url } = await req.json();
    
    await resend.emails.send({
      from: 'Alerte ContractSmart <onboarding@resend.dev>',
      to: 'zensoftwr@gmail.com',
      subject: `🚨 EROARE CRITICĂ pe ContractSmart`,
      html: `
        <h3 style="color:red;">S-a detectat o eroare pe platformă!</h3>
        <p><strong>URL:</strong> ${url}</p>
        <p><strong>Mesaj:</strong> ${mesaj}</p>
        <hr/>
        <pre style="background:#f4f4f4; padding:10px; font-size:12px;">${stack}</pre>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}