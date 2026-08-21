import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';

export const dynamic = 'force-dynamic';

// Unificarea variabilelor de mediu pentru a preveni erorile de tip 400 Bad Request
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ success: false, message: 'Invalid Content-Type' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      tipContract, initiatorRol, obiect, valoare, moneda, 
      prestatorNume, prestatorCui, prestatorReprezentant, clientNume, clientCui, clientReprezentant, 
      clientEmail, semnăturaBase64, userId, adaugaProcesVerbal, captchaToken,
      constructiiMateriale, constructiiManopera, constructiiSuprafata, constructiiPretMp,
      adaugaQrPlata, ibanPlata, clauzaCustom
    } = body;

    // -------------------------------------------------------------------------
    // VALIDARE ANTI-SPAM CLOUDFLARE TURNSTILE PE BACKEND
    // -------------------------------------------------------------------------
    if (process.env.TURNSTILE_SECRET_KEY && captchaToken) {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${captchaToken}`
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return NextResponse.json({ success: false, message: 'Validare anti-spam (Cloudflare) eșuată. Reîncărcați pagina.' }, { status: 403 });
      }
    }

    // --- VERIFICARE ANAF PRE-SEMNARE ---
    
    if (clientCui) {
      const cleanCui = clientCui.replace(/[^0-9]/g, '');
      if (cleanCui.length >= 5) {
        const anafRes = await fetch(`https://api.contractsmart.ro/api/anaf?cui=${cleanCui}`);
        const anafData = await anafRes.json();
        
        if (anafData.success && anafData.data?.stare && (anafData.data.stare.toUpperCase().includes('INACTIV') || anafData.data.stare.toUpperCase().includes('RADIAT'))) {
          return NextResponse.json({ 
            success: false, 
            message: `Atenție! Firma ${anafData.data.denumire} are starea fiscală: ${anafData.data.stare}. Nu recomandăm semnarea contractului.` 
          }, { status: 403 });
        }
      }
    }
    // ------------------------------------

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Utilizator neautentificat.' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, credits_remaining, is_pro')
      .eq('id', userId)
      .single();

    const tier = (profile?.subscription_tier || 'free').toLowerCase().trim();
    const isPremium = tier.includes('founder') || tier.includes('pro') || profile?.is_pro;
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
        temeiJuridicHtml = `Prezentul înscris se fundamentează pe dispozițiile <strong>Art. 1184 și Art. 1200 din Codul Civil român</strong> referitoare la obligația de confidențialitate în cadrul negocierilor precontractuale, coroborat cu reglementările stricte privind protecția secretelor de afaceri.`;
        break;
      case 'cda':
        titluContractOficial = "CONTRACT DE CESIUNE EXCLUSIVĂ A DREPTURILOR PATRIMONIALE DE AUTOR";
        temeiJuridicHtml = `Raportul juridic este reglementat de normele imperative ale <strong>Legii nr. 8/1996 privind dreptul de autor și drepturile conexe</strong>, republicată și actualizată, operând o distincție absolută între drepturile nepatrimoniale (morale) și exploatarea patrimonială a operei.`;
        break;
      case 'inchiriere_imobil':
        titluContractOficial = "CONTRACT DE LOCAȚIUNE ȘI EXPLOATARE SPAȚIU IMOBILIAR";
        temeiJuridicHtml = `Încheiat conform <strong>Art. 1777 - Art. 1835 din Codul Civil român</strong>. Raportul este supus dispozițiilor <strong>Art. 1798 din Codul Civil</strong>, constituind un instrument cu valoare de <strong>TITLU EXECUTORIU</strong> pentru evacuare la termen și debite restante.`;
        break;
      case 'promisiune_vanzare':
        titluContractOficial = "ANTECONTRACT / PROMISIUNE BILATERALĂ DE VÂNZARE-CUMPĂRARE IMOBIL";
        temeiJuridicHtml = `Guvernat de normele cuprinse în <strong>Art. 1669 și Art. 1279 din Codul Civil român</strong> (promisiunea de a contracta și executarea silită a obligațiilor corelative), cu aplicarea strictă a regimului juridic penalizator al arvunei confirmatorii.`;
        break;
      case 'colaborare_b2b':
        titluContractOficial = "CONTRACT DE COLABORARE COMERCIALĂ INDEPENDENTĂ";
        temeiJuridicHtml = `Guvernat de prevederile generale ale Codului Civil privind obligațiile. Prestatorul acționează pe riscul și cu mijloacele sale proprii, nefiind integrat în organigrama Beneficiarului, preîntâmpinând astfel recalificarea fiscală.`;
        break;
      case 'design_arhitectura':
        titluContractOficial = "CONTRACT DE ANTREPRIZĂ PENTRU DESIGN ȘI ARHITECTURĂ";
        temeiJuridicHtml = `Supus normelor speciale de antrepriză (Art. 1851 Cod Civil) și Legii nr. 8/1996. Proiectul arhitectural reprezintă operă de creație intelectuală, a cărei implementare faptică este condiționată de recepția finală.`;
        break;
      case 'evenimente':
        titluContractOficial = "CONTRACT PRESTĂRI SERVICII EVENIMENTE (ENTERTAINMENT)";
        temeiJuridicHtml = `Încheiat în baza principiului libertății contractuale. Obligația asumată este una de mijloace, nu de rezultat. Suma achitată cu titlu de avans poartă regim de "Non-Refundable Retainer" pentru blocarea calendarului.`;
        break;
      case 'influencer':
        titluContractOficial = "CONTRACT DE PARTENERIAT & INFLUENCER MARKETING";
        temeiJuridicHtml = `Încheiat conform prevederilor Codului Civil. Beneficiarul dobândește drepturi specifice de utilizare a imaginii (Usage Rights) pentru campaniile de paid media.`;
        break;
      case 'it_sla':
        titluContractOficial = "CONTRACT PRESTĂRI SERVICII IT & SOFTWARE (AGILE/SLA)";
        temeiJuridicHtml = `Guvernat de prevederile Codului Civil și legislația specifică privind drepturile de autor asupra programelor pentru calculator (Legea 8/1996), incluzând parametri de performanță (SLA).`;
        break;
      case 'constructii':
        titluContractOficial = "CONTRACT DE EXECUȚIE LUCRĂRI ÎN REGIE PROPRIE & CONSTRUCȚII";
        temeiJuridicHtml = `Încheiat în temeiul Art. 1851-1875 Cod Civil & Legii nr. 10/1995 privind calitatea în construcții. Implică execuția, recepția pe faze determinante și respectarea devizului financiar asumat.`;
        break;
      default:
        titluContractOficial = "CONTRACT COMERCIAL GENERAL";
        temeiJuridicHtml = `Prezentul acord comercial reprezintă legea părților, fiind supus dispozițiilor generale din materia obligațiilor contractuale reglementate de Codul Civil român.`;
    }

    let clauzeInjectateHtml = '';
    
    const rules = [
      { cond: body.clauzaPi && tipContract === 'inchiriere_imobil', html: `<li><strong>ART. 4.1. CLAUZĂ DE INVESTIRE CU TITLU EXECUTORIU:</strong> În conformitate cu art. 1798 Cod Civil, prezentul contract constituie titlu executoriu de drept pentru recuperarea chiriilor restante și pentru evacuarea rapidă a Locatarului la expirarea termenului sau în caz de neplată, fără somație și fără procedură judecătorească prealabilă.</li>` },
      { cond: body.clauzaPi && tipContract === 'cda', html: `<li><strong>ART. 4.1. TRANSFER CONDIȚIONAT DE REMUNERAȚIE:</strong> Drepturile patrimoniale de exploatare a operei se transferă exclusiv condiționat de decontarea integrală, efectivă și confirmată bancar a prețului. Orice utilizare anterioară constituie delict civil și încălcare a drepturilor de autor.</li>` },
      { cond: body.clauzaPi && tipContract !== 'inchiriere_imobil' && tipContract !== 'cda', html: `<li><strong>ART. 4.1. REȚINERE DE PROPRIETATE INTELECTUALĂ:</strong> Toate livrabilele, planurile, codul sursă și materialele de proiect rămân în proprietatea exclusivă a Prestatorului până la momentul stingerii integrale a tuturor obligațiilor de plată.</li>` },
      { cond: body.clauzaPenalitati, html: `<li><strong>ART. 4.2. REGIM PENALIZATOR ȘI DAUNE INTERESE:</strong> Depășirea scadenței facturilor atrage penalități de întârziere în cuantum de 0.5% pe zi calendaristică, calculate din suma restantă.</li>` },
      { cond: body.clauzaLimitareRaspundere, html: `<li><strong>ART. 4.3. LIMITAREA RĂSPUNDERII COMERCIALE:</strong> Sub nicio formă și indiferent de natura litigiului, răspunderea financiară totală a Prestatorului pentru orice daune dovedite nu va depăși valoarea netă încasată efectiv pentru serviciile prestate în cadrul acestui contract.</li>` },
      { cond: body.clauzaInflatie, html: `<li><strong>ART. 4.4. INDEXARE ANTI-INFLAȚIONISTĂ (EUR/BNR):</strong> Pentru a menține echilibrul prestațiilor, prețul contractului va fi actualizat/indexat automat raportat la evoluția cursului EUR/RON comunicat de BNR sau la indicele inflației comunicat de INS, aplicându-se valoarea cea mai favorabilă Prestatorului.</li>` },
      { cond: body.clauzaRevizii, html: `<li><strong>ART. 4.5. PLAFONARE STRUCTURALĂ FEEDBACK:</strong> Modificările sau revizile sunt limitate la maximum 2 runde incluse în buget. Orice solicitare ulterioară va fi tarifată suplimentar prin act adițional.</li>` },
      { cond: body.clauzaTaxaAnulare && tipContract === 'promisiune_vanzare', html: `<li><strong>ART. 4.6. EXECUTARE ARVUNĂ CONFIRMATORIE:</strong> În caz de reziliere din culpa Promitentului Cumpărător, sumele predate cu titlu de avans vor fi reținute integral. În caz de renunțare a Promitentului Vânzător, acesta este obligat de drept la restituirea dublului sumei încasate.</li>` },
      { cond: body.clauzaTaxaAnulare && tipContract === 'evenimente', html: `<li><strong>ART. 4.6. REȚINERE AVANS (NON-REFUNDABLE RETAINER):</strong> Avansul încasat reprezintă rezervarea fermă a datei și a resurselor. În cazul în care Beneficiarul anulează evenimentul cu mai puțin de 90 de zile înainte, avansul este considerat daune-interese compensatorii nereturnabile.</li>` },
      { cond: body.clauzaTaxaAnulare && tipContract !== 'promisiune_vanzare' && tipContract !== 'evenimente', html: `<li><strong>ART. 4.6. PENALITATE DE ANULARE (KILL FEE):</strong> În cazul denunțării unilaterale a contractului din culpa exclusivă a Beneficiarului, sumele achitate cu titlu de avans rămân integral în posesia Prestatorului pentru blocarea resurselor operaționale.</li>` },
      { cond: body.clauzaSplitPayment, html: `<li><strong>ART. 4.7. PLĂȚI FRACȚIONATE (MILESTONES):</strong> Decontarea și recepția fiecărei etape intermediare (milestones) condiționează în mod direct și imperativ deblocarea execuției pentru fazele de lucru subsecvente.</li>` },
      { cond: body.clauzaRetentie, html: `<li><strong>ART. 4.8. DREPT DE RETENȚIE TEHNICĂ:</strong> În caz de neplată a oricărei facturi scadente în termen de 15 zile, Prestatorul are facultatea legală de a sista serviciile, de a revoca permisiunile de acces sau de a suspenda instanțele de server și activele digitale.</li>` },
      { cond: body.clauzaItNonSolicit, html: `<li><strong>ART. 4.9. CLAUZĂ DE NON-SOLICITARE PERSONAL:</strong> Beneficiarul se obligă ferm să nu recruteze, direct sau indirect prin interpuși, angajații sau subcontractorii Prestatorului pe o perioadă de 24 de luni de la încetarea contractului.</li>` },
      { cond: body.clauzaAntiRecalificare, html: `<li><strong>ART. 4.10. INDEPENDEȚĂ OPERAȚIONALĂ ȘI FISCALĂ:</strong> Relația este strict comercială (B2B). Prestatorul dispune de libertate absolută în organizare, utilizarea echipamentelor proprii și stabilirea programului, fiind eliminat orice element de subordonare (Art. 7 Cod Fiscal).</li>` },
      { cond: body.clauzaSuspendareFeedback, html: `<li><strong>ART. 4.11. SUSPENDARE PENTRU LIPSĂ FEEDBACK:</strong> Orice întârziere a Beneficiarului în furnizarea materialelor ce depășește 5 zile lucrătoare atrage decalarea automată a predării. Depășirea a 15 zile dă dreptul facturării integrale a stadiului curent.</li>` },
      { cond: body.clauzaLogisticaHoreca, html: `<li><strong>ART. 4.12. ASIGURARE LOGISTICĂ EVENIMENT:</strong> Beneficiarul se obligă să asigure Prestatorului acces la curent electric stabil (220V), mese calde pe durata evenimentelor ce depășesc 4 ore, și loc de parcare garantat pentru echipamente.</li>` },
      { cond: body.clauzaOriginalitate, html: `<li><strong>ART. 4.13. GARANȚIA ORIGINALITĂȚII:</strong> Autorul garantează absolut și sub sancțiunea legii penale că opera este 100% creație originală, nu încalcă drepturile terților (fără plagiat) și nu a mai fost cedată anterior.</li>` },
      { cond: body.clauzaDauneTerti, html: `<li><strong>ART. 4.14. RĂSPUNDEREA PENTRU DAUNE PROVOCATE TERȚILOR:</strong> Locatarul este 100% solidar responsabil pentru orice distrugeri (inundații, incendii din culpă, vandalism) provocate vecinilor sau spațiilor comune, degrevând total Locatorul de orice acțiune în regres.</li>` },
      { cond: body.clauzaRiscPieire, html: `<li><strong>ART. 4.15. RISCUL PIEIRII BUNULUI:</strong> Până la semnarea formei autentice, riscul pieirii fortuite a imobilului rămâne în sarcina Promitentului-Vânzător. Orice degradare a stării fizice dă dreptul Cumpărătorului să ceară reducerea prețului sau rezilierea de drept.</li>` },
      { cond: body.clauzaConstrucVicii, html: `<li><strong>ART. 4.16. GARANȚIE DE BUNĂ EXECUȚIE:</strong> Executantul garantează calitatea lucrărilor pe o perioadă de 36 de luni de la Procesul-Verbal de recepție finală, obligându-se la remedieri gratuite pentru viciile ascunse conform Legii 10/1995.</li>` },
      { cond: body.clauzaConstrucAsigurare, html: `<li><strong>ART. 4.17. POLIZĂ DE ASIGURARE ȘANTIER (C.A.R.):</strong> Constructorul trebuie să dețină asigurare validă tip Contractors All Risks pe durata execuției, preluând 100% din răspunderea civilă pentru daunele cauzate terților pe șantier.</li>` },
      { cond: body.clauzaConstrucGrafic, html: `<li><strong>ART. 4.18. PENALITĂȚI GRAFIC DE EXECUȚIE:</strong> Întârzierea nejustificată a predării frontului de lucru sau a lucrărilor la termenele agreate atrage penalități de 0.15% per zi de întârziere din valoarea stadiului fizic nerealizat.</li>` },
      { cond: body.clauzaItSla, html: `<li><strong>ART. 4.19. SERVICE LEVEL AGREEMENT (SLA):</strong> Se garantează un uptime de 99.9% și un timp de răspuns la incidente critice de maximum 24h. Nerespectarea atrage credite de penalizare deduse direct din viitoarele facturi de abonament.</li>` },
      { cond: body.clauzaItEscrow, html: `<li><strong>ART. 4.20. DEPOZITARE COD SURSĂ (ESCROW):</strong> Codul sursă va fi depozitat la o entitate terță de tip escrow, activându-se dreptul de eliberare și utilizare în beneficiul clientului exclusiv în caz de insolvență a furnizorului.</li>` }
    ];

    let nrClauzeBifate = 0;
    rules.forEach(r => {
      if (r.cond) {
        clauzeInjectateHtml += r.html;
        nrClauzeBifate++;
      }
    });

    // --- MAGIA PENTRU CLAUZA CUSTOM ---
    if (clauzaCustom && clauzaCustom.trim() !== '') {
      const numarUrmator = nrClauzeBifate + 1;
      clauzeInjectateHtml += `<li><strong>ART. 4.${numarUrmator}. CLAUZĂ SPECIALĂ ADIȚIONALĂ:</strong> ${clauzaCustom.trim()}</li>`;
    }

    const fieldHtml = (valoare, minWidth = "120px") => {
      if (valoare && valoare.toString().trim() !== '') {
        return `<span class="valoare-importata">${valoare.toString().trim()}</span>`;
      }
      return `<span class="linia-dinamica" style="min-width: ${minWidth};">&nbsp;</span>`;
    };

    const dataCurenta = new Date().toLocaleDateString('ro-RO');

    // CONSTRUCȚIA HTML 
    let htmlContract = `
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
          .brand-header { 
            font-family: Arial, sans-serif; 
            color: #64748b; 
            font-size: 11px; 
            text-transform: uppercase; 
            border-bottom: 1px solid #cbd5e1; 
            padding-bottom: 5px; 
            margin-bottom: 35px; 
            letter-spacing: 0.5px; 
          }
          .contract-title { 
            text-align: center; 
            font-size: 16px; 
            font-weight: bold; 
            margin-bottom: 5px; 
            text-transform: uppercase; 
          }
          .contract-subtitle { 
            text-align: center; 
            font-size: 12px; 
            font-weight: normal; 
            margin-bottom: 35px; 
            font-style: italic; 
          }
          .capitol-title { 
            font-weight: bold; 
            margin-top: 25px; 
            margin-bottom: 10px; 
            text-transform: uppercase; 
            text-align: justify; 
            font-size: 14px; 
          }
          .text-paragraph { 
            text-align: justify; 
            margin-bottom: 12px; 
            text-indent: 30px; 
          }
          .clauze-list { 
            list-style-type: none; 
            padding: 0; 
            margin: 0; 
          }
          .clauze-list li { 
            text-align: justify; 
            margin-bottom: 12px; 
            padding-left: 0; 
          }
          .signature-layout { 
            margin-top: 50px; 
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
          .signature-image { 
            max-height: 80px; 
            margin-bottom: 5px; 
            display: block; 
            margin-left: auto; 
            margin-right: auto; 
          }
          .signature-placeholder { 
            height: 60px; 
            font-size: 11px; 
            color: #94a3b8; 
            font-weight: normal; 
            font-style: italic; 
            padding-top: 20px; 
          }
          .qr-pay-box {
            margin: 25px auto; 
            padding: 15px; 
            border: 2px dashed #cbd5e1; 
            background-color: #f8fafc; 
            text-align: center; 
            max-width: 320px; 
            page-break-inside: avoid;
            border-radius: 8px;
          }
          .legal-footer { 
            margin-top: 70px; 
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
            vertical-align: bottom; 
            height: 18px; 
          }
          .valoare-importata { 
            font-weight: bold; 
            border-bottom: 1px transparent solid; 
            display: inline; 
            padding: 0 2px; 
          }
        </style>
      </head>
      <body>
        <div class="brand-header">Sistem de Certificare și Audit Criptografic // ContractSmart 2026</div>
        
        <div class="contract-title">${titluContractOficial}</div>
        <div class="contract-subtitle">Nr. Identificare Digitală: CS-${Math.floor(10000 + Math.random() * 90000)} / Data Generării: ${dataCurenta}</div>
        
        <div class="capitol-title">CAPITOLUL I. PĂRȚILE CONTRACTANTE</div>
        <div class="text-paragraph">
          <strong>SOCIETATEA COMERCIALĂ / ENTITATEA JURIDICĂ:</strong> ${fieldHtml(prestatorNume, "220px")}, având date de identificare fiscală CUI/CNP: ${fieldHtml(prestatorCui, "120px")}, legal reprezentată prin Administrator / Reprezentant: <strong>${fieldHtml(prestatorReprezentant, "150px")}</strong>, denumită <strong>PRESTATOR / LOCATOR / VÂNZĂTOR</strong>, pe de o parte,
        </div>
        <div class="text-paragraph" style="text-align: center; text-indent: 0;">și</div>
        <div class="text-paragraph">
          <strong>SOCIETATEA COMERCIALĂ / ENTITATEA JURIDICĂ:</strong> ${fieldHtml(clientNume, "220px")}, având date de identificare fiscală CUI/CNP: ${fieldHtml(clientCui, "120px")}, legal reprezentată prin Administrator / Reprezentant: <strong>${fieldHtml(clientReprezentant, "150px")}</strong>, denumită <strong>BENEFICIAR / LOCATAR / CUMPĂRĂTOR</strong>, pe altă parte.
        </div>

        <div class="capitol-title">CAPITOLUL II. OBIECTUL CONTRACTULUI ȘI TEMEIUL LEGAL</div>
        <div class="text-paragraph">
          <strong>ART. 2.1. TEMEIUL JURIDIC:</strong> ${temeiJuridicHtml}
        </div>
        <div class="text-paragraph">
          <strong>ART. 2.2. SPECIFICAȚII TEHNICE:</strong> Obiectul contractului este stabilit în mod expres prin convenția părților și constă în: ${fieldHtml(obiect, "350px")}.
        </div>

        <div class="capitol-title">CAPITOLUL III. OBLIGAȚII FINANCIARE ȘI SCADENȚĂ</div>
        <div class="text-paragraph">
          <strong>ART. 3.1. ONORARIU NOMINAL:</strong> Prețul stabilit de către Părți este în cuantum total de: <strong>${fieldHtml(valoare, "80px")} ${fieldHtml(moneda, "50px")}</strong>.
        </div>
        <div class="text-paragraph">
          <strong>ART. 3.2. DECONTARE:</strong> Stingerea obligațiilor de plată se va efectua prin virament bancar, termenele stipulate în facturi fiind esențiale și de decădere.
        </div>

        ${tipContract === 'constructii' ? `
        <div class="text-paragraph">
          <strong>ART. 3.3. DEVIZ FINANCIAR DEFALCAT:</strong> Valoarea menționată la Art. 3.1 este fundamentată conform devizului atașat lucrării:
          <br/><br/>
          <table style="width:90%; margin: 0 auto; border-collapse: collapse; font-size: 13px; text-align: left;" border="1">
            <tr>
              <th style="padding: 6px; background-color: #f0f0f0;">Categorie Deviz</th>
              <th style="padding: 6px; background-color: #f0f0f0;">Valoare (RON)</th>
            </tr>
            <tr>
              <td style="padding: 6px;">Materiale de Construcție de Bază</td>
              <td style="padding: 6px; font-weight: bold;">${constructiiMateriale || '0'}</td>
            </tr>
            <tr>
              <td style="padding: 6px;">Manoperă Specializată & Echipă Tehnică</td>
              <td style="padding: 6px; font-weight: bold;">${constructiiManopera || '0'}</td>
            </tr>
            <tr>
              <td style="padding: 6px;">Suprafață Acoperită (${constructiiSuprafata || '0'} mp * ${constructiiPretMp || '0'} lei/mp)</td>
              <td style="padding: 6px; font-weight: bold;">${(parseFloat(constructiiSuprafata || 0) * parseFloat(constructiiPretMp || 0)).toFixed(2)}</td>
            </tr>
          </table>
        </div>
        ` : ''}

        ${adaugaQrPlata && ibanPlata ? `
        <div class="qr-pay-box">
          <strong style="display: block; margin-bottom: 8px; font-size: 12px; text-transform: uppercase;">Atașament Încasare Rapidă (QR Pay)</strong>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(ibanPlata)}&format=png" width="120" height="120" style="margin-bottom: 8px; border-radius: 4px;" />
          <div style="font-size: 11px; font-family: monospace; word-break: break-all; color: #333;">Scanează pentru plată:<br><strong>${ibanPlata}</strong></div>
        </div>
        ` : ''}

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
          <strong>ART. 6.1. JURISDICȚIE:</strong> În lipsa soluționării amiabile în 15 zile, litigiile vor fi deduse exclusiv instanțelor de la sediul Prestatorului sau Locatorului.
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

    // ADAUGĂ PROCES VERBAL DACĂ E BIFAT
    if (adaugaProcesVerbal === true || adaugaProcesVerbal === "true") {
      htmlContract += `
        <div style="page-break-before: always; clear: both; padding-top: 40px;"></div>
        <div class="brand-header">Sistem de Certificare și Audit Criptografic // ContractSmart 2026</div>
        <div class="contract-title">ANEXA 1: PROCES-VERBAL DE PREDARE-PRIMIRE</div>
        <div class="contract-subtitle">Anexă la Contractul nr. CS-${Math.floor(10000 + Math.random() * 90000)} / ${dataCurenta}</div>
        
        <div class="text-paragraph">
          Încheiat astăzi, ${dataCurenta}, între:
        </div>
        <div class="text-paragraph">
          1. <strong>${fieldHtml(prestatorNume, "220px")}</strong> (în calitate de Prestator / Vânzător)
        </div>
        <div class="text-paragraph">
          2. <strong>${fieldHtml(clientNume, "220px")}</strong> (în calitate de Beneficiar / Cumpărător)
        </div>
        
        <div class="text-paragraph">
          Obiectul predării a constat în recepționarea fizică și calitativă a următoarelor bunuri/lucrări/servicii: ${fieldHtml(obiect, "350px")}.
        </div>
        <div class="text-paragraph">
          Prin semnarea prezentului proces-verbal, Beneficiarul declară în mod expres, ferm și neechivoc că a primit și recepționat bunurile/serviciile mai sus menționate. Beneficiarul confirmă că acestea sunt în stare perfectă de funcționare, cantitativ și calitativ conform standardelor agreate, și că <strong>nu are absolut nicio obiecțiune vizibilă sau ascunsă</strong> cu privire la acestea.
        </div>
        <div class="text-paragraph">
          Odată cu semnarea acestui document, se naște obligația de plată (dacă nu a fost deja achitată) și orice răspundere de paza juridică trece în sarcina Beneficiarului.
        </div>

        <div class="signature-layout">
          <div class="signature-column">
            PENTRU PRESTATOR / VÂNZĂTOR (PREDARE)<br><br>
            ${initiatorRol === 'prestator' && semnăturaBase64 ? `
              <img src="${semnăturaBase64}" class="signature-image" alt="Semnatura Prestator" />
              <span style="font-size: 10px; font-weight: normal; color: #16a34a; display:block;">Semnat digital creator</span>
            ` : `<div class="signature-placeholder">[Validat Electronic]</div>`}
          </div>
          <div class="signature-column">
            PENTRU BENEFICIAR / CUMPĂRĂTOR (PRIMIRE)<br><br>
            ${initiatorRol === 'client' && semnăturaBase64 ? `
              <img src="${semnăturaBase64}" class="signature-image" alt="Semnatura Beneficiar" />
              <span style="font-size: 10px; font-weight: normal; color: #16a34a; display:block;">Semnat digital creator</span>
            ` : `<div class="signature-placeholder" style="color: #ef4444;">Așteaptă semnare partener</div>`}
          </div>
        </div>
      `;
    }

    htmlContract += `
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--single-process']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContract, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '40px', bottom: '40px', left: '40px', right: '40px' } });
    await browser.close();

    // -------------------------------------------------------------------------
    // TRIMITE EMAIL VIA RESEND CU LOG-URI CLARE
    // -------------------------------------------------------------------------
    if (process.env.RESEND_API_KEY && clientEmail) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        const emailResponse = await resend.emails.send({
          from: 'ContractSmart <contact@contractsmart.ro>',
          to: clientEmail,
          subject: `Document Securizat - ${titluContractOficial}`,
          text: `Salutare!\n\nRegăsiți atașat contractul comercial generat securizat prin intermediul platformei ContractSmart.\n\nO zi excelentă!`,
          attachments: [
            {
              filename: `contract_${tipContract}_securizat.pdf`,
              content: Buffer.from(pdfBuffer),
            },
          ],
        });
        console.log("E-mail procesat de Resend:", emailResponse);
      } catch (emailErr) {
        console.error("❌ EROARE RESEND DETALIATĂ:", emailErr);
      }
    }

    // SCĂDERE CREDITE DOAR DACA E FREE
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