import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { templateId, userId } = body;

    if (!templateId) {
      return NextResponse.json({ success: false, message: 'Template ID lipsă.' }, { status: 400 });
    }

    // 1. FILTRARE ȘI CONDIȚIONARE CRYPTOGRAFICĂ PRIVILEGII CONFORM STRATEGIEI
    if (templateId !== 'prestari_gratuit') {
      if (!userId) {
        return NextResponse.json({ success: false, message: 'Autentificare obligatorie pentru descărcarea modelelor premium.' }, { status: 401 });
      }

      // Verificăm statusul abonamentului direct în tabelul profiles din Supabase
      const { data: profil } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status')
        .eq('id', userId)
        .single();

      // Verificăm dacă există o achiziție individuală directă One-Time de 49 lei pentru acest șablon specific
      const { data: achizitii } = await supabase
        .from('user_purchases')
        .select('product_id')
        .eq('user_id', userId)
        .eq('product_id', templateId);

      const esteAbonatActiv = profil && profil.subscription_status === 'active' && 
                             (profil.subscription_tier === 'founder' || profil.subscription_tier === 'pro');
      const areAchizitieIndividuala = achizitii && achizitii.length > 0;

      if (!esteAbonatActiv && !areAchizitieIndividuala) {
        return NextResponse.json({ 
          success: false, 
          message: 'Acces refuzat. Acest șablon academic necesită un abonament Pro / Lifetime activ sau achiziție individuală (49 RON).' 
        }, { status: 403 });
      }
    }

    let titluOficial = '';
    let temeiLegal = '';
    let articoleSpecificeHtml = '';

    // DICȚIONAR JURIDIC DINAMIC PENTRU CELE 10 MODELE ÎN ALB
    switch (templateId) {
      case 'prestari_gratuit':
        titluOficial = "CONTRACT-CADRU DE PRESTĂRI SERVICII COMERCIALE";
        temeiLegal = "Prezentul contract este încheiat în temeiul Art. 1851 - Art. 1880 din Codul Civil român privitor la contractul de antrepriză și prestări servicii.";
        articoleSpecificeHtml = `
          <div class="art-title">ARTICOLUL 3. OBLIGAȚIILE PRESTATORULUI</div>
          <div class="paragraph">3.1. Prestatorul se obligă să execute serviciile menționate cu diligență profesională maximă, respectând termenele stabilite de comun acord cu Beneficiarul.</div>
          <div class="art-title">ARTICOLUL 4. PLAFONARE REVIZII ȘI FEEDBACK COMERCIAL</div>
          <div class="paragraph">4.1. Modificările solicitate de Beneficiar sunt limitate la maximum 2 runde incluse în bugetul inițial. Orice revizie suplimentară se va tarifa separat conform tarifelor de listă standard ale Prestatorului.</div>
        `;
        break;

      case 'nda_premium':
        titluOficial = "ACORD DE CONFIDENȚIALITATE ȘI PROTECȚIE A SECRETELOR COMERCIALE (NDA)";
        temeiLegal = "Fundamentat legal în baza prevederilor Art. 1184 și Art. 1200 din Codul Civil român privind obligația de confidențialitate și buna-credință comercială.";
        articoleSpecificeHtml = `
          <div class="art-title">ARTICOLUL 3. DEFINIREA INFORMAȚIILOR CONFIDENȚIALE</div>
          <div class="paragraph">3.1. Sunt considerate informații confidențiale toate datele tehnice, financiare, secretele de producție, bazele de date de clienți sau planurile de business transmise pe parcursul negocierilor.</div>
          <div class="art-title">ARTICOLUL 4. DAUNE-INTERESE FIXE ȘI PENALIZĂRI</div>
          <div class="paragraph">4.1. Încălcarea prezentului acord atrage răspunderea patrimonială directă a părții în culpă, care se obligă la plata unor daune interese predefinite în cuantum fix stabilit prin acord bilateral.</div>
        `;
        break;

      case 'cda_premium':
        titluOficial = "CONTRACT DE CESIUNE EXCLUSIVĂ A DREPTURILOR PATRIMONIALE DE AUTOR";
        temeiLegal = "Guvernat în mod imperativ de dispozițiile imperative ale Legii nr. 8/1996 privind dreptul de autor și drepturile conexe, cu modificările ulterioare.";
        articoleSpecificeHtml = `
          <div class="art-title">ARTICOLUL 3. SFERA DE EXPLOATARE PATRIMONIALĂ</div>
          <div class="paragraph">3.1. Autorul cedează în mod exclusiv drepturile de reproducere, distribuire, radiodifuzare și import al operei create, pe o durată determinată de ani specificată în anexă.</div>
          <div class="art-title">ARTICOLUL 4. TRANSFER CONDIȚIONAT DE PLATĂ INTEGRALĂ</div>
          <div class="paragraph">4.1. Drepturile patrimoniale de exploatare se transferă către Cesionar exclusiv în momentul decontării bancare integrale și efective a remunerației stabilite în prezentul înscris.</div>
        `;
        break;

      case 'inchiriere_auto_premium':
        titluOficial = "CONTRACT DE LOCAȚIUNE ȘI EXPLOATARE BUNURI MOBILE (AUTO/ECHIPAMENTE)";
        temeiLegal = "În conformitate cu normele dreptului comun din materia locațiunii mobile reglementate de Codul Civil român.";
        articoleSpecificeHtml = `
          <div class="art-title">ARTICOLUL 3. STAREA BUNULUI ȘI REȚINERE GARANȚII</div>
          <div class="paragraph">3.1. Locatarul preia bunul mobil în stare perfectă de funcționare și constituie un fond de garanție valoric pentru acoperirii eventualelor avarii sau uzuri anormale.</div>
        `;
        break;

      case 'inchiriere_imobil_premium':
        titluOficial = "CONTRACT DE LOCAȚIUNE ȘI EXPLOATARE SPAȚIU IMOBILIAR (LOCUINȚĂ)";
        temeiLegal = "În conformitate cu Art. 1777 - Art. 1835 din Codul Civil român privitoare la locațiunea imobilelor rezidențiale.";
        articoleSpecificeHtml = `
          <div class="art-title">ARTICOLUL 3. DEPOZIT DE GARANȚIE ȘI RESTITUIRE</div>
          <div class="paragraph">3.1. Locatarul va pune la dispoziția Locatorului o garanție valorică echivalentă cu o chirie lunară, destinată acoperirii daunelor sau a debitelor acumulate la regie sau utilități publice.</div>
        `;
        break;

      case 'comercial_premium':
        titluOficial = "CONTRACT DE LOCAȚIUNE SPAȚIU COMERCIAL ȘI BIROURI (TITLU EXECUTORIU)";
        temeiLegal = "Guvernat de Art. 1777 și Art. 1798 din Codul Civil român, înscrisul comercial constituind de drept un instrument cu valoare executorie directă.";
        articoleSpecificeHtml = `
          <div class="art-title">ARTICOLUL 3. CARACTERUL EXECUTORIU DIRECT</div>
          <div class="paragraph">3.1. În conformitate cu art. 1798 Cod Civil, prezentul contract constituie TITLU EXECUTORIU pentru recuperarea chiriilor restante și pentru evacuarea rapidă a Locatarului, fără procedură judecătorească.</div>
        `;
        break;

      case 'management_premium':
        titluOficial = "CONTRACT COMERCIAL DE MANAGEMENT ȘI CONSULTANȚĂ B2B";
        temeiLegal = "Încheiat în baza dispozițiilor Codului Civil român privind libertatea contractuală și contractele de prestări servicii strategice.";
        articoleSpecificeHtml = `
          <div class="art-title">ARTICOLUL 3. INDICATORI KEY DE PERFORMANȚĂ (KPI)</div>
          <div class="paragraph">3.1. Managerul se obligă la monitorizarea activității operaționale și atingerea obiectivelor specifice de profitabilitate industrială detaliate în anexă.</div>
        `;
        break;

      case 'sponsorizare_premium':
        titluOficial = "CONTRACT DE SPONSORIZARE STRATEGICĂ COMPANIE";
        temeiLegal = "Încheiat în strictă conformitate cu prevederile Legii nr. 32/1994 privind sponsorizarea, cu aplicarea deductibilităților prevăzute de Codul Fiscal român.";
        articoleSpecificeHtml = `
          <div class="art-title">ARTICOLUL 3. DEDUCTIBILITATE ȘI TRANSMISIE DIRECTĂ</div>
          <div class="paragraph">3.1. Sponsorul transferă cu titlu gratuit, în scopul susținerii activităților non-profit, suma convenită, contractul asigurând cadrul legal pentru deducerea fiscală directă din impozitul pe profit.</div>
        `;
        break;

      case 'asociere_premium':
        titluOficial = "ACORD COMERCIAL DE ASOCIERE ÎN PARTICIPAȚIUNE";
        temeiLegal = "Încheiat în baza prevederilor Art. 1949 - Art. 1954 din Codul Civil român privitoare la asocierea în participațiune dintre două entități.";
        articoleSpecificeHtml = `
          <div class="art-title">ARTICOLUL 3. DISTRIBUIREA PROFITULUI ȘI A PIERDERILOR</div>
          <div class="paragraph">3.1. Părțile convin ca asocierea să nu dea naștere unei noi persoane juridice la ONRC, cota de participare la beneficii și pierderi fiind reglementată la un procent fix agreat.</div>
        `;
        break;

      case 'comodat_premium':
        titluOficial = "CONTRACT DE COMODAT / ÎMPRUMUT DE FOLOSINȚĂ GRATUITĂ SPAȚIU SEDIU";
        temeiLegal = "Guvernat de prevederile Art. 2146 - Art. 2157 din Codul Civil român privitoare la împrumutul de folosință gratuită.";
        articoleSpecificeHtml = `
          <div class="art-title">ARTICOLUL 3. DESTINAȚIA BUNULUI ȘI STABILIRE SEDIU SOCIAL</div>
          <div class="paragraph">3.1. Comodantul împrumută în mod gratuit Comodatarului spațiul imobiliar identificat în procesul-verbal, cu destinația exclusivă de stabilire a sediului social al societății comerciale.</div>
        `;
        break;

      default:
        titluOficial = "MODEL DE CONTRACT COMERCIAL STANDARD";
        temeiLegal = "Dispozițiile generale comerciale în conformitate cu Codul Civil român.";
    }

    // ARANJAMENT JURIDIC PRESTABILIT PREMIUM "ÎN ALB" - INTEGRAT CU LINII FLEXIBILE STRUCTURALE
    const htmlTemplateBlank = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Times New Roman', Times, serif; padding: 50px; color: #000000; line-height: 1.6; font-size: 14px; }
          .official-header { font-family: Arial, sans-serif; color: #64748b; font-size: 10px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-bottom: 40px; text-align: center; }
          .title { text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
          .subtitle { text-align: center; font-size: 11px; margin-bottom: 35px; font-style: italic; }
          .capitol-title { font-weight: bold; margin-top: 25px; margin-bottom: 10px; text-transform: uppercase; font-size: 14px; }
          .art-title { font-weight: bold; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase; font-size: 13px; }
          .paragraph { text-align: justify; margin-bottom: 12px; text-indent: 30px; }
          .signature-layout { margin-top: 60px; display: flex; justify-content: space-between; page-break-inside: avoid; }
          .signature-column { width: 45%; text-align: center; border-top: 1px solid #000000; padding-top: 8px; font-size: 13px; font-weight: bold; }
          .footer { margin-top: 80px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #64748b; text-align: center; font-family: Arial, sans-serif; }
          
          /* IMPLEMENTARE CHIRURGICALĂ SIDEQUEST LINII FLEXIBILE DINAMICE */
          .linia-dinamica { display: inline-block; border-bottom: 1px solid #000000; height: 16px; vertical-align: bottom; }
        </style>
      </head>
      <body>
        <div class="official-header">LIBRĂRIA TIPURILOR DE CONTRACTE // ACADEMIC FORMAT SECURED</div>
        
        <div class="title">${titluOficial}</div>
        <div class="subtitle">Model Tipizat Oficial Editabil „În Alb” // Ediția 2026 // Audit Legal ContractSmart</div>
        
        <div class="capitol-title">CAPITOLUL I. PĂRȚILE CONTRACTANTE</div>
        <div class="paragraph">
          <strong>PARTEA PRIMĂ (DENUMITĂ LEGAL FURNIZOR / LOCATOR / COMODANT):</strong> Întreprinderea / Subsemnatul <span class="linia-dinamica" style="min-width: 250px;">&nbsp;</span>, cu sediul în <span class="linia-dinamica" style="min-width: 250px;">&nbsp;</span>, cod fiscal / CUI / CNP <span class="linia-dinamica" style="min-width: 140px;">&nbsp;</span>, reprezentată legal prin <span class="linia-dinamica" style="min-width: 150px;">&nbsp;</span> în calitate de reprezentant.
        </div>
        <div class="paragraph" style="text-align: center; text-indent: 0;">și</div>
        <div class="paragraph">
          <strong>PARTEA SECUNDĂ (DENUMITĂ LEGAL BENEFICIAR / LOCATAR / COMODATAR):</strong> Întreprinderea / Subsemnatul <span class="linia-dinamica" style="min-width: 250px;">&nbsp;</span>, cu sediul în <span class="linia-dinamica" style="min-width: 250px;">&nbsp;</span>, cod fiscal / CUI / CNP <span class="linia-dinamica" style="min-width: 140px;">&nbsp;</span>, reprezentată legal prin <span class="linia-dinamica" style="min-width: 150px;">&nbsp;</span> în calitate de reprezentant.
        </div>

        <div class="capitol-title">CAPITOLUL II. OBIECTUL CONTRACTULUI ȘI TEMEIUL DE DREPT</div>
        <div class="paragraph"><strong>ARTICOLUL 1:</strong> ${temeiLegal}</div>
        <div class="paragraph"><strong>ARTICOLUL 2:</strong> Obiectul prezentului înscris oficial constă în executarea sarcinilor economice, punerea la dispoziție sau decontarea activităților definite de comun acord conform specificațiilor tehnice: <span class="linia-dinamica" style="min-width: 100%; height: 35px;">&nbsp;</span></div>

        <div class="capitol-title">CAPITOLUL III. COMPLEMENTE ȘI ARTICOLE JURIDICE SPECIFICE</div>
        ${articoleSpecificeHtml}

        <div class="capitol-title">CAPITOLUL IV. FORȚĂ MAJORĂ ȘI LITIGII COMERCIALE</div>
        <div class="paragraph"><strong>ARTICOLUL 5:</strong> Forța majoră exonerează de răspundere partea care o invocă conform legislației române, cu obligația transmiterii unei notificări scrise în termen de maximum 5 zile de la apariția evenimentului fortuit.</div>
        <div class="paragraph"><strong>ARTICOLUL 6:</strong> Orice diferend comercial decurgând din interpretarea prezentului contract se va soluționa pe cale amiabilă. În caz contrar, competența teritorială de judecată revine instanțelor de drept comun competente.</div>

        <div class="signature-layout">
          <div class="signature-column">SEMNĂTURĂ PRIMA PARTE<br><br><br><span style="font-size:10px; font-weight:normal; color:#94a3b8;">[L.S. / Ștampilă Manuală / Olograf]</span></div>
          <div class="signature-column">SEMNĂTURĂ A DOUA PARTE<br><br><br><span style="font-size:10px; font-weight:normal; color:#94a3b8;">[L.S. / Ștampilă Manuală / Olograf]</span></div>
        </div>

        <div class="footer">
          Document generat binar de pe serverul local de producție. Audit legal realizat prin platforma ContractSmart în 2026.
        </div>
      </body>
      </html>
    `;

    // EXECUTARE PRIN PUPPETEER PENTRU REZOLVAREA DEFINITIVĂ A FILIERI .DOCX ERORI
    let browser=await puppeteer.launch(process.env.NODE_ENV==='development'?{headless:"new",executablePath:"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"}:{args:chromium.args,executablePath:await chromium.executablePath(),headless:chromium.headless});

    const page = await browser.newPage();
    await page.setContent(htmlTemplateBlank, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '40px', bottom: '40px', left: '40px', right: '40px' }
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=model_${templateId}_tipizat.pdf`,
        'Content-Length': pdfBuffer.length,
      },
    });

  } catch (error) {
    console.error("Crash generare model:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}