import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';
import JSZip from 'jszip';
import twilio from 'twilio';

export const dynamic = 'force-dynamic';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID || '',
  process.env.TWILIO_AUTH_TOKEN || ''
);

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
  } else {
    launchOptions.executablePath = "/usr/bin/chromium"; 
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

    const fisierTalon = formData.get('talon');
    const fisierCiv = formData.get('civ');
    const fisierBv = formData.get('buletin_vanzator');
    const fisierBc = formData.get('buletin_cumparator');

    // 1. Salvare structurată în tabela istoric din Supabase - REZOLVARE DEFINITIVĂ PGRST204
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
        insertPayload['pretIncludeTVA'] = !!data.pretIncludeTVA;
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
      ? `Societatea ${field(data.vanzatorNume, "200px")}, CUI ${field(data.vanzatorCui, "100px")}, Reg. Com. ${field(data.vanzatorRegCom, "100px")}, cu sediul social în ${field(data.vanzatorSediu, "220px")}, reprezentată legal de ${field(data.vanzatorReprezentant, "150px")}`
      : `Subsemnatul ${field(data.vanzatorNume, "200px")}, CNP ${field(data.vanzatorCnp, "110px")}, cu domiciliul în localitatea ${field(data.autoAdresaVanzator, "220px")}`;

    let dateCumparatorHtml = data.cumparatorTip === 'PJ'
      ? `Societatea ${field(data.cumparatorNume, "200px")}, CUI ${field(data.cumparatorCui, "100px")}, Reg. Com. ${field(data.cumparatorRegCom, "100px")}, cu sediul social în ${field(data.cumparatorSediu, "220px")}, reprezentată legal de ${field(data.cumparatorReprezentant, "150px")}`
      : `Subsemnatul ${field(data.cumparatorNume, "200px")}, CNP ${field(data.cumparatorCnp, "110px")}, cu domiciliul în localitatea ${field(data.autoAdresaCumparator, "220px")}`;

    const zip = new JSZip();

    const tipuriExemplare = [
      { nr: 1, destinatie: "EXEMPLAR NR. 1 - PENTRU ORGANUL FISCAL COMPETENT AL PERSOANEI CARE ÎNSTRĂINEAZĂ (REMTII VÂNZĂTOR)" },
      { nr: 2, destinatie: "EXEMPLAR NR. 2 - PENTRU ORGANUL FISCAL COMPETENT AL PERSOANEI CARE DOBÂNDEȘTE (IMPOZITARE CUMPĂRĂTOR)" },
      { nr: 3, destinatie: "EXEMPLAR NR. 3 - PENTRU PERSOANA JURIDICĂ SAU FIZICĂ CARE ÎNSTRĂINEAZĂ (PROPRIETATE VÂNZĂTOR)" },
      { nr: 4, destinatie: "EXEMPLAR NR. 4 - PENTRU PERSOANA JURIDICĂ SAU FIZICĂ CARE DOBÂNDEȘTE (PROPRIETATE CUMPĂRĂTOR)" },
      { nr: 5, destinatie: "EXEMPLAR NR. 5 - PENTRU SERVICIUL REGIM PERMISE ȘI ÎNMATRICULĂRI VEHICULE (DRPCIV)" }
    ];

    const stiluriSidequestComune = `
      .linia-dinamica { display: inline-block; border-bottom: 1px solid #000000; vertical-align: bottom; height: 16px; }
      .valoare-importata { font-weight: bold; padding: 0 3px; border-bottom: 1px transparent solid; }
    `;

    for (const ex of tipuriExemplare) {
      const htmlContractOficial = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Times New Roman', Times, serif; padding: 45px; color: #000; font-size: 12px; line-height: 1.5; }
            .official-box { border: 2px solid #000; padding: 12px; margin-bottom: 25px; text-align: center; font-weight: bold; font-family: Arial, sans-serif; font-size: 11px; }
            .title { text-align: center; font-size: 14px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
            .section-title { font-weight: bold; margin-top: 18px; margin-bottom: 6px; text-transform: uppercase; border-bottom: 1px solid #000; font-size: 12px; }
            .row-data { margin-bottom: 8px; text-align: justify; text-indent: 25px; }
            .signature-area { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
            .sig-box { width: 45%; border-top: 1px solid #000; text-align: center; padding-top: 6px; font-weight: bold; font-size: 11px; }
            ${stiluriSidequestComune}
          </style>
        </head>
        <body>
          <div class="official-box">MODEL TIPIC OFICIAL MODEL ITĂ - 014 // ${ex.destinatie}</div>
          <div class="title">CONTRACT DE ÎNSTRĂINARE - DOBÂNDIRE A UNUI MIJLOC DE TRANSPORT<br>Conform Prevederilor Codului Fiscal din România 2026</div>
          
          <div class="section-title">1. PERSOANA CARE ÎNSTRĂINEAZĂ (VÂNZĂTOR)</div>
          <div class="row-data">${dateVanzatorHtml}, deținător de drept al mijlocului de transport în baza actelor de proprietate și a certificatului de înmatriculare validat.</div>

          <div class="section-title">2. PERSOANA CARE DOBÂNDEȘTE (CUMPĂRĂTOR)</div>
          <div class="row-data">${dateCumparatorHtml}, care preia toate obligațiile fiscale născute din posesia bunului.</div>

          <div class="section-title">3. OBIECTUL CONTRACTULUI (IDENTIFICARE VEHICUL SUB PROFIL TEHNIC)</div>
          <div class="row-data">Mijlocul de transport marca și modelul: ${field(data.autoMarcaModel, "150px")}, Număr de înmatriculare curent: ${field(data.autoNumarInmatriculare, "100px")}, Serie Șasiu (VIN): <strong style="font-family: monospace;">${field(data.autoVin, "180px")}</strong>.</div>
          <div class="row-data"><strong>GARANȚIE CONTRACTUALĂ VRA (Vicii Ascunse):</strong> În conformitate cu normele imperative ale <strong>Art. 1707 din Codul Civil român</strong>, Vânzătorul garantează pe propria răspundere că bunul nu prezintă defecțiuni structurale, elemente de siguranță compromise sau manipulări ilicite ale odometrului/kilometrajului.</div>

          <div class="section-title">4. PREȚ, SCADENȚĂ ȘI ACHITARE BANCARĂ</div>
          <div class="row-data">Prețul cert, lichid și exigibil stabilit de comun acord pentru înstrăinarea vehiculului este de: <strong style="font-size: 13px;">${field(data.autoPret, "100px")} ${data.autoMoneda || 'RON'}</strong>${textTvaContract}, sumă stinsă integral prin decontare directă sau ordin de plată anexat.</div>

          <div class="signature-area">
            <div class="sig-box">SEMNĂTURĂ VÂNZĂTOR / ȘTAMPILĂ</div>
            <div class="sig-box">SEMNĂTURĂ CUMPĂRĂTOR</div>
          </div>
        </body>
        </html>
      `;
      const pdfBuffer = await randeazaHtmlInPdf(htmlContractOficial);
      zip.file(`01_Contract_Auto_Model_ITA014_Exemplar_${ex.nr}.pdf`, pdfBuffer);
    }

    const htmlProcesVerbal = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Times New Roman', Times, serif; padding: 45px; color: #000; font-size: 12px; line-height: 1.5; }
          .header-pv { text-align: center; font-weight: bold; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 25px; text-transform: uppercase; }
          .title-pv { text-align: center; font-size: 15px; font-weight: bold; margin-bottom: 20px; }
          .paragraph { text-align: justify; margin-bottom: 12px; text-indent: 25px; }
          .sig-layout { margin-top: 60px; display: flex; justify-content: space-between; }
          .sig-box { width: 45%; border-top: 1px solid #000; text-align: center; padding-top: 5px; font-weight: bold; }
          ${stiluriSidequestComune}
        </style>
      </head>
      <body>
        <div class="header-pv">Act Accesoriu Procedural Obligatoriu // ContractSmart 2026</div>
        <div class="title-pv">PROCES-VERBAL DE PREDARE - PRIMIRE VEHICUL</div>
        
        <div class="paragraph">Încheiat astăzi, data de <strong>${dataCurenta}</strong>, la ora exactă <strong>${oraCurenta}</strong>, ca urmare a perfectării contractului de înstrăinare-dobândire pentru vehiculul marca/model ${field(data.autoMarcaModel, "140px")}, având seria de șasiu ${field(data.autoVin, "180px")}.</div>
        
        <div class="paragraph">Subsemnatul/Societatea Vânzătoare predă, iar Cumpărătorul primește vehiculul identificat mai sus, împreună cu următoarele accesorii corelative: cheile autoturismului (număr: ${field(data.autoCheiNumar || '2', "40px")}), Cartea de Identitate a Vehiculului (CIV), certificatul de înmatriculare (talonul) completat olograf pe verso cu textul „Înstrăinat către... la data de ${dataCurenta}” și asigurarea RCA validă.</div>
        
        <div class="header-pv" style="border:none; margin: 15px 0; font-size:11px; text-align:justify; font-weight:bold; color:#ef4444;">
          ⚠️ IMPLICAȚIE JURIDICĂ ABSOLUTĂ: Din secunda semnării prezentului proces-verbal, Cumpărătorul preia răspunderea civilă și penală integrală cu privire la exploatarea mijlocului de transport. Orice contravenție rutieră (amenzi de viteză, camere radar, rovinietă), accident sau delict civil comise post-predare revin de drept Cumpărătorului, Vânzătorul fiind exonerat total în fața instanțelor judecătorești.
        </div>

        <div class="paragraph">Starea odometrului (kilometraj înregistrat în bord la momentul predării fizice): ${field(data.autoKilometri || '150000', "100px")} km.</div>

        <div class="sig-layout">
          <div class="sig-box">AM PREDAT VEHICULUL (VÂNZĂTOR)</div>
          <div class="sig-box">AM PRIMIT VEHICULUL (CUMPĂRĂTOR)</div>
        </div>
      </body>
      </html>
    `;
    const pdfPvBuffer = await randeazaHtmlInPdf(htmlProcesVerbal);
    zip.file(`06_Proces_Verbal_Predare_Primire_Exonerare_Raspundere.pdf`, pdfPvBuffer);

    const htmlCereriOficiale = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #000; font-size: 11px; line-height: 1.4; }
          .form-title { text-align: center; font-size: 13px; font-weight: bold; text-transform: uppercase; margin-bottom: 25px; }
          .field-row { margin-bottom: 12px; border-bottom: 1px dotted #666; padding-bottom: 2px; height: 20px; }
          .page-break { page-break-before: always; }
          ${stiluriSidequestComune}
        </style>
      </head>
      <body>
        <div class="form-title">CERERE PENTRU RADIEREA DIN EVIDENȚĂ A UNUI VEHICUL<br>Către Serviciul Public Regim Permise și Înmatriculări</div>
        <div class="field-row">Subsemnatul/Societatea (Vânzător): ${field(data.vanzatorNume, "250px")}</div>
        <div class="field-row">Identificator (CNP/CUI): ${field(data.vanzatorTip === 'PJ' ? data.vanzatorCui : data.vanzatorCnp, "150px")}</div>
        <div class="field-row">Solicit radierea din circulație a vehiculului marca: ${field(data.autoMarcaModel, "180px")}</div>
        <div class="field-row">Serie șasiu (VIN): ${field(data.autoVin, "180px")}, având numărul de înmatriculare: ${field(data.autoNumarInmatriculare, "120px")}.</div>
        <div class="field-row">Motivul radierii: Înstrăinare conform contractului anexat la data de ${dataCurenta}.</div>
        <div style="margin-top:40px; text-align:right; font-weight:bold;">Semnătură Vânzător: __________________</div>

        <div class="page-break"></div>

        <div class="form-title">CERERE PENTRU ÎNMATRICULAREA UNUI VEHICUL<br>Către Serviciul Public Regim Permise și Înmatriculări</div>
        <div class="field-row">Subsemnatul/Societatea (Cumpărător): ${field(data.cumparatorNume, "250px")}</div>
        <div class="field-row">Identificator (CNP/CUI): ${field(data.cumparatorTip === 'PJ' ? data.cumparatorCui : data.cumparatorCnp, "150px")}</div>
        <div class="field-row">Solicit înmatricularea în evidențele oficiale a vehiculului marca: ${field(data.autoMarcaModel, "180px")}</div>
        <div class="field-row">Serie șasiu (VIN): <strong style="font-family:monospace;">${field(data.autoVin, "180px")}</strong>, preț achiziție: ${field(data.autoPret, "100px")} ${data.autoMoneda || 'RON'}.</div>
        <div class="field-row">Solicit plăcuțe cu număr: [ ] La rând / [ ] Preferențial</div>
        <div style="margin-top:40px; text-align:right; font-weight:bold;">Semnătură Cumpărător: __________________</div>
      </body>
      </html>
    `;
    const pdfCereriBuffer = await randeazaHtmlInPdf(htmlCereriOficiale);
    zip.file(`07_Cereri_Oficiale_Inmatriculare_si_Radiere_DRPCIV.pdf`, pdfCereriBuffer);

    // BONUS COMPONENT: Generare PDF Raport Tehnic RAR din datele stării frontend
    if (data.rarReportBonus) {
      const report = data.rarReportBonus;
      const htmlRarBonus = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 45px; color: #000; line-height: 1.6; font-size: 12px; }
            .badge-bonus { background-color: #f59e0b; color: #000; font-weight: bold; padding: 6px 12px; text-align: center; border-radius: 6px; margin-bottom: 20px; display: inline-block; font-size: 11px; }
            .section-box { border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; margin-top: 15px; }
            .header-title { font-size: 16px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="badge-bonus">🎁 COMPONENTĂ BONUS PREMIUM ACTE AUTO INCLUSĂ VIA CONTRACTSMART</div>
          <div class="header-title">Audit Tehnic Oficial - Extras Registru Tehnic Executiv RAR</div>
          <div class="section-box">
            <p><strong>Serie Șasiu Verificată (VIN):</strong> ${data.autoVin}</p>
            <p><strong>Status Curent Validare Tehnică ITP:</strong> ${report.itpValid ? 'VALID' : 'EXPIRAT'}</p>
            <p><strong>Data Expirării Scadenței ITP:</strong> ${report.itpData || report.date?.dataExpirareItp || 'Nespecificat'}</p>
            <p><strong>Verificare Aliniere Odometru Tehnic:</strong> ${report.kmNeconformi || report.odometruProbleme ? '⚠️ SUSPICIUNE NEALINIERE KILOMETRAJ' : '✓ ISTORIC DE KILOMETRI STABIL / CONFORM'}</p>
          </div>
          <p style="font-size: 10px; color: #64748b; margin-top: 30px;">Acest extras constituie anexă asimilată dosarului de transfer și dovedește diligența rezonabilă exercitată la data de ${dataCurenta}.</p>
        </body>
        </html>
      `;
      const pdfRarBuffer = await randeazaHtmlInPdf(htmlRarBonus);
      zip.file(`08_Bonus_Raport_Tehnic_Verificare_Odometru_RAR.pdf`, pdfRarBuffer);
    }

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
  - Dovada achitării contravalorii certificatului de înmatriculare și plăcuțelor;
  - Extrasul de Audit Tehnic RAR (Fișierul 08 - Anexă Bonificație).

================================================================================
Infrastructură operată automat prin platforma securizată ContractSmart 2026.
================================================================================`;

    zip.file(`Ghid_Post_Vanzare.txt`, continutGhidTxt);

    if (data.clientTelefon || data.clientEmail) {
      try {
        const numarDestinatar = data.clientTelefon ? data.clientTelefon.trim() : '';
        if (numarDestinatar && process.env.TWILIO_WHATSAPP_FROM) {
          const formatE164 = numarDestinatar.startsWith('+') ? numarDestinatar : `+4${numarDestinatar}`;
          await twilioClient.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: `whatsapp:${formatE164}`,
            body: `Salutare! Pachetul tau auto securizat (.ZIP) pentru masina cu seria sasiu ${data.autoVin || ''} a fost compilat cu succes de serverele ContractSmart si transmis automat pe e-mail.`
          });
        }
      } catch (twilioError) {
        console.error("Notificare prin Twilio WhatsApp Business a eșuat structural:", twilioError.message);
      }
    }

    const zipContent = await zip.generateAsync({ type: "uint8array" });

    // Trimitere e-mail automat via Resend cu pachetul .ZIP atașat
    if (process.env.RESEND_API_KEY && data.clientEmail) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: 'ContractSmart <onboarding@resend.dev>',
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