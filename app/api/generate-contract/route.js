import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';

export const dynamic = 'force-dynamic';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ success: false, message: 'Invalid Content-Type' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      tipContract, initiatorRol, obiect, valoare, moneda, 
      prestatorNume, prestatorCui, clientNume, clientCui, semnăturaBase64, userId
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
    console.log("Tier:", tier, "User:", userId);
    const availableCredits = profile?.credits_remaining || 0;

    // Aici e validarea care te lasă să treci dacă ești Pro sau Founder
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
        titluContractOficial = "CONTRACT-CADRU DE PRESTĂRI SERVICII COMERCIALE";
        temeiJuridicHtml = `Prezentul acord este guvernat de prevederile <strong>Art. 1851 - Art. 1880 din Codul Civil român</strong> privitoare la contractul de antrepriză și prestări de servicii, raporturile dintre Părți fiind supuse obligației de diligență profesională și bunei-credințe comerciale.`;
        break;
      case 'nda':
        titluContractOficial = "ACORD PRIVIND NEPROMOVAREA ȘI PROTECȚIA SECRETELOR COMERCIALE (NDA)";
        temeiJuridicHtml = `Prezentul înscris se fundamentează pe dispozițiile <strong>Art. 1184 și Art. 1200 din Codul Civil român</strong> referitoare la obligația de confidențialitate în cadrul negocierilor precontractuale și comerciale, coroborat cu normele privind protecția secretelor de afaceri.`;
        break;
      case 'cda':
        titluContractOficial = "CONTRACT DE CESIUNE EXCLUSIVĂ A DREPTURILOR PATRIMONIALE DE AUTOR";
        temeiJuridicHtml = `Raportul juridic este reglementat de normele imperative ale <strong>Legea nr. 8/1996 privind dreptul de autor și drepturile conexe</strong>, republicată și actualizată, operând o distincție clară și absolută între drepturile nepatrimoniale (morale) și drepturile de exploatare patrimonială a operei.`;
        break;
      case 'inchiriere_imobil':
        titluContractOficial = "CONTRACT DE LOCAȚIUNE ȘI EXPLOATARE SPAȚIU IMOBILIAR";
        temeiJuridicHtml = `Prezentul înscris reprezintă voința părților în deplină concordanță cu <strong>Art. 1777 - Art. 1835 din Codul Civil român</strong> (Contractul de Locațiune). În mod expres, raportul este supus dispozițiilor <strong>Art. 1798 din Codul Civil</strong>, contractul constituident un instrument cu valoare de <strong>TITLU EXECUTORIU</strong> direct.`;
        break;
      case 'promisiune_vanzare':
        titluContractOficial = "ANTECONTRACT / PROMISIUNE BILATERALĂ DE VÂNZARE-CUMPĂRARE IMOBIL";
        temeiJuridicHtml = `Contractul este guvernat de normele de drept cuprinse în <strong>Art. 1669 și Art. 1279 din Codul Civil român</strong> referitoare la promisiunea de a contracta și executarea silită a obligațiilor corelative, cu aplicarea regimului juridic penalizator al arvunei confirmatorii.`;
        break;
      default:
        titluContractOficial = "CONTRACT COMERCIAL DE COLABORARE";
        temeiJuridicHtml = `Prezentul acord comercial reprezintă legea părților, fiind supus dispozițiilor generale din materia obligațiilor contractuale reglementate de Codul Civil român.`;
    }

    let clauzeInjectateHtml = '';
    
    if (body.clauzaPi) {
      if (tipContract === 'inchiriere_imobil') {
        clauzeInjectateHtml += `<li><strong>ART. 4.1. CLAUZĂ DE INVESTIRE CU TITLU EXECUTORIU:</strong> În conformitate cu art. 1798 Cod Civil, prezentul contract constituie titlu executoriu de drept pentru recuperarea chiriilor restante și pentru evacuarea rapidă a Locatarului la expirarea termenului sau în caz de neplată, fără somație și fără procedură judecătorească prealabilă.</li>`;
      } else if (tipContract === 'cda') {
        clauzeInjectateHtml += `<li><strong>ART. 4.1. TRANSFER CONDIȚIONAT DE REMUNERAȚIE:</strong> Drepturile patrimoniale de autor și exploatarea operei se transferă legal și exclusiv către Beneficiar în mod condiționat de decontarea integrală, efectivă și confirmată bancar a prețului stipulat în prezentul înscris. Orice utilizare anterioară plății constituie delict civil și încălcare a drepturilor de proprietate intelectuală.</li>`;
      } else {
        clauzeInjectateHtml += `<li><strong>ART. 4.1. REȚINERE DE PROPRIETATE INTELECTUALĂ ȘI COD SURSĂ:</strong> Toate livrabilele, codul sursă, materialele de proiect intermediate sau finale rămân în proprietatea exclusivă și inalienabilă a Prestatorului până la momentul achitării și stingerii integrale a tuturor obligațiilor de plată născute din prezentul raport juridic.</li>`;
      }
    }
    if (body.clauzaPenalitati) {
      clauzeInjectateHtml += `<li><strong>ART. 4.2. REGIM PENALIZATOR DE ÎNTÂRZIERE:</strong> Depășirea scadenței facturilor emise atrage obligația Beneficiarului de a achita penalități de întârziere în cuantum de 0.5% pe zi calendaristică de întârziere, calculate din valoarea sumei restante, până la stingerea totală a debitului, fără a fi necesară punerea în întârziere prin intermediul executorului judecătoresc.</li>`;
    }
    if (body.clauzaRevizii) {
      clauzeInjectateHtml += `<li><strong>ART. 4.3. PLAFONARE STRUCTURALĂ FEEDBACK:</strong> Modificările sau revizile solicitate de către Beneficiar sunt limitate la un număr maxim de 2 runde incluse în bugetul contractat. Orice solicitare ulterioară de revizie va fi tarifată suplimentar cu un cost fix de ${body.tarifOrar || '150'} ${moneda || 'RON'} per oră de lucru implementată, prin act adițional.</li>`;
    }
    if (body.clauzaRawFoto) {
      if (tipContract === 'inchiriere_imobil') {
        clauzeInjectateHtml += `<li><strong>ART. 4.4. CONSTITUIRE FOND GARANȚIE:</strong> Locatarul se obligă să depună un depozit de garanție valoric. Acest fond blochează lichiditățile necesare acoperirii eventualelor stricăciunilor materiale aduse imobilului sau a debitelor acumulate la regia de utilități publice curentă.</li>`;
      } else {
        clauzeInjectateHtml += `<li><strong>ART. 4.4. RETENȚIE ELEMENTE SURSĂ JURIDICE (RAW):</strong> Predarea materialelor brute, a fișierelor vectoriale de proiect deschise (sursă) sau a negativelor de tip RAW nu face obiectul contractului standard, transferul acestora realizându-se exclusiv în schimbul unui onorariu separat.</li>`;
      }
    }
    if (body.clauzaMarketingTerti) {
      clauzeInjectateHtml += `<li><strong>ART. 4.5. DREPT EXCLUSIV DE PORTOFOLIU COMERCIAL:</strong> Beneficiarul acordă Prestatorului dreptul neexclusiv, permanent și gratuit de a utiliza livrabilele finale, fragmente de proiect sau identitatea vizuală rezultată strict ca studiu de caz comercial în scopuri promoționale și în portofoliul public de clienți.</li>`;
    }
    if (body.clauzaAprobareTacita) {
      if (tipContract === 'inchiriere_imobil') {
        clauzeInjectateHtml += `<li><strong>ART. 4.6. DREPT DE INSPECȚIE PERIODICĂ:</strong> Locatorul își rezervă dreptul legal de a efectua inspecții tehnice lunare în interiorul spațiului dat în locațiune, cu transmiterea unei notificări prealabilă ferme cu minimum 24 ore înainte de vizita efectivă.</li>`;
      } else {
        clauzeInjectateHtml += `<li><strong>ART. 4.6. RESTRUCTURARE FEEDBACK - APROBARE TACITĂ:</strong> Livrabilele intermediare sau finale transmise pe canalele electronice de comunicare se consideră acceptate implicit, calitativ și cantitativ, în termen de maximum 5 zile lucrătoare de la transmitere, în lipsa unui memoriu scris de obiecțiuni detaliate din partea Beneficiarului.</li>`;
      }
    }
    if (body.clauzaTaxaAnulare) {
      if (tipContract === 'promisiune_vanzare') {
        clauzeInjectateHtml += `<li><strong>ART. 4.7. EXECUTARE ARVUNĂ CONFIRMATORIE:</strong> În caz de reziliere din culpa sau răzgândirea Promitentului Cumpărător, sumele predate cu titlu de avans vor fi reținute integral de către Vânzător. În caz de renunțare din partea Promitentului Vânzător, acesta este obligat de drept la restituirea dublului sumei încasate.</li>`;
      } else {
        clauzeInjectateHtml += `<li><strong>ART. 4.7. PENALITATE DE ANULARE (KILL FEE):</strong> În cazul denunțării unilaterale a contractului din inițiativa exclusivă a Beneficiarului, sumele achitate cu titlu de avans rămân integral în posesia Prestatorului cu titlu de despăgubire industrială minimă pentru blocarea resurselor operaționale.</li>`;
      }
    }
    if (body.clauzaSplitPayment) {
      clauzeInjectateHtml += `<li><strong>ART. 4.8. LIVRARE ETAPIZATĂ SECVENȚIALĂ (MILESTONES):</strong> Proiectul este segmentat operațional în etape de execuție. Deblocarea și începerea lucrului pentru milestone-ul următor sunt condiționate tehnic și imperativ de decontarea bancară completă a facturii emise pentru etapa precedentă.</li>`;
    }
    if (body.clauzaRetentie) {
      clauzeInjectateHtml += `<li><strong>ART. 4.9. DREPT DE RETENȚIE TEHNICĂ:</strong> În caz de neplată a oricărei facturi scadente în termen de 15 zile, Prestatorul dobândește un drept de retenție tehnic, având facultatea legală de a sista serviciile, de a revoca permisiunile de acces, de a suspenda instanțele de server, hostingul sau activele digitale ale Beneficiarului.</li>`;
    }

    if (body.clauzaConstrucVicii) {
      clauzeInjectateHtml += `<li><strong>ART. 4.10. GARANȚIE VICII ASCUNSE CONSTRUCȚII:</strong> Executantul răspunde în mod expres conform prevederilor Art. 1862 din Codul Civil pentru stabilitatea structurală a elementelor edificate și viciile ascunse descoperite post-recepție.</li>`;
    }
    if (body.clauzaConstrucAsigurare) {
      clauzeInjectateHtml += `<li><strong>ART. 4.11. OBLIGAȚIE POLIZĂ CAR:</strong> Constructorul se obligă să mențină valabilă o asigurare de tip Contractors All Risks (CAR) pe toată durata organizării de șantier pentru acoperirea daunelor materiale accidentale.</li>`
    }
    if (body.clauzaConstrucGrafic) {
      clauzeInjectateHtml += `<li><strong>ART. 4.12. GRAFIC DE EXECUȚIE TEHNOLOGIC:</strong> Nerespectarea termenelor stabilite în graficul de execuție anexat din motive exclusiv imputabile Antreprenorului atrage penalizări sectoriale aplicate la valoarea fazei respective.</li>`;
    }
    if (body.clauzaItSla) {
      clauzeInjectateHtml += `<li><strong>ART. 4.13. ACORD PRIVIND NIVELUL SERVICIILOR (SLA):</strong> Prestatorul garantează un parametru de uptime tehnic lunar de 99.9% pentru infrastructura software livrată, nerespectarea acestuia generând credite comerciale compensatorii în favoarea Beneficiarului.</li>`;
    }
    if (body.clauzaItNonSolicit) {
      clauzeInjectateHtml += `<li><strong>ART. 4.14. CLAUZĂ DE NON-SOLICITARE PERSONAL:</strong> Beneficiarul se obligă ferm să nu recruteze, angajeze sau contracteze direct sau prin interpuși angajații sau subcontractorii Prestatorului pe o perioadă de 24 de luni de la încetarea contractului.</li>`;
    }
    if (body.clauzaItEscrow) {
      clauzeInjectateHtml += `<li><strong>ART. 4.15. DEPOZITARE ESCROW COD SURSĂ:</strong> Codul sursă și documentația tehnică aferentă vor fi depuse la un agent terț de escrow independent, fiind eliberate Beneficiarului exclusiv în caz de insolvență confirmată a Prestatorului.</li>`;
    }
    if (body.clauzaInchiriereRegie) {
      clauzeInjectateHtml += `<li><strong>ART. 4.16. CERTIFICARE PLATĂ UTILITĂȚI ȘI REGIE:</strong> Locatarul are obligația de a trimite lunar Locatorului dovada achitării la zi a tuturor cheltuielilor de regie, acumularea de restanțe de peste 45 de zile dând dreptul la reziliere imediată.</li>`;
    }
    if (body.clauzaInchiriereDest) {
      clauzeInjectateHtml += `<li><strong>ART. 4.17. DESTINAȚIE SPAȚIU ALOCAT:</strong> Schimbarea destinației declarate a spațiului închiriat este strict interzisă în lipsa unui acord scris prealabil, autentificat notarial, semnat de ambele Părți contractante.</li>`;
    }
    if (body.clauzaPromisSarcini) {
      clauzeInjectateHtml += `<li><strong>ART. 4.18. GARANȚIE EVICȚIUNE ȘI SARCINI:</strong> Promitentul-Vânzător garantează sub sancțiunea legii penale că bunul imobil nu este grevat de ipoteci, sarcini, litigii judecătorești active sau proceduri de urmărire silită.</li>`;
    }
    if (body.clauzaPromisCheltuieli) {
      clauzeInjectateHtml += `<li><strong>ART. 4.19. SUPORTARE TAXE ȘI HONORARII NOTARIALE:</strong> Toate costurile privitoare la autentificarea actelor, taxele de intabulare ANCPI și onorariul notarului public cad în sarcina financiară exclusivă a Promitentului-Cumpărător.</li>`;
    }

    const field = (valoare, minWidth = "120px") => {
      if (valoare && valoare.toString().trim() !== '') {
        return `<span class="valoare-importata">${valoare.toString().trim()}</span>`;
      }
      return `<span class="linia-dinamica" style="min-width: ${minWidth};">&nbsp;</span>`;
    };

    const htmlContract = `
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
        </style>
      </head>
      <body>
        <div class="brand-header">Sistem de Certificare și Audit Criptografic // ContractSmart 2026</div>
        
        <div class="contract-title">${titluContractOficial}</div>
        <div class="contract-subtitle">Nr. Identificare Digitală: CS-${Math.floor(10000 + Math.random() * 90000)} / Data Generării: ${new Date().toLocaleDateString('ro-RO')}</div>
        
        <div class="capitol-title">CAPITOLUL I. PĂRȚILE CONTRACTANTE</div>
        <div class="text-paragraph">
          <strong>SOCIETATEA COMERCIALĂ / ENTITATEA JURIDICĂ:</strong> ${field(prestatorNume, "220px")}, cu sediul profesional înregistrat în conformitate cu datele de identificare, cod fiscal / CUI: ${field(prestatorCui, "120px")}, reprezentată legal în capacitatea juridică deplină de exercițiu, denumită în continuare în cuprinsul prezentului înscris <strong>PRESTATOR / LOCATOR</strong>, pe de o parte,
        </div>
        <div class="text-paragraph">și</div>
        <div class="text-paragraph">
          <strong>SOCIETATEA COMERCIALĂ / ENTITATEA JURIDICĂ:</strong> ${field(clientNume, "220px")}, cu sediul profesional / domiciliul înregistrat în evidențele fiscale, cod fiscal / CUI / CNP: ${field(clientCui, "120px")}, reprezentată legal în mod valabil, denumită în continuare în cuprinsul prezentului înscris <strong>BENEFICIAR / LOCATAR</strong>, pe altă parte.
        </div>

        <div class="capitol-title">CAPITOLUL II. OBIECTUL CONTRACTULUI ȘI TEMEIUL LEGAL</div>
        <div class="text-paragraph">
          <strong>ART. 2.1. TEMEIUL JURIDIC:</strong> ${temeiJuridicHtml}
        </div>
        <div class="text-paragraph">
          <strong>ART. 2.2. SPECIFICAȚII TEHNICE:</strong> Obiectul prezentului contract este stabilit în mod expres prin convenția părților și constă în executarea următoarelor activități comerciale, servicii, livrabile sau folosințe temporare descrise detaliat: ${field(obiect, "350px")}.
        </div>

        <div class="capitol-title">CAPITOLUL III. OBLIGAȚII FINANCIARE ȘI SCADENȚĂ</div>
        <div class="text-paragraph">
          <strong>ART. 3.1. ONORARIU NOMINAL:</strong> Prețul stabil, cert și lichid datorat de către Beneficiar pentru aducerea la îndeplinire a obiectului contractual este fixat la cuantumul valoric total de: <strong>${field(valoare, "80px")} ${field(moneda, "50px")}</strong>.
        </div>
        <div class="text-paragraph">
          <strong>ART. 3.2. FACTURARE ȘI DECONTARE:</strong> Stingerea obligațiilor de plată se va efectua prin virament bancar în contul decontat al Prestatorului, termenele stipulate în facturile emise fiind considerate esențiale și de decădere pentru Beneficiar.
        </div>

        ${clauzeInjectateHtml ? `
        <div class="capitol-title">CAPITOLUL IV. CLAUZE SPECIFICE DE ASIGURARE A PLĂȚILOR ȘI MANAGEMENTUL RISCULUI</div>
        <ul class="clauze-list">${clauzeInjectateHtml}</ul>
        ` : ''}

        <div class="capitol-title">CAPITOLUL V. FORȚĂ MAJORĂ ȘI IMPREVIZIBILITATE</div>
        <div class="text-paragraph">
          <strong>ART. 5.1. EXONERARE DE RĂSPUNDERE:</strong> Forța majoră, definită ca un eveniment total imprevizibil, insurmontabil și independent de voința părților, exonerează de răspundere prezumată partea care o invocă, cu condiția notificării scrise în termen de maximum 5 zile de la producerea evenimentului, însoțită de certificarea oficială a Camerei de Comerț și Industrie.
        </div>

        <div class="capitol-title">CAPITOLUL VI. CONCILIERE DIRECTĂ ȘI LITIGII</div>
        <div class="text-paragraph">
          <strong>ART. 6.1. PROCEDURA DE CONCILIERE PREALABILĂ:</strong> În caz de apariție a unor divergențe cu privire la executarea clauzelor contractuale, părțile se obligă la parcurgerea unei proceduri obligatorii de conciliere directă prin notificare scrisă. În situația în care conflictul comercial nu este soluționat amiabil în termen de 15 zile, competența materială exclusivă de judecată revine instanțelor judecătorești de la sediul social al Prestatorului / Locatorului.
        </div>

        <div class="signature-layout">
          <div class="signature-column">
            PENTRU PRESTATOR / LOCATOR<br><br>
            ${initiatorRol === 'prestator' && semnăturaBase64 ? `
              <img src="${semnăturaBase64}" class="signature-image" alt="Semnatura Prestator" />
              <span style="font-size: 10px; font-weight: normal; color: #16a34a; display:block;">Semnat digital creator</span>
            ` : `
              <div class="signature-placeholder">[Validat Electronic ContractSmart]</div>
            `}
          </div>
          <div class="signature-column">
            PENTRU BENEFICIAR / LOCATAR<br><br>
            ${initiatorRol === 'client' && semnăturaBase64 ? `
              <img src="${semnăturaBase64}" class="signature-image" alt="Semnatura Beneficiar" />
              <span style="font-size: 10px; font-weight: normal; color: #16a34a; display:block;">Semnat digital creator</span>
            ` : `
              <div class="signature-placeholder" style="color: #ef4444;">Așteaptă semnare olografă partener</div>
            `}
          </div>
        </div>

        <div class="legal-footer">
          Document binar securizat generat digital. Proprietate exclusivă a proceselor auditate ContractSmart 2026.
        </div>
      </body>
      </html>
    `;

    let browser = await puppeteer.launch(process.env.NODE_ENV === 'development' ? { headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" } : { args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'], headless: true });
    
    const page = await browser.newPage();
    await page.setContent(htmlContract, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '40px', bottom: '40px', left: '40px', right: '40px' } });
    await browser.close();

    // Scade creditul doar dacă utilizatorul nu are abonament Premium
    if (!isPremium && availableCredits > 0) {
      await supabase.from('profiles').update({ credits_remaining: availableCredits - 1 }).eq('id', userId);
    }

    return new NextResponse(pdfBuffer, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename=contract_${tipContract}_securizat.pdf`, 'Content-Length': pdfBuffer.length }});
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}