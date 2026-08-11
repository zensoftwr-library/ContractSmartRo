import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { templateId, userId } = body;

    if (!templateId) {
      return NextResponse.json({ success: false, message: 'Template ID lipsă.' }, { status: 400 });
    }

    if (templateId !== 'prestari_gratuit') {
      if (!userId) {
        return NextResponse.json({ success: false, message: 'Autentificare obligatorie pentru descărcarea modelelor premium.' }, { status: 401 });
      }

      const { data: profil } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status, is_pro')
        .eq('id', userId)
        .single();

      const { data: achizitii } = await supabase
        .from('user_purchases')
        .select('product_id')
        .eq('user_id', userId)
        .eq('product_id', templateId);

      const isPremium = profil && (profil.subscription_tier === 'founder' || profil.subscription_tier === 'pro' || profil.is_pro);
      const areAchizitieIndividuala = achizitii && achizitii.length > 0;

      if (!isPremium && !areAchizitieIndividuala) {
        return NextResponse.json({ 
          success: false, 
          message: 'Acces refuzat. Acest șablon academic necesită un abonament Pro / Lifetime activ sau achiziție individuală (49 RON).' 
        }, { status: 403 });
      }
    }

    let titluOficial = '';
    let temeiLegal = '';
    let articoleSpecificeHtml = '';

    switch (templateId) {
      case 'prestari_gratuit':
        titluOficial = "CONTRACT-CADRU DE PRESTĂRI SERVICII COMERCIALE";
        temeiLegal = "Prezentul contract este încheiat în temeiul Art. 1851 - Art. 1880 din Codul Civil român privitor la contractul de antrepriză și prestări servicii.";
        articoleSpecificeHtml = `
          <div class="art-title">ARTICOLUL 3. OBLIGAȚIILE PRESTATORULUI ȘI REȚINERE IP</div>
          <div class="paragraph">3.1. Prestatorul se obligă să execute serviciile menționate cu diligență profesională maximă. Toate livrabilele, planurile și materialele de proiect rămân în proprietatea exclusivă a Prestatorului până la momentul stingerii integrale a tuturor obligațiilor de plată.</div>
          <div class="art-title">ARTICOLUL 4. PLAFONARE REVIZII ȘI PENALITĂȚI DE ÎNTÂRZIERE</div>
          <div class="paragraph">4.1. Modificările solicitate de Beneficiar sunt limitate la maximum 2 runde incluse în bugetul inițial. Orice revizie suplimentară se va tarifa separat.</div>
          <div class="paragraph">4.2. Depășirea scadenței facturilor atrage penalități de întârziere în cuantum de 0.5% pe zi calendaristică, calculate din suma restantă, constituind clauză penală conform Art. 1538 Cod Civil.</div>
        `;
        break;

      case 'nda_premium':
        titluOficial = "ACORD DE CONFIDENȚIALITATE ȘI PROTECȚIE A SECRETELOR COMERCIALE (NDA)";
        temeiLegal = "Fundamentat legal în baza prevederilor Art. 1184 și Art. 1200 din Codul Civil român privind obligația de confidențialitate și buna-credință comercială.";
        articoleSpecificeHtml = `
          <div class="art-title">ARTICOLUL 3. DEFINIREA INFORMAȚIILOR CONFIDENȚIALE</div>
          <div class="paragraph">3.1. Sunt considerate informații confidențiale toate datele tehnice, financiare, secretele de producție, bazele de date de clienți sau planurile de business transmise pe parcursul negocierilor.</div>
          <div class="art-title">ARTICOLUL 4. DAUNE-INTERESE FIXE ȘI DISTRUGERE DATE</div>
          <div class="paragraph">4.1. Încălcarea prezentului acord atrage răspunderea patrimonială directă a părții în culpă, care se obligă la plata unor daune interese predefinite în cuantum fix stabilit prin acord bilateral.</div>
          <div class="paragraph">4.2. La încetarea discuțiilor, Partea Primitoare se obligă să distrugă definitiv toate documentele și copiile digitale primite, transmițând o confirmare scrisă în 48 de ore.</div>
        `;
        break;

      case 'cda_premium':
        titluOficial = "CONTRACT DE CESIUNE EXCLUSIVĂ A DREPTURILOR PATRIMONIALE DE AUTOR";
        temeiLegal = "Guvernat în mod imperativ de dispozițiile imperative ale Legii nr. 8/1996 privind dreptul de autor și drepturile conexe, cu modificările ulterioare.";
        articoleSpecificeHtml = `
          <div class="art-title">ARTICOLUL 3. TRANSFER CONDIȚIONAT ȘI GARANȚIA ORIGINALITĂȚII</div>
          <div class="paragraph">3.1. Autorul garantează absolut și sub sancțiunea legii penale că opera este 100% creație originală, nu încalcă drepturile terților (fără plagiat) și nu a mai fost cedată anterior.</div>
          <div class="paragraph">3.2. Drepturile patrimoniale de exploatare se transferă către Cesionar exclusiv în momentul decontării bancare integrale și efective a remunerației stabilite. Orice utilizare, difuzare sau exploatare a operei înainte de achitarea integrală atrage aplicarea unui tarif penalizator dublu per incidență.</div>
          <div class="art-title">ARTICOLUL 4. DREPT DE CREDITARE ȘI INALIENABILITATEA DREPTURILOR MORALE</div>
          <div class="paragraph">4.1. Drepturile morale de autor rămân atașate Autorului în mod perpetuu și inalienabil. Beneficiarul are obligația corelativă de a menționa numele Autorului pe materialele publicate.</div>
        `;
        break;

      case 'inchiriere_imobil_premium':
        titluOficial = "CONTRACT DE LOCAȚIUNE ȘI EXPLOATARE SPAȚIU IMOBILIAR (LOCUINȚĂ)";
        temeiLegal = "În conformitate cu Art. 1777 - Art. 1835 din Codul Civil român privitoare la locațiunea imobilelor rezidențiale. Raportul este supus dispozițiilor Art. 1798 din Codul Civil, constituind TITLU EXECUTORIU.";
        articoleSpecificeHtml = `
          <div class="art-title">ARTICOLUL 3. DEPOZIT DE GARANȚIE ȘI CLAUZĂ DE EVACUARE</div>
          <div class="paragraph">3.1. Locatarul va pune la dispoziția Locatorului o garanție valorică echivalentă cu o chirie lunară. În conformitate cu art. 1798 Cod Civil, prezentul contract constituie titlu executoriu de drept pentru recuperarea chiriilor restante și pentru evacuarea rapidă a Locatarului la expirarea termenului sau în caz de neplată, fără somație prealabilă.</div>
          <div class="art-title">ARTICOLUL 4. RĂSPUNDEREA PENTRU DAUNE PROVOCATE TERȚILOR</div>
          <div class="paragraph">4.1. Locatarul este 100% solidar responsabil pentru orice distrugeri (inundații, incendii din culpă, vandalism) provocate vecinilor sau spațiilor comune, degrevând total Locatorul de orice acțiune în regres. Subînchirierea spațiului este strict interzisă fără acord scris.</div>
        `;
        break;

      case 'promisiune_vanzare_premium':
        titluOficial = "ANTECONTRACT / PROMISIUNE BILATERALĂ DE VÂNZARE-CUMPĂRARE IMOBIL";
        temeiLegal = "Guvernat de normele cuprinse în Art. 1669 și Art. 1279 din Codul Civil român (promisiunea de a contracta și executarea silită a obligațiilor corelative), cu aplicarea strictă a regimului juridic penalizator al arvunei confirmatorii.";
        articoleSpecificeHtml = `
          <div class="art-title">ARTICOLUL 3. EXECUTARE ARVUNĂ CONFIRMATORIE</div>
          <div class="paragraph">3.1. În temeiul Art. 1544 Cod Civil, în caz de reziliere din culpa sau răzgândirea Promitentului Cumpărător, sumele predate cu titlu de avans vor fi reținute integral de către Vânzător. În caz de renunțare din culpa Promitentului Vânzător, acesta este obligat de drept la restituirea dublului sumei încasate.</div>
          <div class="art-title">ARTICOLUL 4. RISCUL PIEIRII BUNULUI ȘI REZOLUȚIUNEA DE DREPT</div>
          <div class="paragraph">4.1. Până la semnarea formei autentice notariale, riscul pieirii fortuite a imobilului rămâne în sarcina Promitentului-Vânzător. Împlinirea termenului extinctiv fără perfectarea contractului de vânzare determină desființarea de drept a promisiunii prin efectul pactului comisoriu.</div>
        `;
        break;

      case 'inchiriere_auto_premium':
        titluOficial = "CONTRACT DE LOCAȚIUNE VEHICULE ȘI ECHIPAMENTE MOBILIERE";
        temeiLegal = "În conformitate cu normele dreptului comun din materia locațiunii bunurilor mobile reglementate de Codul Civil român.";
        articoleSpecificeHtml = `
          <div class="art-title">ARTICOLUL 3. STAREA BUNULUI ȘI REȚINERE GARANȚII</div>
          <div class="paragraph">3.1. Locatarul preia bunul mobil în stare perfectă de funcționare și constituie un fond de garanție valoric pentru acoperirea eventualelor avarii, francize CASCO sau uzuri anormale.</div>
        `;
        break;

      case 'management_premium':
        titluOficial = "CONTRACT COMERCIAL DE MANAGEMENT ȘI CONSULTANȚĂ B2B";
        temeiLegal = "Încheiat în baza dispozițiilor Codului Civil român și a Legii 31/1990 privind libertatea contractuală și contractele de prestări servicii executive.";
        articoleSpecificeHtml = `
          <div class="art-title">ARTICOLUL 3. INDICATORI KEY DE PERFORMANȚĂ (KPI) ȘI NON-SOLICITARE</div>
          <div class="paragraph">3.1. Managerul se obligă la monitorizarea activității operaționale și atingerea obiectivelor specifice de profitabilitate industrială. Beneficiarul se obligă ferm să nu recruteze personalul Consultantului pe o perioadă de 24 de luni.</div>
        `;
        break;

      case 'sponsorizare_premium':
        titluOficial = "CONTRACT DE SPONSORIZARE STRATEGICĂ";
        temeiLegal = "Încheiat în strictă conformitate cu prevederile Legii nr. 32/1994 privind sponsorizarea, cu aplicarea deductibilităților prevăzute de Codul Fiscal român.";
        articoleSpecificeHtml = `
          <div class="art-title">ARTICOLUL 3. DEDUCTIBILITATE ȘI TRANSMISIE DIRECTĂ</div>
          <div class="paragraph">3.1. Sponsorul transferă cu titlu gratuit, în scopul susținerii activităților non-profit, suma convenită, contractul asigurând cadrul legal pentru deducerea fiscală directă din impozitul pe profit.</div>
        `;
        break;

      case 'asociere_premium':
        titluOficial = "ACORD COMERCIAL DE ASOCIERE ÎN PARTICIPAȚIUNE";
        temeiLegal = "Încheiat în baza prevederilor Art. 1949 - Art. 1954 din Codul Civil român privitoare la asocierea în participațiune dintre două sau mai multe entități.";
        articoleSpecificeHtml = `
          <div class="art-title">ARTICOLUL 3. DISTRIBUIREA PROFITULUI ȘI A PIERDERILOR</div>
          <div class="paragraph">3.1. Părțile convin ca asocierea să nu dea naștere unei noi persoane juridice la ONRC, cota de participare la beneficii și pierderi fiind reglementată la un procent fix agreat și asumat.</div>
        `;
        break;

      case 'comodat_premium':
        titluOficial = "CONTRACT DE COMODAT / ÎMPRUMUT DE FOLOSINȚĂ GRATUITĂ";
        temeiLegal = "Guvernat de prevederile Art. 2146 - Art. 2157 din Codul Civil român privitoare la împrumutul de folosință gratuită.";
        articoleSpecificeHtml = `
          <div class="art-title">ARTICOLUL 3. DESTINAȚIA BUNULUI ȘI STABILIRE SEDIU SOCIAL</div>
          <div class="paragraph">3.1. Comodantul împrumută în mod gratuit Comodatarului spațiul imobiliar identificat în procesul-verbal, cu destinația exclusivă de stabilire a sediului social al societății comerciale sau al punctului de lucru.</div>
        `;
        break;

      default:
        titluOficial = "MODEL DE CONTRACT COMERCIAL STANDARD";
        temeiLegal = "Dispozițiile generale comerciale în conformitate cu Codul Civil român.";
        articoleSpecificeHtml = "";
    }

    const htmlTemplateBlank = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Times New Roman', Times, serif; 
            padding: 50px; 
            color: #000000; 
            line-height: 1.6; 
            font-size: 14px; 
          }
          .official-header { 
            font-family: Arial, sans-serif; 
            color: #64748b; 
            font-size: 10px; 
            text-transform: uppercase; 
            border-bottom: 1px solid #cbd5e1; 
            padding-bottom: 5px; 
            margin-bottom: 40px; 
            text-align: center; 
          }
          .title { 
            text-align: center; 
            font-size: 16px; 
            font-weight: bold; 
            margin-bottom: 5px; 
            text-transform: uppercase; 
          }
          .subtitle { 
            text-align: center; 
            font-size: 11px; 
            margin-bottom: 35px; 
            font-style: italic; 
          }
          .capitol-title { 
            font-weight: bold; 
            margin-top: 25px; 
            margin-bottom: 10px; 
            text-transform: uppercase; 
            font-size: 14px; 
          }
          .art-title { 
            font-weight: bold; 
            margin-top: 15px; 
            margin-bottom: 5px; 
            text-transform: uppercase; 
            font-size: 13px; 
          }
          .paragraph { 
            text-align: justify; 
            margin-bottom: 12px; 
            text-indent: 30px; 
          }
          .signature-layout { 
            margin-top: 60px; 
            display: flex; 
            justify-content: space-between; 
            page-break-inside: avoid; 
          }
          .signature-column { 
            width: 45%; 
            text-align: center; 
            border-top: 1px solid #000000; 
            padding-top: 8px; 
            font-size: 13px; 
            font-weight: bold; 
          }
          .footer { 
            margin-top: 80px; 
            border-top: 1px solid #e2e8f0; 
            padding-top: 10px; 
            font-size: 10px; 
            color: #64748b; 
            text-align: center; 
            font-family: Arial, sans-serif; 
          }
          .linia-dinamica { 
            display: inline-block; 
            border-bottom: 1px solid #000000; 
            height: 16px; 
            vertical-align: bottom; 
          }
        </style>
      </head>
      <body>
        <div class="official-header">LIBRĂRIA TIPURILOR DE CONTRACTE // ACADEMIC FORMAT SECURED</div>
        
        <div class="title">${titluOficial}</div>
        <div class="subtitle">Model Tipizat Oficial Editabil „În Alb” // Ediția 2026 // Audit Legal ContractSmart</div>
        
        <div class="capitol-title">CAPITOLUL I. PĂRȚILE CONTRACTANTE</div>
        <div class="paragraph">
          <strong>PARTEA PRIMĂ (DENUMITĂ LEGAL FURNIZOR / LOCATOR / COMODANT / PROMITENT-VÂNZĂTOR):</strong> Întreprinderea / Subsemnatul <span class="linia-dinamica" style="min-width: 250px;">&nbsp;</span>, cu sediul în <span class="linia-dinamica" style="min-width: 250px;">&nbsp;</span>, cod fiscal / CUI / CNP <span class="linia-dinamica" style="min-width: 140px;">&nbsp;</span>, reprezentată legal prin <span class="linia-dinamica" style="min-width: 150px;">&nbsp;</span>.
        </div>
        <div class="paragraph" style="text-align: center; text-indent: 0;">și</div>
        <div class="paragraph">
          <strong>PARTEA SECUNDĂ (DENUMITĂ LEGAL BENEFICIAR / LOCATAR / COMODATAR / PROMITENT-CUMPĂRĂTOR):</strong> Întreprinderea / Subsemnatul <span class="linia-dinamica" style="min-width: 250px;">&nbsp;</span>, cu sediul în <span class="linia-dinamica" style="min-width: 250px;">&nbsp;</span>, cod fiscal / CUI / CNP <span class="linia-dinamica" style="min-width: 140px;">&nbsp;</span>, reprezentată legal prin <span class="linia-dinamica" style="min-width: 150px;">&nbsp;</span>.
        </div>

        <div class="capitol-title">CAPITOLUL II. OBIECTUL CONTRACTULUI ȘI TEMEIUL DE DREPT</div>
        <div class="paragraph"><strong>ARTICOLUL 1:</strong> ${temeiLegal}</div>
        <div class="paragraph"><strong>ARTICOLUL 2:</strong> Obiectul prezentului înscris oficial constă în executarea sarcinilor economice, punerea la dispoziție sau decontarea activităților definite de comun acord conform specificațiilor tehnice: <span class="linia-dinamica" style="min-width: 100%; height: 35px;">&nbsp;</span></div>

        <div class="capitol-title">CAPITOLUL III. COMPLEMENTE ȘI ARTICOLE JURIDICE SPECIFICE</div>
        ${articoleSpecificeHtml}

        <div class="capitol-title">CAPITOLUL IV. FORȚĂ MAJORĂ ȘI LITIGII COMERCIALE</div>
        <div class="paragraph"><strong>ARTICOLUL X:</strong> Forța majoră exonerează de răspundere partea care o invocă conform legislației române, cu obligația transmiterii unei notificări scrise în termen de maximum 5 zile de la apariția evenimentului fortuit. Restricțiile administrative (ANAF/ONRC) se asimilează forței majore.</div>
        <div class="paragraph"><strong>ARTICOLUL Y:</strong> Orice diferend comercial decurgând din interpretarea prezentului contract se va soluționa pe cale amiabilă. În caz contrar, competența teritorială de judecată revine exclusiv instanțelor de drept comun de la sediul Prestatorului.</div>

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

    let browser;
    if (process.env.NODE_ENV === 'development') {
      browser = await puppeteer.launch({ 
        headless: true, 
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" 
      });
    } else {
      browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        headless: true,
      });
    }

    const page = await browser.newPage();
    await page.setContent(htmlTemplateBlank, { waitUntil: 'domcontentloaded' });
    
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