import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';
import JSZip from 'jszip';
import crypto from 'crypto'; // <--- NOU: Adăugat pentru a genera semnătura SHA-256

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function randeazaHtmlInPdf(htmlContent) {
  const launchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  };

  if (process.env.NODE_ENV === 'development') {
    launchOptions.executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  }

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();
  
  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  
  return pdfBuffer;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const rawData = formData.get('autoDataJson');
    const data = rawData ? JSON.parse(rawData) : {};

    // -------------------------------------------------------------------------
    // VALIDARE ANTI-SPAM CLOUDFLARE TURNSTILE
    // -------------------------------------------------------------------------
    if (process.env.TURNSTILE_SECRET_KEY && data.captchaToken) {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${data.captchaToken}`
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return NextResponse.json({ success: false, message: 'Validare anti-spam (Cloudflare) eșuată. Reîncărcați pagina.' }, { status: 403 });
      }
    }

    const fisierTalon = formData.get('talon');
    const fisierCiv = formData.get('civ');
    const fisierBv = formData.get('buletin_vanzator');
    const fisierBc = formData.get('buletin_cumparator');

    if (!data.userId) {
      return NextResponse.json({ success: false, message: 'Neautentificat' }, { status: 401 });
    }
    
    const { data: profile } = await supabase.from('profiles').select('subscription_tier, is_pro').eq('id', data.userId).single();
    const tier = (profile?.subscription_tier || '').toLowerCase().trim();
    const isPremium = tier.includes('founder') || tier.includes('pro') || profile?.is_pro;

    if (!isPremium) {
      const { data: achizitie } = await supabase.from('user_purchases')
        .select('id')
        .eq('user_id', data.userId)
        .eq('product_id', 'contract_auto')
        .single();
        
      if (!achizitie) {
        return NextResponse.json({ success: false, needsPayment: true, message: 'Acces interzis. Necesită achiziție.' }, { status: 403 });
      }
    }

    // Salvare istoric vechi (opțional)
    try {
      const insertPayload = {
        tip_contract: 'auto',
        auto_vin: data.autoVin || '',
        auto_marca_model: data.autoMarcaModel || '',
        auto_pret: parseFloat(data.autoPret) || 0,
        client_email: data.clientEmail || '',
        auto_nume_vanzator: data.vanzatorNume || '',
        auto_cnp_vanzator: data.vanzatorTip === 'PJ' ? (data.vanzatorCui || data.vanzatorCnp || '') : (data.vanzatorCnp || data.vanzatorCui || ''),
        auto_adresa_vanzator: data.vanzatorTip === 'PJ' ? (data.vanzatorSediu || data.autoAdresaVanzator || '') : (data.autoAdresaVanzator || data.vanzatorSediu || ''),
        auto_nume_cumparator: data.cumparatorNume || '',
        auto_cnp_cumparator: data.cumparatorTip === 'PJ' ? (data.cumparatorCui || data.cumparatorCnp || '') : (data.cumparatorCnp || data.cumparatorCui || ''),
        auto_adresa_cumparator: data.cumparatorTip === 'PJ' ? (data.cumparatorSediu || data.autoAdresaCumparator || '') : (data.autoAdresaCumparator || data.cumparatorSediu || ''),
        status: 'finalizat'
      };

      if (data.pretIncludeTVA !== undefined) {
        insertPayload['pret_include_tva'] = !!data.pretIncludeTVA;
      }

      await supabase.from('contracts').insert([insertPayload]);
    } catch (dbErr) {
      console.warn("S-a evitat blocarea din Supabase Cache:", dbErr.message);
    }

    const dataCurenta = new Date().toLocaleDateString('ro-RO');
    const oraCurenta = new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

    const field = (valoare, minWidth = "120px") => {
      if (valoare && valoare.toString().trim() !== '') {
        return `<span class="valoare-importata">${valoare.toString().trim()}</span>`;
      }
      return `<span class="linia-dinamica" style="min-width: ${minWidth};">&nbsp;</span>`;
    };

    const textTvaContract = data.pretIncludeTVA 
      ? " (prețul include TVA conform legislației în vigoare pentru persoane juridice)" 
      : " (net, operațiune neimpozabilă în sfera TVA / persoană fizică)";

    let dateVanzatorHtml = data.vanzatorTip === 'PJ' 
      ? `Societatea ${field(data.vanzatorNume, "200px")}, CUI ${field(data.vanzatorCui, "100px")}, Reg. Com. ${field(data.vanzatorRegCom, "100px")}, cu sediul social în ${field(data.vanzatorSediu, "220px")}, reprezentată legal conform actelor constitutive`
      : `Subsemnatul/a ${field(data.vanzatorNume, "200px")}, CNP ${field(data.vanzatorCnp, "110px")}, cu domiciliul în localitatea ${field(data.autoAdresaVanzator, "220px")}`;

    let dateCumparatorHtml = data.cumparatorTip === 'PJ'
      ? `Societatea ${field(data.cumparatorNume, "200px")}, CUI ${field(data.cumparatorCui, "100px")}, Reg. Com. ${field(data.cumparatorRegCom, "100px")}, cu sediul social în ${field(data.cumparatorSediu, "220px")}, reprezentată legal conform actelor constitutive`
      : `Subsemnatul/a ${field(data.cumparatorNume, "200px")}, CNP ${field(data.cumparatorCnp, "110px")}, cu domiciliul în localitatea ${field(data.autoAdresaCumparator, "220px")}`;

    const sigVanzatorHtml = data.semnaturaVanzatorBase64 && data.semnaturaVanzatorBase64.length > 100 
  ? `<img src="${data.semnaturaVanzatorBase64}" style="max-height: 45px; display: block; margin: 5px auto 0 auto;"/><div style="font-size: 9px; color: #16a34a; margin-top: 2px;">✓ Validat Electronic</div>`
  : `<br/><span style="font-size: 9px; font-weight: normal; color: #d97706;">[Așteaptă Validarea]</span>`;

    const sigCumparatorHtml = data.semnaturaCumparatorBase64 && data.semnaturaCumparatorBase64.length > 100 
      ? `<img src="${data.semnaturaCumparatorBase64}" style="max-height: 45px; display: block; margin: 5px auto 0 auto;"/><div style="font-size: 9px; color: #16a34a; margin-top: 2px;">✓ Validat Electronic</div>`
      : `<br/><span style="font-size: 9px; font-weight: normal; color: #ef4444;">[Așteaptă Semnarea]</span>`;

    const zip = new JSZip();

    const tipuriExemplare = [
      { nr: 1, destinatie: "EXEMPLAR NR. 1 - PENTRU ORGANUL FISCAL COMPETENT AL PERSOANEI CARE ÎNSTRĂINEAZĂ (REMTII VÂNZĂTOR)" },
      { nr: 2, destinatie: "EXEMPLAR NR. 2 - PENTRU ORGANUL FISCAL COMPETENT AL PERSOANEI CARE DOBÂNDEȘTE (IMPOZITARE CUMPĂRĂTOR)" },
      { nr: 3, destinatie: "EXEMPLAR NR. 3 - PENTRU PERSOANA JURIDICĂ SAU FIZICĂ CARE ÎNSTRĂINEAZĂ (PROPRIETATE VÂNZĂTOR)" },
      { nr: 4, destinatie: "EXEMPLAR NR. 4 - PENTRU PERSOANA JURIDICĂ SAU FIZICĂ CARE DOBÂNDEȘTE (PROPRIETATE CUMPĂRĂTOR)" },
      { nr: 5, destinatie: "EXEMPLAR NR. 5 - PENTRU SERVICIUL REGIM PERMISE ȘI ÎNMATRICULĂRI VEHICULE (DRPCIV)" }
    ];

    const stiluriSidequestComune = `
      .linia-dinamica { 
        display: inline-block; 
        border-bottom: 1px solid #000000; 
        vertical-align: bottom; 
        height: 16px; 
      }
      .valoare-importata { 
        font-weight: bold; 
        padding: 0 3px; 
        border-bottom: 1px transparent solid; 
      }
    `;

    // 1. CONTRACTUL DE VÂNZARE-CUMPĂRARE (Model ITĂ-014 cu clauze extinse)
    for (const ex of tipuriExemplare) {
      const htmlContractOficial = `
        <!DOCTYPE html>
        <html lang="ro">
        <head>
          <meta charset="utf-8">
          <style>
            @page { margin: 20mm 15mm; }
            body { 
              font-family: 'Times New Roman', Times, serif; 
              color: #000; 
              font-size: 11.5px; 
              line-height: 1.4; 
            }
            .official-box { 
              border: 2px solid #000; 
              padding: 8px; 
              margin-bottom: 15px; 
              text-align: center; 
              font-weight: bold; 
              font-family: Arial, sans-serif; 
              font-size: 10px; 
              background-color: #f9f9f9; 
            }
            .title { 
              text-align: center; 
              font-size: 15px; 
              font-weight: bold; 
              margin-bottom: 15px; 
              text-transform: uppercase; 
            }
            .section-title { 
              font-weight: bold; 
              margin-top: 15px; 
              margin-bottom: 5px; 
              text-transform: uppercase; 
              border-bottom: 1px solid #000; 
              font-size: 12px; 
              background-color: #f0f0f0; 
              padding: 2px 5px; 
            }
            .row-data { 
              margin-bottom: 8px; 
              text-align: justify; 
            }
            .legal-clause { 
              font-size: 10px; 
              text-align: justify; 
              margin-bottom: 6px; 
              color: #111; 
            }
            .legal-clause strong { 
              color: #000; 
            }
            .signature-area { 
              margin-top: 35px; 
              display: flex; 
              justify-content: space-between; 
              page-break-inside: avoid; 
            }
            .sig-box { 
              width: 40%; 
              border-top: 1px solid #000; 
              text-align: center; 
              padding-top: 5px; 
              font-weight: bold; 
              font-size: 11px; 
            }
            ${stiluriSidequestComune}
          </style>
        </head>
        <body>
          <div class="official-box">MODEL ITĂ - 014 // ${ex.destinatie} <br/> Formular aprobat conform legislației fiscale și a Codului Civil în vigoare</div>
          <div class="title">CONTRACT DE ÎNSTRĂINARE - DOBÂNDIRE A UNUI MIJLOC DE TRANSPORT</div>
          
          <div class="section-title">CAP. I - PĂRȚILE CONTRACTANTE</div>
          <div class="row-data"><strong>1. VÂNZĂTOR (Persoana care înstrăinează):</strong> ${dateVanzatorHtml}, în calitate de proprietar legal și exclusiv al bunului.</div>
          <div class="row-data"><strong>2. CUMPĂRĂTOR (Persoana care dobândește):</strong> ${dateCumparatorHtml}, în calitate de dobânditor, care preia toate obligațiile fiscale născute din posesia bunului.</div>

          <div class="section-title">CAP. II - OBIECTUL CONTRACTULUI ȘI DATELE DE IDENTIFICARE</div>
          <div class="row-data">
            Vânzătorul transmite dreptul de proprietate, iar Cumpărătorul preia bunul mobil (mijlocul de transport) având următoarele date tehnice: 
            Marca și modelul: <strong>${field(data.autoMarcaModel, "150px")}</strong>, 
            Număr de înmatriculare curent: <strong>${field(data.autoNumarInmatriculare, "100px")}</strong>, 
            Serie Șasiu (VIN): <strong style="font-family: monospace; font-size: 13px;">${field(data.autoVin, "180px")}</strong>.
          </div>

          <div class="section-title">CAP. III - PREȚUL ȘI MODALITATEA DE PLATĂ</div>
          <div class="row-data">
            Prețul vânzării, stabilit de comun acord, ferm și neajustabil, este de: <strong style="font-size: 13px;">${field(data.autoPret, "100px")} ${data.autoMoneda || 'RON'}</strong>${textTvaContract}. 
            Plata se consideră efectuată integral, prin consimțământul părților, la data semnării prezentului înscris.
          </div>

          <div class="section-title">CAP. IV - CLAUZE SPECIALE, RĂSPUNDERE ȘI GARANȚII JURIDICE</div>
          <div class="legal-clause"><strong>Art. 4.1 Garanția contra evicțiunii:</strong> Vânzătorul garantează pe Cumpărător, conform Art. 1695 Cod Civil, împotriva oricărei evicțiuni totale sau parțiale. Vânzătorul declară pe proprie răspundere, sub sancțiunea legii penale (fals în declarații), că vehiculul este proprietatea sa exclusivă, este liber de sarcini, nu este gajat, sechestrat, nu face obiectul unui litigiu sau al unei proceduri de executare silită, iar taxele/impozitele locale sunt achitate la zi.</div>
          <div class="legal-clause"><strong>Art. 4.2 Garanția pentru vicii și starea tehnică:</strong> Bunul se vinde în starea tehnică și estetică în care se află la momentul predării. Cumpărătorul declară că a inspectat vehiculul, a efectuat probele tehnice de drum și este de acord cu starea acestuia. Conform normelor imperative ale Art. 1707 Cod Civil, Vânzătorul răspunde exclusiv pentru viciile ascunse grave, existente la momentul predării, care nu puteau fi descoperite printr-o verificare rezonabilă.</div>
          <div class="legal-clause"><strong>Art. 4.3 Transferul proprietății și al riscurilor:</strong> Dreptul de proprietate se transferă la momentul achitării prețului. Riscul pieirii fortuite și sarcina suportării0 oricăror cheltuieli, taxe, sancțiuni contravenționale (amenzi de circulație, C.N.A.I.R., parcări) și asigurări trec în mod irevocabil asupra Cumpărătorului din momentul semnării Procesului-Verbal de Predare-Primire.</div>
          <div class="legal-clause"><strong>Art. 4.4 Prelucrarea datelor (GDPR):</strong> Părțile consimt reciproc la prelucrarea datelor cu caracter personal înscrise în prezentul contract strict în scopul executării tranzacției și îndeplinirii obligațiilor legale privind fiscalizarea și înmatricularea/radierea, conform Regulamentului (UE) 2016/679.</div>

          <div class="section-title">CAP. V - DISPOZIȚII FINALE</div>
          <div class="legal-clause">Prezentul contract a fost încheiat astăzi, <strong>${dataCurenta}</strong>, în 5 (cinci) exemplare originale, având aceeași forță juridică probantă, câte unul pentru fiecare parte, și 3 exemplare pentru autoritățile competente. Eventualele litigii decurgând din executarea prezentului contract se vor soluționa pe cale amiabilă, iar în caz de eșec, de către instanțele judecătorești competente material și teritorial.</div>

          <div class="signature-area">
        <div class="sig-box">VÂNZĂTOR <br/> ${sigVanzatorHtml}</div>
          <div class="sig-box">CUMPĂRĂTOR <br/> ${sigCumparatorHtml}</div>
        </div>
        </body>
        </html>
      `;
      const pdfBuffer = await randeazaHtmlInPdf(htmlContractOficial);
      zip.file(`01_Contract_Auto_Model_ITA014_Exemplar_${ex.nr}.pdf`, pdfBuffer);
    }

    // 2. PROCESUL-VERBAL DE PREDARE-PRIMIRE (Transferul de răspundere)
    const htmlProcesVerbal = `
      <!DOCTYPE html>
      <html lang="ro">
      <head>
        <meta charset="utf-8">
        <style>
          @page { margin: 25mm 20mm; }
          body { 
            font-family: 'Times New Roman', Times, serif; 
            color: #000; 
            font-size: 13px; 
            line-height: 1.6; 
          }
          .header-pv { 
            text-align: center; 
            font-weight: bold; 
            border-bottom: 2px solid #000; 
            padding-bottom: 10px; 
            margin-bottom: 30px; 
            text-transform: uppercase; 
            font-size: 12px; 
          }
          .title-pv { 
            text-align: center; 
            font-size: 16px; 
            font-weight: bold; 
            margin-bottom: 25px; 
            text-decoration: underline; 
          }
          .paragraph { 
            text-align: justify; 
            margin-bottom: 15px; 
            text-indent: 20px;
          }
          .highlight-box { 
            border: 2px solid #b91c1c; 
            background-color: #fef2f2; 
            padding: 15px; 
            margin: 20px 0; 
            font-size: 12px; 
            text-align: justify; 
          }
          .sig-layout { 
            margin-top: 70px; 
            display: flex; 
            justify-content: space-between; 
            page-break-inside: avoid; 
          }
          .sig-box { 
            width: 40%; 
            border-top: 1px solid #000; 
            text-align: center; 
            padding-top: 5px; 
            font-weight: bold; 
          }
          ${stiluriSidequestComune}
        </style>
      </head>
      <body>
        <div class="header-pv">Anexă Obligatorie la Contractul de Înstrăinare-Dobândire • Conform Normelor Drpciv</div>
        <div class="title-pv">PROCES-VERBAL DE PREDARE-PRIMIRE VEHICUL</div>
        
        <div class="paragraph">Încheiat astăzi, <strong>${dataCurenta}</strong>, la ora exactă <strong>${oraCurenta}</strong>, ca act accesoriu la Contractul de Înstrăinare-Dobândire privind vehiculul marca/model <strong>${field(data.autoMarcaModel, "140px")}</strong>, având numărul de identificare (VIN) <strong style="font-family: monospace; font-size: 14px;">${field(data.autoVin, "180px")}</strong>.</div>
        
        <div class="paragraph"><strong>1. OBIECTUL PREDĂRII:</strong> Vânzătorul predă, iar Cumpărătorul preia în posesie faptică vehiculul identificat mai sus. Odată cu autovehiculul, au fost predate următoarele bunuri și documente în original:</div>
        <ul style="margin-top: -5px; list-style-type: disc;">
          <li>Cartea de Identitate a Vehiculului (CIV);</li>
          <li>Certificatul de Înmatriculare (Talonul), completat olograf pe verso la rubrica înstrăinării;</li>
          <li>Chei de contact (Număr: <strong>${field(data.autoCheiNumar || '2', "30px")}</strong> bucăți);</li>
          <li>Polita de asigurare RCA valabilă (dacă a fost convenit transferul temporar al acesteia).</li>
        </ul>

        <div class="paragraph"><strong>2. STAREA TEHNICĂ ȘI ODOMETRUL:</strong> Cumpărătorul confirmă că a preluat vehiculul în starea tehnică asumată prin contract. Rulajul indicat de odometru (kilometraj) la momentul predării fizice este de: <strong>${field(data.autoKilometri || '.......', "80px")} km</strong>.</div>
        
        <div class="highlight-box">
          <strong>3. CLAUZĂ DE EXONERARE ABSOLUTĂ ȘI TRANSFERUL RĂSPUNDERII:</strong>
          <br/><br/>
          Părțile convin în mod expres și irevocabil că, începând cu data de <strong>${dataCurenta}</strong>, ora <strong>${oraCurenta}</strong>, Cumpărătorul preia integral și exclusiv paza juridică a bunului, precum și absolut orice răspundere civilă, contravențională sau penală legată de utilizarea, staționarea sau deplasarea acestuia pe drumurile publice.
          <br/><br/>
          Orice sancțiune (amendă C.N.A.I.R. pentru lipsă rovinietă, depășirea vitezei legale înregistrată de radare, parcări neregulamentare, taxe de pod/drum) sau daune provocate terților din accidente rutiere, survenite după data și ora menționate anterior, <strong>cad exclusiv în sarcina Cumpărătorului</strong>. Prezentul proces-verbal constituie probă absolută și titlu de exonerare de răspundere a Vânzătorului în fața organelor de Poliție, autorităților fiscale și a instanțelor de judecată.
        </div>

        <div class="sig-layout">
          <div class="sig-box">VÂNZĂTOR <br/><span style="font-weight: normal; font-size:10px;">(Am predat vehiculul și actele)</span><br/>${sigVanzatorHtml}</div>
          <div class="sig-box">CUMPĂRĂTOR <br/><span style="font-weight: normal; font-size:10px;">(Am primit vehiculul și actele)</span><br/>${sigCumparatorHtml}</div>
        </div>
      </body>
      </html>
    `;
    const pdfPvBuffer = await randeazaHtmlInPdf(htmlProcesVerbal);
    zip.file(`06_Proces_Verbal_Predare_Primire_Exonerare_Raspundere.pdf`, pdfPvBuffer);

    // 3. CERERILE OFICIALE DRPCIV / DITL
    const htmlCereriOficiale = `
      <!DOCTYPE html>
      <html lang="ro">
      <head>
        <meta charset="utf-8">
        <style>
          @page { margin: 20mm; }
          body { 
            font-family: Arial, sans-serif; 
            color: #000; 
            font-size: 12px; 
            line-height: 1.6; 
          }
          .form-title { 
            text-align: center; 
            font-size: 14px; 
            font-weight: bold; 
            text-transform: uppercase; 
            margin-bottom: 30px; 
          }
          .form-subtitle { 
            text-align: center; 
            font-size: 12px; 
            font-weight: bold; 
            margin-bottom: 20px; 
          }
          .field-row { 
            margin-bottom: 15px; 
            border-bottom: 1px dotted #888; 
            padding-bottom: 3px; 
          }
          .page-break { 
            page-break-before: always; 
          }
          ${stiluriSidequestComune}
        </style>
      </head>
      <body>
        <div class="form-title">CERERE PENTRU RADIEREA DIN EVIDENȚĂ A UNUI VEHICUL</div>
        <div class="form-subtitle">Către Serviciul Public Comunitar Regim Permise și Înmatriculări Vehicule / DITL</div>
        
        <div class="field-row">Subsemnatul/Societatea (Vânzător): <strong>${field(data.vanzatorNume, "300px")}</strong></div>
        <div class="field-row">C.I. (Serie/Nr) / CNP / CUI: <strong>${field(data.vanzatorTip === 'PJ' ? data.vanzatorCui : data.vanzatorCnp, "200px")}</strong></div>
        <div class="field-row">Domiciliat / Sediul în: <strong>${field(data.vanzatorTip === 'PJ' ? data.vanzatorSediu : data.autoAdresaVanzator, "300px")}</strong></div>
        <div class="field-row">Solicit radierea din evidența circulației a vehiculului marca: <strong>${field(data.autoMarcaModel, "200px")}</strong></div>
        <div class="field-row">Serie șasiu (VIN): <strong style="font-family: monospace;">${field(data.autoVin, "200px")}</strong>, având numărul de înmatriculare: <strong>${field(data.autoNumarInmatriculare, "150px")}</strong>.</div>
        <div class="field-row">Motivul radierii: Înstrăinare conform contractului de vânzare-cumpărare anexat, încheiat la data de ${dataCurenta}.</div>
        
        <div style="margin-top: 40px; text-align: right; font-weight: bold; padding-right: 50px;">
          Data: ${dataCurenta}<br/><br/>
          Semnătură Vânzător / Ștampilă<br/>
          <div style="display: inline-block; text-align: center; min-width: 150px;">${sigVanzatorHtml}</div>
        </div>

        <div class="page-break"></div>

        <div class="form-title">CERERE PENTRU ÎNMATRICULAREA / TRANSCRIEREA UNUI VEHICUL</div>
        <div class="form-subtitle">Către Serviciul Public Comunitar Regim Permise și Înmatriculări Vehicule / DITL</div>
        
        <div class="field-row">Subsemnatul/Societatea (Cumpărător): <strong>${field(data.cumparatorNume, "300px")}</strong></div>
        <div class="field-row">C.I. (Serie/Nr) / CNP / CUI: <strong>${field(data.cumparatorTip === 'PJ' ? data.cumparatorCui : data.cumparatorCnp, "200px")}</strong></div>
        <div class="field-row">Domiciliat / Sediul în: <strong>${field(data.cumparatorTip === 'PJ' ? data.cumparatorSediu : data.autoAdresaCumparator, "300px")}</strong></div>
        <div class="field-row">Solicit înmatricularea / transcrierea în evidențele oficiale a vehiculului marca: <strong>${field(data.autoMarcaModel, "200px")}</strong></div>
        <div class="field-row">Serie șasiu (VIN): <strong style="font-family: monospace;">${field(data.autoVin, "200px")}</strong>, dobândit prin contract la prețul de: <strong>${field(data.autoPret, "100px")} ${data.autoMoneda || 'RON'}</strong>.</div>
        <div class="field-row">Referitor la plăcuțele cu numărul de înmatriculare solicit: </div>
        <div style="margin-left: 20px; line-height: 1.8;">
          [ &nbsp; ] Atribuirea unui număr de înmatriculare la rând<br/>
          [ &nbsp; ] Atribuirea unui număr de înmatriculare preferențial: ............................................<br/>
          [ &nbsp; ] Păstrarea vechiului număr de înmatriculare (dacă este cazul)
        </div>
        
        <div style="margin-top: 40px; text-align: right; font-weight: bold; padding-right: 50px;">
          Data: ${dataCurenta}<br/><br/>
          Semnătură Cumpărător / Ștampilă<br/>
          <div style="display: inline-block; text-align: center; min-width: 150px;">${sigCumparatorHtml}</div>
        </div>
      </body>
      </html>
    `;
    const pdfCereriBuffer = await randeazaHtmlInPdf(htmlCereriOficiale);
    zip.file(`07_Cereri_Oficiale_Inmatriculare_si_Radiere_DRPCIV.pdf`, pdfCereriBuffer);

    // ATAȘARE ACTE SCANATE
    if (fisierTalon && fisierTalon.size > 0) {
      zip.file(`Acte_Originale_Client/Copie_Certificat_Inmatriculare_Talon.jpg`, Buffer.from(await fisierTalon.arrayBuffer()));
    }
    if (fisierCiv && fisierCiv.size > 0) {
      zip.file(`Acte_Originale_Client/Copie_Carte_Identitate_Vehicul_CIV.jpg`, Buffer.from(await fisierCiv.arrayBuffer()));
    }
    if (fisierBv && fisierBv.size > 0) {
      zip.file(`Acte_Originale_Client/Copie_Act_Identitate_Vanzator.jpg`, Buffer.from(await fisierBv.arrayBuffer()));
    }
    if (fisierBc && fisierBc.size > 0) {
      zip.file(`Acte_Originale_Client/Copie_Act_Identitate_Cumparator.jpg`, Buffer.from(await fisierBc.arrayBuffer()));
    }

    // GHID PROCEDURAL
    const continutGhidTxt = `CONTRACTSMART LEGAL-TECH // INSTRUCTAJ PROCEDURAL DOSAR AUTO
================================================================================
Vehicul: ${data.autoMarcaModel || 'Mijloc Transport'} | VIN: ${data.autoVin || 'Nespecificat'}
Compilat la data de: ${dataCurenta} | Dosar Securizat Criptografic
================================================================================

Stimate utilizator,

Pachetul dvs. documentar a fost generat în conformitate cu normele Codului Fiscal 
și ale Codului Civil din România. Pentru opozabilitatea juridică a tranzacției și 
finalizarea transferului de proprietate, urmați cu strictețe pasul procedural de mai jos:

--------------------------------------------------------------------------------
ETAPA 1: SCOATEREA DIN EVIDENȚĂ FISCALĂ (DITL VÂNZĂTOR)
--------------------------------------------------------------------------------
Responsabil: VÂNZĂTORUL
Unde: Direcția Impozite și Taxe Locale (DITL) de care aparține Vânzătorul.
Acte necesare: 
  - Toate cele 5 exemplare ale Contractului de Înstrăinare-Dobândire (Fișierele 01-05);
  - Cartea de Identitate a Vehiculului (CIV) în original și copie;
  - Actul de identitate al Vânzătorului;
  - Cererea tip de scoatere din evidență (Fișierul 07 - Cerere Radiere).
Rezultat: DITL va opri Exemplarul 1 și va înscrie pe restul de 4 exemplare 
          numărul de înregistrare, ștampila oficială și codul REMTII.

--------------------------------------------------------------------------------
ETAPA 2: PREDAREA FIZICĂ A VEHICULULUI ȘI A DOCUMENTELOR
--------------------------------------------------------------------------------
Responsabili: VÂNZĂTORUL ȘI CUMPĂRĂTORUL
Procedură:
  1. Vânzătorul predă Cumpărătorului:
     - 3 exemplare de contract vizate de DITL Vânzător (Exemplarele 2, 4 și 5);
     - Cartea de Identitate a Vehiculului (CIV) originală;
     - Certificatul de Înmatriculare (Talon) original, completat olograf pe verso:
       "Înstrăinat către [Nume Cumpărător] la data de ${dataCurenta}" + Semnătură;
     - Cheile vehiculului și polița RCA valabilă.
  2. Ambele părți semnează PROCESUL-VERBAL DE PREDARE-PRIMIRE (Fișierul 06).
     *ATENȚIE: Din secunda semnării PV-ului, Cumpărătorul preia integral răspunderea 
     civilă și penală pentru exploatarea vehiculului (amenzi, radar, rovinietă).

--------------------------------------------------------------------------------
ETAPA 3: LUAREA ÎN EVIDENȚĂ FISCALĂ (DITL CUMPĂRĂTOR)
--------------------------------------------------------------------------------
Responsabil: CUMPĂRĂTORUL
Termen legal: Maximum 30 de zile calendaristice de la data tranzacției.
Unde: Direcția Impozite și Taxe Locale (DITL) de care aparține Cumpărătorul.
Acte necesare:
  - Exemplarul 2 vizat deja de DITL Vânzător;
  - CIV original și copie;
  - Actul de identitate Cumpărător;
  - Declarația tip de impunere mijloace de transport.
Rezultat: DITL Cumpărător va opri Exemplarul 2 și va aplica vizarea pe 
          Exemplarele 4 și 5.

--------------------------------------------------------------------------------
ETAPA 4: ÎNMATRICULAREA FINALĂ ȘI EMITEREA TALONULUI (DRPCIV / DGPCI)
--------------------------------------------------------------------------------
Responsabil: CUMPĂRĂTORUL
Termen legal: Maximum 90 de zile de la data înstrăinării.
Unde: Serviciul Public Comunitar Regim Permise de Conducere și Înmatriculare.
Acte necesare la dosar:
  - Exemplarul 5 al contractului (vizat dublu de ambele DITL-uri);
  - Cererea tip de înmatriculare completată și semnată (Fișierul 07);
  - CIV original;
  - Talonul vechi original;
  - Copie după polița RCA nouă (pe numele Cumpărătorului);
  - Dovada achitării contravalorii certificatului de înmatriculare și plăcuțelor.

================================================================================
Infrastructură operată automat prin platforma securizată ContractSmart 2026.
================================================================================`;

    zip.file(`Ghid_Post_Vanzare.txt`, continutGhidTxt);

    const zipContent = await zip.generateAsync({ type: "uint8array" });

    // -------------------------------------------------------------------------
    // NOU: SMART VAULT (SALVARE ÎN CRM) PENTRU AUTO
    // -------------------------------------------------------------------------
    try {
      const hashSha256 = crypto.createHash('sha256').update(zipContent).digest('hex');
      const fileName = `pachet_auto_${data.userId}_${Date.now()}.zip`;

      // Încărcăm arhiva .zip direct în Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('contract_vault')
        .upload(fileName, zipContent, { contentType: 'application/zip', upsert: false });

      if (!uploadError) {
        // Obținem URL-ul public pentru fișierul proaspăt încărcat
        const { data: publicUrlData } = supabase.storage.from('contract_vault').getPublicUrl(fileName);
        
        // Salvăm intrarea în tabelul CRM (user_contracts) ca să apară în panou!
        await supabase.from('user_contracts').insert({
          user_id: data.userId,
          titlu_contract: `Pachet Auto (${data.autoMarcaModel || 'Vehicul'})`,
          tip_contract: 'auto',
          client_nume: data.cumparatorNume || 'N/A',
          valoare: parseFloat(data.autoPret) || 0,
          moneda: data.autoMoneda || 'RON',
          hash_sha256: hashSha256,
          stare_plata: 'generat',
          pdf_url: publicUrlData.publicUrl
        });
      } else {
        console.error("Eroare upload zip in vault:", uploadError);
      }
    } catch (vaultErr) {
      console.error("Eroare la salvarea Auto în CRM Vault:", vaultErr);
    }

    // EMAIL RESEND (Fără Twilio)
    if (process.env.RESEND_API_KEY && data.clientEmail) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: 'ContractSmart <contact@contractsmart.ro>',
          to: data.clientEmail,
          subject: `Pachet Securizat Auto - ${data.autoMarcaModel || 'Vehicul'} (${data.autoVin || ''})`,
          text: `Salutare!\n\nGăsești atașat pachetul tău complet auto în format .ZIP generat prin ContractSmart.\n\nO zi excelentă!`,
          attachments: [
            {
              filename: `pachet_auto_${data.autoVin || 'securizat'}.zip`,
              content: Buffer.from(zipContent),
            },
          ],
        });
        console.log("E-mail transmis cu succes către:", data.clientEmail);
      } catch (emailErr) {
        console.error("Eroare trimitere e-mail Resend:", emailErr.message);
      }
    }

    return new NextResponse(zipContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=pachet_auto_${data.autoVin || 'securizat'}.zip`,
        'Content-Length': zipContent.length,
      },
    });

  } catch (err) {
    console.error("Crash la emiterea pachetului auto arhivatal:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}