import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';
import twilio from 'twilio';

export const dynamic = 'force-dynamic';
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID || '',
  process.env.TWILIO_AUTH_TOKEN || ''
);

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ success: false, message: 'Invalid Content-Type' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      tipContract, initiatorRol, obiect, valoare, moneda, 
      prestatorNume, prestatorCui, clientNume, clientCui, 
      clientEmail, clientTelefon, trimitePeWhatsApp, 
      semnăturaBase64, userId, adaugaProcesVerbal
    } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Utilizator neautentificat.' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, credits_remaining')
      .eq('id', userId)
      .single();

    const tier = (profile?.subscription_tier || 'free').toLowerCase().trim();
    const isPremium = tier.includes('founder') || tier.includes('pro');
    const availableCredits = profile?.credits_remaining || 0;

    if (!isPremium && availableCredits <= 0) {
      return NextResponse.json({ 
        success: false, 
        needsPayment: true, 
        message: `Ai atins limita gratuită lunară. Achiziționează un credit sau un plan Pro.` 
      }, { status: 403 });
    }

    let temeiJuridicHtml = '';
    let titluContractOficial = '';

    switch(tipContract) {
      case 'prestari':
        titluContractOficial = "CONTRACT-CADRU DE PRESTĂRI SERVICII COMERCIALE B2B";
        temeiJuridicHtml = `Prezentul acord este guvernat de prevederile <strong>Art. 1851 - Art. 1880 din Codul Civil român</strong> (Contractul de Antrepriză și Prestări Servicii). Părțile declară expres că prezentul raport nu este unul de subordonare, excluzând orice recalificare fiscală.`;
        break;
      case 'nda':
        titluContractOficial = "ACORD PRIVIND NEPROMOVAREA ȘI PROTECȚIA SECRETELOR COMERCIALE (NDA)";
        temeiJuridicHtml = `Prezentul înscris se fundamentează pe dispozițiile <strong>Art. 1184 și Art. 1200 din Codul Civil român</strong> referitoare la obligația de confidențialitate în cadrul negocierilor precontractuale.`;
        break;
      case 'cda':
        titluContractOficial = "CONTRACT DE CESIUNE EXCLUSIVĂ A DREPTURILOR PATRIMONIALE DE AUTOR";
        temeiJuridicHtml = `Raportul juridic este reglementat de normele imperative ale <strong>Legii nr. 8/1996 privind dreptul de autor și drepturile conexe</strong>, republicată și actualizată.`;
        break;
      case 'inchiriere_imobil':
        titluContractOficial = "CONTRACT DE LOCAȚIUNE ȘI EXPLOATARE SPAȚIU IMOBILIAR";
        temeiJuridicHtml = `Încheiat conform <strong>Art. 1777 - Art. 1835 din Codul Civil român</strong>. Raportul este supus dispozițiilor <strong>Art. 1798 din Codul Civil</strong>, constituind un instrument cu valoare de <strong>TITLU EXECUTORIU</strong>.`;
        break;
      case 'promisiune_vanzare':
        titluContractOficial = "ANTECONTRACT / PROMISIUNE BILATERALĂ DE VÂNZARE-CUMPĂRARE IMOBIL";
        temeiJuridicHtml = `Guvernat de normele cuprinse în <strong>Art. 1669 și Art. 1279 din Codul Civil român</strong> referitoare la promisiunea de a contracta și executarea silită a obligațiilor corelative.`;
        break;
      case 'colaborare_b2b':
        titluContractOficial = "CONTRACT DE COLABORARE COMERCIALĂ INDEPENDENTĂ";
        temeiJuridicHtml = `Guvernat de prevederile generale ale Codului Civil privind obligațiile. Prestatorul acționează pe riscul și cu mijloacele sale proprii, nefiind integrat în organigrama Beneficiarului.`;
        break;
      case 'design_arhitectura':
        titluContractOficial = "CONTRACT DE ANTREPRIZĂ PENTRU DESIGN ȘI ARHITECTURĂ";
        temeiJuridicHtml = `Supus normelor speciale de antrepriză (Art. 1851 Cod Civil) și Legii nr. 8/1996. Proiectul arhitectural reprezintă operă de creație intelectuală.`;
        break;
      case 'evenimente':
        titluContractOficial = "CONTRACT PRESTĂRI SERVICII EVENIMENTE (ENTERTAINMENT)";
        temeiJuridicHtml = `Încheiat în baza principiului libertății contractuale. Obligația asumată este una de mijloace, nu de rezultat. Suma achitată poartă regim de "Non-Refundable Retainer".`;
        break;
      default:
        titluContractOficial = "CONTRACT COMERCIAL GENERAL";
        temeiJuridicHtml = `Prezentul acord comercial reprezintă legea părților, fiind supus dispozițiilor generale din materia obligațiilor contractuale reglementate de Codul Civil român.`;
    }

    let clauzeInjectateHtml = '';
    
    // CLAUZE GENERICE/GLOBAL (PI, Penalități, etc.)
    if (body.clauzaPi) {
      if (tipContract === 'inchiriere_imobil') {
        clauzeInjectateHtml += `<li><strong>ART. X. CLAUZĂ DE INVESTIRE CU TITLU EXECUTORIU:</strong> În conformitate cu art. 1798 Cod Civil, prezentul contract constituie titlu executoriu de drept pentru recuperarea chiriilor restante și pentru evacuarea rapidă a Locatarului, fără somație.</li>`;
      } else if (tipContract === 'cda') {
        clauzeInjectateHtml += `<li><strong>ART. X. TRANSFER CONDIȚIONAT DE REMUNERAȚIE:</strong> Drepturile patrimoniale se transferă exclusiv condiționat de decontarea integrală a prețului. Orice utilizare anterioară constituie delict civil.</li>`;
      } else {
        clauzeInjectateHtml += `<li><strong>ART. X. REȚINERE DE PROPRIETATE INTELECTUALĂ:</strong> Toate livrabilele și materialele de proiect rămân în proprietatea exclusivă a Prestatorului până la momentul stingerii integrale a tuturor obligațiilor de plată.</li>`;
      }
    }
    if (body.clauzaPenalitati) {
      clauzeInjectateHtml += `<li><strong>ART. X. REGIM PENALIZATOR ȘI DAUNE INTERESE:</strong> Depășirea scadenței atrage penalități de 0.5% pe zi calendaristică. Pentru contractele confidențiale, încălcarea atrage daune-interese preevaluate la suma de 50.000 EUR, exigibile imediat.</li>`;
    }
    if (body.clauzaLimitareRaspundere) {
      clauzeInjectateHtml += `<li><strong>ART. X. LIMITAREA RĂSPUNDERII COMERCIALE:</strong> Sub nicio formă și indiferent de natura litigiului, răspunderea financiară totală a Prestatorului pentru orice daune dovedite nu va depăși valoarea netă încasată efectiv.</li>`;
    }
    if (body.clauzaInflatie) {
      clauzeInjectateHtml += `<li><strong>ART. X. INDEXARE ANTI-INFLAȚIONISTĂ (EUR/BNR):</strong> Pentru a menține echilibrul prestațiilor, prețul va fi actualizat/indexat automat raportat la evoluția cursului EUR/RON comunicat de BNR la data emiterii facturii.</li>`;
    }
    if (body.clauzaRevizii) {
      clauzeInjectateHtml += `<li><strong>ART. X. PLAFONARE STRUCTURALĂ FEEDBACK:</strong> Modificările sau revizile sunt limitate la maximum 2 runde incluse în buget. Orice solicitare ulterioară va fi tarifată suplimentar prin act adițional.</li>`;
    }
    if (body.clauzaTaxaAnulare) {
      if (tipContract === 'promisiune_vanzare') {
        clauzeInjectateHtml += `<li><strong>ART. X. EXECUTARE ARVUNĂ CONFIRMATORIE:</strong> În caz de reziliere din culpa Promitentului Cumpărător, sumele predate se rețin integral. În caz de renunțare a Vânzătorului, se restituie dublul sumei.</li>`;
      } else if (tipContract === 'evenimente') {
        clauzeInjectateHtml += `<li><strong>ART. X. REȚINERE AVANS (NON-REFUNDABLE RETAINER):</strong> Avansul încasat reprezintă rezervarea fermă a datei. Anularea evenimentului cu mai puțin de 90 de zile înainte transformă avansul în daune-interese nereturnabile.</li>`;
      } else {
        clauzeInjectateHtml += `<li><strong>ART. X. PENALITATE DE ANULARE (KILL FEE):</strong> În cazul denunțării din culpa exclusivă a Beneficiarului, avansul rămâne în posesia Prestatorului pentru blocarea resurselor operaționale.</li>`;
      }
    }
    if (body.clauzaSplitPayment) {
      clauzeInjectateHtml += `<li><strong>ART. X. PLĂȚI FRACȚIONATE (MILESTONES):</strong> Decontarea și recepția fiecărei etape intermediare condiționează imperativ deblocarea execuției pentru fazele de lucru subsecvente.</li>`;
    }
    if (body.clauzaRetentie) {
      clauzeInjectateHtml += `<li><strong>ART. X. DREPT DE RETENȚIE TEHNICĂ:</strong> În caz de neplată în termen de 15 zile, Prestatorul are facultatea legală de a sista serviciile, revoca accesul sau de a suspenda instanțele de server și activele digitale.</li>`;
    }
    if (body.clauzaItNonSolicit) {
      clauzeInjectateHtml += `<li><strong>ART. X. NON-SOLICITARE PERSONAL:</strong> Părțile se obligă să nu recruteze angajații celeilalte părți pe o perioadă de 24 de luni de la încetarea contractului.</li>`;
    }

    // CLAUZE NOI AVOCĂȚEȘTI (SPECIFICE NIȘELOR)
    if (body.clauzaAntiRecalificare) {
      clauzeInjectateHtml += `<li><strong>ART. X. INDEPENDEȚĂ OPERAȚIONALĂ ȘI FISCALĂ:</strong> Relația este strict comercială (B2B). Prestatorul dispune de libertate absolută în organizare, utilizarea echipamentelor proprii și stabilirea programului, fiind eliminat orice element de subordonare (Art. 7 Cod Fiscal).</li>`;
    }
    if (body.clauzaSuspendareFeedback) {
      clauzeInjectateHtml += `<li><strong>ART. X. SUSPENDARE PENTRU LIPSĂ FEEDBACK:</strong> Orice întârziere a Beneficiarului în furnizarea materialelor ce depășește 5 zile lucrătoare atrage decalarea automată a predării. Depășirea a 15 zile dă dreptul facturării integrale a stadiului curent.</li>`;
    }
    if (body.clauzaLogisticaHoreca) {
      clauzeInjectateHtml += `<li><strong>ART. X. ASIGURARE LOGISTICĂ EVENIMENT:</strong> Beneficiarul se obligă să asigure Prestatorului acces la curent electric stabil (220V), mese calde pe durata evenimentelor ce depășesc 4 ore, și loc de parcare garantat pentru echipamente.</li>`;
    }
    if (body.clauzaOriginalitate) {
      clauzeInjectateHtml += `<li><strong>ART. X. GARANȚIA ORIGINALITĂȚII:</strong> Autorul garantează absolut și sub sancțiunea legii penale că opera este 100% creație originală, nu încalcă drepturile terților (fără plagiat) și nu a mai fost cedată anterior.</li>`;
    }
    if (body.clauzaDauneTerti) {
      clauzeInjectateHtml += `<li><strong>ART. X. RĂSPUNDEREA PENTRU DAUNE PROVOCATE TERȚILOR:</strong> Locatarul este 100% solidar responsabil pentru orice distrugeri (inundații, incendii din culpă, vandalism) provocate vecinilor sau spațiilor comune, degrevând total Locatorul de orice acțiune în regres.</li>`;
    }
    if (body.clauzaRiscPieire) {
      clauzeInjectateHtml += `<li><strong>ART. X. RISCUL PIEIRII BUNULUI:</strong> Până la semnarea formei autentice, riscul pieirii fortuite a imobilului rămâne în sarcina Promitentului-Vânzător. Orice degradare a stării fizice dă dreptul Cumpărătorului să ceară reducerea prețului.</li>`;
    }

    const field = (valoare, minWidth = "120px") => {
      if (valoare && valoare.toString().trim() !== '') {
        return `<span class="valoare-importata">${valoare.toString().trim()}</span>`;
      }
      return `<span class="linia-dinamica" style="min-width: ${minWidth};">&nbsp;</span>`;
    };

    const dataCurenta = new Date().toLocaleDateString('ro-RO');

    let htmlContract = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Times New Roman', Times, serif; padding: 50px; color: #000000; line-height: 1.6; font-size: 14px; }
          .brand-header { font-family: Arial, sans-serif; color: #64748b; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-bottom: 35px; letter-spacing: 0.5px; }
          .contract-title { text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
          .contract-subtitle { text-align: center; font-size: 12px; font-weight: normal; margin-bottom: 35px; font-style: italic; }
          .capitol-title { font-weight: bold; margin-top: 25px; margin-bottom: 10px; text-transform: uppercase; text-align: justify; font-size: 14px; }
          .text-paragraph { text-align: justify; margin-bottom: 12px; text-indent: 30px; }
          .clauze-list { list-style-type: none; padding: 0; margin: 0; }
          .clauze-list li { text-align: justify; margin-bottom: 12px; padding-left: 0; }
          .signature-layout { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
          .signature-column { width: 45%; text-align: center; border-top: 1px solid #000000; padding-top: 8px; font-size: 13px; font-weight: bold; }
          .signature-image { max-height: 80px; margin-bottom: 5px; display: block; margin-left: auto; margin-right: auto; }
          .signature-placeholder { height: 60px; font-size: 11px; color: #94a3b8; font-weight: normal; font-style: italic; padding-top: 20px; }
          .legal-footer { margin-top: 70px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #64748b; text-align: center; font-family: Arial, sans-serif; }
          
          .linia-dinamica { display: inline-block; border-bottom: 1px solid #000000; vertical-align: bottom; height: 18px; }
          .valoare-importata { font-weight: bold; border-bottom: 1px transparent solid; display: inline; padding: 0 2px; }
          .page-break { page-break-before: always; }
        </style>
      </head>
      <body>
        <div class="brand-header">Sistem de Certificare și Audit Criptografic // ContractSmart 2026</div>
        
        <div class="contract-title">${titluContractOficial}</div>
        <div class="contract-subtitle">Nr. Identificare Digitală: CS-${Math.floor(10000 + Math.random() * 90000)} / Data Generării: ${dataCurenta}</div>
        
        <div class="capitol-title">CAPITOLUL I. PĂRȚILE CONTRACTANTE</div>
        <div class="text-paragraph">
          <strong>SOCIETATEA COMERCIALĂ / ENTITATEA JURIDICĂ:</strong> ${field(prestatorNume, "220px")}, având date de identificare fiscală CUI/CNP: ${field(prestatorCui, "120px")}, reprezentată legal în capacitate juridică deplină, denumită <strong>PRESTATOR / LOCATOR / VÂNZĂTOR</strong>, pe de o parte,
        </div>
        <div class="text-paragraph">și</div>
        <div class="text-paragraph">
          <strong>SOCIETATEA COMERCIALĂ / ENTITATEA JURIDICĂ:</strong> ${field(clientNume, "220px")}, având date de identificare fiscală CUI/CNP: ${field(clientCui, "120px")}, reprezentată legal, denumită <strong>BENEFICIAR / LOCATAR / CUMPĂRĂTOR</strong>, pe altă parte.
        </div>

        <div class="capitol-title">CAPITOLUL II. OBIECTUL CONTRACTULUI ȘI TEMEIUL LEGAL</div>
        <div class="text-paragraph">
          <strong>ART. 2.1. TEMEIUL JURIDIC:</strong> ${temeiJuridicHtml}
        </div>
        <div class="text-paragraph">
          <strong>ART. 2.2. SPECIFICAȚII TEHNICE:</strong> Obiectul contractului este stabilit în mod expres prin convenția părților și constă în: ${field(obiect, "350px")}.
        </div>

        <div class="capitol-title">CAPITOLUL III. OBLIGAȚII FINANCIARE ȘI SCADENȚĂ</div>
        <div class="text-paragraph">
          <strong>ART. 3.1. ONORARIU NOMINAL:</strong> Prețul stabilit de către Părți este în cuantum total de: <strong>${field(valoare, "80px")} ${field(moneda, "50px")}</strong>.
        </div>
        <div class="text-paragraph">
          <strong>ART. 3.2. DECONTARE:</strong> Stingerea obligațiilor de plată se va efectua prin virament bancar, termenele stipulate în facturi fiind esențiale și de decădere.
        </div>

        ${clauzeInjectateHtml ? `
        <div class="capitol-title">CAPITOLUL IV. CLAUZE SPECIFICE DE ASIGURARE A PLĂȚILOR ȘI RISC</div>
        <ul class="clauze-list">${clauzeInjectateHtml}</ul>
        ` : ''}

        <div class="capitol-title">CAPITOLUL V. FORȚĂ MAJORĂ, BLOCAJE ADMINISTRATIVE ȘI CIBERNETICE</div>
        <div class="text-paragraph">
          <strong>ART. 5.1. EXONERARE DE RĂSPUNDERE:</strong> Forța majoră exonerează părțile de răspundere. Prin derogare, părțile convin că restricțiile administrative impuse de stat (tip pandemie, decizii ANAF/ONRC) sau atacurile cibernetice (ransomware, downtime server terț) care blochează livrarea serviciilor se asimilează forței majore și atrag exclusiv dreptul de reprogramare a prestării, fără penalități.
        </div>

        <div class="capitol-title">CAPITOLUL VI. CONCILIERE ȘI LITIGII</div>
        <div class="text-paragraph">
          <strong>ART. 6.1. JURISDICȚIE:</strong> În lipsa soluționării amiabile în 15 zile, litigiile vor fi deduse exclusiv instanțelor de la sediul Prestatorului.
        </div>

        <div class="signature-layout">
          <div class="signature-column">
            PENTRU PRESTATOR / VÂNZĂTOR<br><br>
            ${initiatorRol === 'prestator' && semnăturaBase64 ? `
              <img src="${semnăturaBase64}" class="signature-image" alt="Semnatura Prestator" />
              <span style="font-size: 10px; font-weight: normal; color: #16a34a; display:block;">Semnat digital creator</span>
            ` : `<div class="signature-placeholder">[Validat Electronic]</div>`}
          </div>
          <div class="signature-column">
            PENTRU BENEFICIAR / CUMPĂRĂTOR<br><br>
            ${initiatorRol === 'client' && semnăturaBase64 ? `
              <img src="${semnăturaBase64}" class="signature-image" alt="Semnatura Beneficiar" />
              <span style="font-size: 10px; font-weight: normal; color: #16a34a; display:block;">Semnat digital creator</span>
            ` : `<div class="signature-placeholder" style="color: #ef4444;">Așteaptă semnare partener</div>`}
          </div>
        </div>

        <div class="legal-footer">
          Document binar securizat generat digital. Proprietate exclusivă a proceselor auditate ContractSmart 2026.
        </div>
    `;

    if (adaugaProcesVerbal) {
      htmlContract += `
        <div class="page-break"></div>
        <div class="brand-header">Sistem de Certificare și Audit Criptografic // ContractSmart 2026</div>
        <div class="contract-title">ANEXA 1: PROCES-VERBAL DE PREDARE-PRIMIRE</div>
        <div class="contract-subtitle">Anexă la Contractul nr. CS-${Math.floor(10000 + Math.random() * 90000)} / ${dataCurenta}</div>
        
        <div class="text-paragraph">
          Încheiat astăzi, ${dataCurenta}, între:
        </div>
        <div class="text-paragraph">
          1. <strong>${field(prestatorNume, "220px")}</strong> (în calitate de Prestator/Predător)
        </div>
        <div class="text-paragraph">
          2. <strong>${field(clientNume, "220px")}</strong> (în calitate de Beneficiar/Primitor)
        </div>
        
        <div class="text-paragraph">
          Obiectul predării a constat în recepționarea fizică și calitativă a următoarelor bunuri/lucrări/servicii: ${field(obiect, "350px")}.
        </div>
        <div class="text-paragraph">
          Prin semnarea prezentului proces-verbal, Beneficiarul declară în mod expres, ferm și neechivoc că a primit și recepționat bunurile/serviciile mai sus menționate. Beneficiarul confirmă că acestea sunt în stare perfectă de funcționare, cantitativ și calitativ conform standardelor agreate, și că <strong>nu are absolut nicio obiecțiune vizibilă sau ascunsă</strong> cu privire la acestea.
        </div>
        <div class="text-paragraph">
          Odată cu semnarea acestui document, se naște obligația de plată (dacă nu a fost deja achitată) și orice răspundere de paza juridică trece în sarcina Beneficiarului.
        </div>

        <div class="signature-layout">
          <div class="signature-column">PREDĂTOR<br><br><div class="signature-placeholder">Semnătură</div></div>
          <div class="signature-column">PRIMITOR<br><br><div class="signature-placeholder">Semnătură</div></div>
        </div>
      `;
    }

    htmlContract += `
      </body>
      </html>
    `;

    let browser = await puppeteer.launch(process.env.NODE_ENV === 'development' ? { headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" } : { args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'], headless: true });
    
    const page = await browser.newPage();
    await page.setContent(htmlContract, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '40px', bottom: '40px', left: '40px', right: '40px' } });
    await browser.close();

    if (process.env.RESEND_API_KEY && clientEmail) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'ContractSmart <onboarding@resend.dev>',
          to: clientEmail,
          subject: `Document Securizat - ${titluContractOficial}`,
          text: `Regăsiți atașat contractul comercial generat prin ContractSmart.\n\nO zi excelentă!`,
          attachments: [ { filename: `contract_${tipContract}_securizat.pdf`, content: Buffer.from(pdfBuffer) } ],
        });
      } catch (emailErr) {}
    }

    if (trimitePeWhatsApp && clientTelefon && process.env.TWILIO_WHATSAPP_FROM) {
      try {
        const formatE164 = clientTelefon.trim().startsWith('+') ? clientTelefon.trim() : `+4${clientTelefon.trim()}`;
        await twilioClient.messages.create({
          from: process.env.TWILIO_WHATSAPP_FROM,
          to: `whatsapp:${formatE164}`,
          body: `Salutare! Documentul dvs. a fost emis și transmis în siguranță pe e-mail via ContractSmart.`
        });
      } catch (twilioError) {}
    }

    if (!isPremium && availableCredits > 0) {
      await supabase.from('profiles').update({ credits_remaining: availableCredits - 1 }).eq('id', userId);
    }

    return new NextResponse(pdfBuffer, { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/pdf', 
        'Content-Disposition': `attachment; filename=contract_${tipContract}_securizat.pdf`, 
        'Content-Length': pdfBuffer.length 
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}