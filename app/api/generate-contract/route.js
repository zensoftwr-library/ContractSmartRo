import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import puppeteer from 'puppeteer';

export const dynamic = 'force-dynamic';

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
      clientEmail, semnaturaPrestatorBase64, semnaturaClientBase64, userId, adaugaProcesVerbal, captchaToken,
      constructiiMateriale, constructiiManopera, constructiiSuprafata, constructiiPretMp,
      adaugaQrPlata, ibanPlata, clauzaCustom
    } = body;

    // -------------------------------------------------------------------------
    // 1. VALIDARE ANTI-SPAM CLOUDFLARE
    // -------------------------------------------------------------------------
    if (process.env.TURNSTILE_SECRET_KEY && captchaToken) {
      try {
        const formData = new URLSearchParams();
        formData.append('secret', process.env.TURNSTILE_SECRET_KEY);
        formData.append('response', captchaToken);

        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          body: formData
        });
        
        if (!verifyRes.ok) throw new Error('Cloudflare network error');
        const verifyData = await verifyRes.json();
        
        if (!verifyData.success) {
          return NextResponse.json({ success: false, message: 'Validare anti-spam eșuată. Te rugăm să reîncarci pagina.' }, { status: 403 });
        }
      } catch (cfErr) {
        console.error("Eroare verificare Cloudflare:", cfErr.message);
        // Continuăm dacă pică serverul CF, ca să nu blocăm userul aiurea
      }
    }

    // -------------------------------------------------------------------------
    // 2. VERIFICARE ANAF PRE-SEMNARE (VIA FIRMEAPI.RO)
    // -------------------------------------------------------------------------
    if (clientCui && process.env.FIRMEAPI_KEY) {
      const cleanCui = clientCui.replace(/[^0-9]/g, '');
      if (cleanCui.length >= 5) {
        try {
          const resFirma = await fetch(`https://www.firmeapi.ro/api/v1/firma/${cleanCui}`, {
            headers: { 'Authorization': `Bearer ${process.env.FIRMEAPI_KEY}`, 'Accept': 'application/json' },
            signal: AbortSignal.timeout(3500)
          });

          if (resFirma.ok) {
            const json = await resFirma.json();
            const d = json.data || {};
            
            // Verificare critică inactivitate ANAF
            if (d.status_inactiv && d.status_inactiv.inactiv) {
              return NextResponse.json({ 
                success: false, 
                message: `Atenție! Firma client este INACTIVĂ FISCAL. Contractul nu poate fi generat securizat pentru entități inactive.` 
              }, { status: 403 });
            }
          }
        } catch (apiErr) {
          console.error("Eroare validare pre-semnare FirmeAPI:", apiErr.message);
        }
      }
    }

    // -------------------------------------------------------------------------
    // 3. VERIFICARE CONT ȘI CREDITE SUPABASE
    // -------------------------------------------------------------------------
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

    // -------------------------------------------------------------------------
    // 4. HTML BUILDER (TEMEI JURIDIC & CLAUZE)
    // -------------------------------------------------------------------------
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
    let clauseCounter = 1;

    // Funcție inteligentă de auto-numerotare a clauzelor
    const adaugaClauza = (titlu, text) => {
        clauzeInjectateHtml += `<li style="margin-bottom: 8px;"><strong>ART. 4.${clauseCounter}. ${titlu}:</strong> ${text}</li>`;
        clauseCounter++;
    };

    // --- CLAUZE DE BAZĂ (Din afara nomenclatorului) ---
    if (body.clauzaLimitareRaspundere) {
        adaugaClauza('LIMITAREA RĂSPUNDERII COMERCIALE', 'Sub nicio formă și indiferent de natura litigiului, răspunderea financiară totală a Prestatorului pentru orice daune dovedite nu va depăși valoarea netă încasată efectiv pentru serviciile prestate în cadrul acestui contract.');
    }
    if (body.clauzaInflatie) {
        adaugaClauza('INDEXARE ANTI-INFLAȚIONISTĂ (EUR/BNR)', 'Pentru a menține echilibrul prestațiilor, prețul contractului va fi actualizat/indexat automat raportat la evoluția cursului EUR/RON comunicat de BNR sau la indicele inflației comunicat de INS, aplicându-se valoarea cea mai favorabilă Prestatorului.');
    }

    // --- NOMENCLATOR CLAUZE DINAMICE COMPLETE ---
    if (body.clauzaPi) {
        if (tipContract === 'inchiriere_imobil') {
            adaugaClauza('CLAUZĂ DE INVESTIRE CU TITLU EXECUTORIU', 'În conformitate cu art. 1798 Cod Civil, prezentul contract constituie titlu executoriu de drept pentru recuperarea chiriilor restante și pentru evacuarea rapidă a Locatarului la expirarea termenului sau în caz de neplată, fără somație și fără procedură judecătorească prealabilă.');
        } else if (tipContract === 'cda') {
            adaugaClauza('TRANSFER CONDIȚIONAT DE REMUNERAȚIE', 'Drepturile patrimoniale de exploatare a operei se transferă exclusiv condiționat de decontarea integrală, efectivă și confirmată bancar a prețului. Orice utilizare anterioară constituie delict civil și încălcare a drepturilor de autor.');
        } else {
            adaugaClauza('REȚINERE DE PROPRIETATE INTELECTUALĂ', 'Toate livrabilele, planurile, codul sursă și materialele de proiect rămân în proprietatea exclusivă a Prestatorului până la momentul stingerii integrale a tuturor obligațiilor de plată.');
        }
    }

    if (body.clauzaPenalitati) {
        if (tipContract === 'cda') {
             adaugaClauza('PENALITĂȚI DE UTILIZARE NEAUTORIZATĂ', 'Utilizarea, difuzarea sau exploatarea operei înainte de achitarea integrală a prețului sau cu depășirea limitelor convenite atrage aplicarea unui tarif penalizator dublu per incidență.');
        } else if (tipContract === 'promisiune_vanzare') {
             adaugaClauza('PENALITĂȚI ZI DE ÎNTÂRZIERE ACT NOTARIAL', 'Refuzul nejustificat sau neprezentarea uneia dintre părți la biroul notarial la data fixată atrage o penalitate simetrică pe fiecare zi de întârziere, datorată cu titlu de daune interese moratorii.');
        } else {
             adaugaClauza('REGIM PENALIZATOR ȘI DAUNE INTERESE', 'Depășirea scadenței facturilor atrage penalități de întârziere în cuantum de 0.5% pe zi calendaristică, calculate din suma restantă, constituind clauză penală conform Art. 1538 Cod Civil.');
        }
    }

    if (body.clauzaRevizii) {
        adaugaClauza('PLAFONARE STRUCTURALĂ FEEDBACK / REVIZII', 'Modificările sau revizile sunt limitate la maximum 2 runde incluse în bugetul agreat. Orice solicitare ulterioară de modificare structurală va fi tarifată suplimentar prin act adițional.');
    }

    if (body.clauzaRawFoto) {
        if (tipContract === 'inchiriere_imobil') {
             adaugaClauza('REȚINERE GARANȚIE / DEPOZIT DAUNE', 'Fondul de garanție constituit este reținut de Locator la încetarea contractului pentru acoperirea eventualelor deteriorări aduse imobilului sau a restanțelor la utilități din culpa Locatarului.');
        } else {
             adaugaClauza('RETENȚIE FIȘIERE SURSĂ / RAW', 'Obiectul contractului se predă exclusiv în format final/compilat. Transmiterea proiectelor deschise sau a fișierelor sursă necesită achitarea unei taxe de cesiune stabilite separat.');
        }
    }

    if (body.clauzaMarketingTerti) {
        if (tipContract === 'cda') {
            adaugaClauza('DREPT DE CREDITARE PATERNITATE', 'Beneficiarul are obligația corelativă de a menționa numele Autorului pe toate materialele publicate, pe canalele de difuzare și suporturile media electronice sau fizice utilizate.');
        } else {
            adaugaClauza('DREPT PORTOFOLIU & MARKETING', 'Prestatorul își rezervă dreptul inalienabil de a utiliza elemente din lucrare/materiale în portofoliul public cu titlu de studiu de caz comercial, exceptând datele protejate de confidențialitate.');
        }
    }

    if (body.clauzaAprobareTacita) {
        if (tipContract === 'inchiriere_imobil') {
            adaugaClauza('DREPT DE INSPECȚIE PROPRIETAR', 'Locatorul își rezervă dreptul de a inspecta starea tehnică a imobilului o dată pe lună, în prezența Locatarului, în baza unei notificări scrise prealabile transmise cu minimum 24 de ore înainte.');
        } else if (tipContract === 'promisiune_vanzare') {
            adaugaClauza('REZOLUȚIUNE DE DREPT LA TERMENUL FIXAT', 'Împlinirea termenului extinctiv fără perfectarea contractului de vânzare determină desființarea de drept a promisiunii prin efectul pactului comisoriu, fără punere în întârziere sau formalități.');
        } else {
            adaugaClauza('APROBARE TACITĂ LIVRABILE', 'Livrabilele transmise se consideră recepționate fără obiecțiuni și aprobate în lipsa unui refuz scris, explicit și motivat din partea Beneficiarului în termen de 5 zile calendaristice.');
        }
    }

    if (body.clauzaTaxaAnulare) {
        if (tipContract === 'promisiune_vanzare') {
             adaugaClauza('EXECUTARE ARVUNĂ CONFIRMATORIE', 'În caz de reziliere din culpa Promitentului Cumpărător, sumele predate cu titlu de avans vor fi reținute integral. În caz de renunțare a Promitentului Vânzător, acesta este obligat de drept la restituirea dublului sumei încasate.');
        } else if (tipContract === 'evenimente') {
             adaugaClauza('REȚINERE AVANS (NON-REFUNDABLE RETAINER)', 'Sumele achitate cu titlu de avans reprezintă rezervarea fermă a datei și a resurselor. Dacă Beneficiarul anulează evenimentul, avansul este considerat daune-interese compensatorii nereturnabile.');
        } else if (tipContract === 'inchiriere_imobil') {
             adaugaClauza('INTERDICȚIE SUBÎNCHIRIERE SPAȚIU', 'Locatarului îi este interzisă în mod absolut subînchirierea, cedarea folosinței sau darea în comodat a imobilului, total sau parțial, către terțe persoane fără acordul prealabil scris al Locatorului.');
        } else if (tipContract === 'influencer') {
             adaugaClauza('PENALITĂȚI PENTRU ÎNTÂRZIERE LIVRABILE', 'Depășirea termenului agreat de publicare atrage penalități de 10% per zi de întârziere din onorariul total stabilit.');
        } else {
             adaugaClauza('PENALITATE DE ANULARE (KILL FEE)', 'În cazul denunțării unilaterale a contractului din culpa exclusivă a Beneficiarului, sumele achitate cu titlu de avans rămân integral în posesia Prestatorului pentru blocarea resurselor operaționale.');
        }
    }

    if (body.clauzaSplitPayment) {
        adaugaClauza('PLĂȚI FRACȚIONATE (MILESTONES)', 'Decontarea și recepția fiecărei etape intermediare (milestones) condiționează în mod direct și imperativ deblocarea execuției pentru fazele de lucru subsecvente.');
    }

    if (body.clauzaRetentie) {
        if (tipContract === 'nda') {
             adaugaClauza('DISTRUGERE OBLIGATORIE DATE', 'La încetarea discuțiilor, Partea Primitoare se obligă să returneze sau să distrugă definitiv toate documentele și copiile digitale primite, transmițând o confirmare scrisă în 48 de ore.');
        } else {
             adaugaClauza('DREPT DE RETENȚIE TEHNICĂ', 'În caz de neplată a oricărei facturi scadente în termen de 15 zile, Prestatorul are facultatea legală de a sista serviciile, de a revoca permisiunile de acces sau de a suspenda instanțele de server și activele digitale.');
        }
    }

    if (body.clauzaItNonSolicit) {
        adaugaClauza('CLAUZĂ DE NON-SOLICITARE PERSONAL / CLIENȚI', 'Părțile se interzic reciproc de a racola, angaja sau contracta direct sau indirect personalul tehnic sau clienții celeilalte părți pe o durată de 2 ani de la încetarea relațiilor comerciale.');
    }

    if (body.clauzaAntiRecalificare) {
        if (tipContract === 'influencer') {
            adaugaClauza('EXCLUSIVITATE SECTORIALĂ', 'Creatorului îi este strict interzis să asocieze imaginea sau să promoveze branduri concurente directe pe o perioadă de 6 luni de la publicare.');
        } else {
            adaugaClauza('INDEPENDEȚĂ OPERAȚIONALĂ ȘI FISCALĂ (ANTI-RECALIFICARE)', 'Contractul elimină total subordonarea (Art. 7 Cod Fiscal). Prestatorul acționează pe riscul și cu mijloacele sale proprii, nefiind integrat în organigrama Beneficiarului.');
        }
    }

    if (body.clauzaSuspendareFeedback) {
        adaugaClauza('SUSPENDARE PENTRU LIPSĂ FEEDBACK', 'Orice întârziere a Beneficiarului în furnizarea materialelor sau aprobărilor ce depășește 5 zile lucrătoare atrage decalarea automată a predării și dreptul de a factura stadiul curent.');
    }

    if (body.clauzaLogisticaHoreca) {
        adaugaClauza('ASIGURARE LOGISTICĂ EVENIMENT', 'Beneficiarul se obligă să asigure Prestatorului acces la curent electric stabil (220V), mese calde pe durata evenimentelor ce depășesc 4 ore, și loc de parcare garantat pentru echipamente.');
    }

    if (body.clauzaOriginalitate) {
        adaugaClauza('GARANȚIA ORIGINALITĂȚII (ANTI-PLAGIAT)', 'Autorul garantează absolut și sub sancțiunea legii penale că opera este 100% creație originală, nu încalcă drepturile terților și nu a mai fost cedată anterior.');
    }

    if (body.clauzaDauneTerti) {
        adaugaClauza('RĂSPUNDEREA PENTRU DAUNE PROVOCATE TERȚILOR', 'Locatarul este 100% solidar responsabil pentru orice distrugeri (inundații, incendii din culpă, vandalism) provocate vecinilor sau spațiilor comune, degrevând total Locatorul de orice acțiune în regres.');
    }

    if (body.clauzaRiscPieire) {
        adaugaClauza('RISCUL PIEIRII BUNULUI', 'Până la semnarea formei autentice, riscul pieirii fortuite a imobilului rămâne în sarcina Promitentului-Vânzător. Orice degradare a stării fizice dă dreptul Cumpărătorului să ceară reducerea prețului sau rezilierea de drept.');
    }

    if (body.clauzaConstrucVicii) {
        adaugaClauza('GARANȚIE DE BUNĂ EXECUȚIE ȘI VICII ASCUNSE', 'Executantul garantează calitatea lucrărilor pe o perioadă de 36 de luni de la Procesul-Verbal de recepție finală, obligându-se la remedieri gratuite pentru viciile ascunse conform Legii 10/1995.');
    }

    if (body.clauzaConstrucAsigurare) {
        adaugaClauza('POLIZĂ DE ASIGURARE ȘANTIER (C.A.R.)', 'Constructorul trebuie să dețină asigurare validă tip Contractors All Risks pe durata execuției, preluând 100% din răspunderea civilă pentru daunele cauzate terților pe șantier.');
    }

    if (body.clauzaConstrucGrafic) {
        adaugaClauza('PENALITĂȚI GRAFIC DE EXECUȚIE', 'Întârzierea nejustificată a predării frontului de lucru sau a lucrărilor la termenele agreate atrage penalități de 0.15% per zi de întârziere din valoarea stadiului fizic nerealizat.');
    }

    if (body.clauzaItSla) {
        adaugaClauza('SERVICE LEVEL AGREEMENT (SLA)', 'Se garantează un uptime de 99.9% și un timp de răspuns la incidente critice de maximum 24h. Nerespectarea atrage credite de penalizare deduse direct din viitoarele facturi de abonament.');
    }

    if (body.clauzaItEscrow) {
        adaugaClauza('DEPOZITARE COD SURSĂ (ESCROW)', 'Codul sursă va fi depozitat la o entitate terță de tip escrow, activându-se dreptul de eliberare și utilizare în beneficiul clientului exclusiv în caz de insolvență sau faliment al furnizorului.');
    }

    if (body.clauzaHorecaForceMajeure) {
        adaugaClauza('DREPT DE REPORTARE ȘI FORȚĂ MAJORĂ SPECIALĂ', 'În caz de forță majoră sau restricții administrative, contractul se suspendă fără penalități, cu obligația de reprogramare obligatorie a evenimentului în limitele calendaristice disponibile.');
    }

    if (body.clauzaHorecaGarantat) {
        adaugaClauza('NUMĂR MINIM GARANTAT DE PARTICIPANȚI', 'Beneficiarul garantează un prag minim de facturare de 80% din volumul estimat inițial, valoarea fiind datorată integral indiferent de numărul real al participanților prezenți.');
    }

    if (body.clauzaMedicalMalpraxis) {
        adaugaClauza('EXONERARE RĂSPUNDERE ȘI MALPRAXIS', 'Delimitarea răspunderii furnizorului în limitele obligațiilor de mijloace și a consimțământului informat semnat, sub acoperirea exclusivă a poliței de răspundere civilă profesională.');
    }

    if (body.clauzaMedicalNoShow) {
        adaugaClauza('POLITICĂ STRICTĂ DE ANULARE PROGRAMĂRI', 'Anularea ședințelor programate cu mai puțin de 24 de ore înainte atrage facturarea integrală a tarifelor aferente sau reținerea definitivă a creditului din pachetul achiziționat.');
    }

    if (body.clauzaTranspCmr) {
        adaugaClauza('RĂSPUNDERE CONFORM CONVENȚIEI CMR', 'Angajarea răspunderii transportatorului pentru pierderea, avarierea mărfii sau depășirea termenului de livrare se guvernează strict de limitele plafonate impuse de Convenția CMR.');
    }

    if (body.clauzaTranspStationare) {
        adaugaClauza('TAXĂ DE STAȚIONARE / DEMURRAGE', 'Depășirea timpului alocat pentru operațiunile de încărcare/descărcare la rampă atrage aplicarea unei taxe fixe de staționare, calculată pe fiecare oră de imobilizare a autovehiculului.');
    }

    if (body.clauzaNdaDurata) {
        adaugaClauza('ULTRAACTIVITATEA OBLIGAȚIILOR', 'Obligațiile de confidențialitate și neutilizare a informațiilor supraviețuiesc încetării contractului cadru sau a negocierilor și rămân în vigoare pentru o durată de minimum 5 ani.');
    }

    if (body.clauzaNdaPermis) {
        adaugaClauza('DEZVĂLUIRI PERMISE PRIN LEGE', 'Divulgarea nu constituie o încălcare a confidențialității dacă este cerută de o autoritate judecătorească, cu condiția notificării imediate a celeilalte părți în scopul obținerii unei măsuri de protecție.');
    }

    if (body.clauzaCdaMoral) {
        adaugaClauza('INALIENABILITATEA DREPTURILOR MORALE', 'Drepturile morale de autor (paternitatea operei, dreptul de a se opune oricărei deformări sau modificări aduse operei) rămân atașate Autorului în mod perpetuu, inalienabil și imprescriptibil.');
    }

    if (body.clauzaCdaTeritoriu) {
        adaugaClauza('DELIMITARE TERITORIALĂ ȘI CANALE', 'Drepturile de exploatare comercială transmise sunt limitate strict la aria geografică și canalele media indicate în anexa tehnică, orice extindere necesitând un acord scris distinct.');
    }

    if (body.clauzaInchiriereRegie) {
        adaugaClauza('DOVADA PLĂȚII UTILITĂȚILOR LA ZI', 'Locatarul are obligația de a transmite lunar către Locator dovezile de plată ale utilităților. Acumularea de restanțe pe mai mult de 45 de zile dă dreptul la rezilierea de drept a contractului.');
    }

    if (body.clauzaInchiriereDest) {
        adaugaClauza('SCHIMBARE DESTINAȚIE SPAȚIU', 'Imobilul va fi utilizat exclusiv conform destinației stabilite. Schimbarea destinației în spațiu comercial, sediu social sau desfășurarea de activități economice fără acord scris este strict interzisă.');
    }

    if (body.clauzaPromisSarcini) {
        adaugaClauza('GARANȚIE EVICȚIUNE ȘI SARCINI IMOBIL', 'Promitentul-Vânzător garantează pe propria răspundere că imobilul este liber de orice sarcini, ipoteci, privilegii, procese de revendicare sau litigii aflate pe rolul instanțelor judecătorești.');
    }

    if (body.clauzaPromisCheltuieli) {
        adaugaClauza('REPARTIZARE TAXE NOTARIALE', 'Cheltuielile ocazionate de autentificarea actelor, onorariile notariale, taxele de intabulare în Cartea Funciară (OCPI) și extrasul de autentificare vor fi suportate conform convenției părților.');
    }

    if (clauzaCustom && clauzaCustom.trim() !== '') {
        adaugaClauza('CLAUZĂ SPECIALĂ ADIȚIONALĂ', clauzaCustom.trim());
    }

    const fieldHtml = (valoare, minWidth = "120px") => {
      if (valoare && valoare.toString().trim() !== '') {
        return `<span class="valoare-importata">${valoare.toString().trim()}</span>`;
      }
      return `<span class="linia-dinamica" style="min-width: ${minWidth};">&nbsp;</span>`;
    };

    const dataCurenta = new Date().toLocaleDateString('ro-RO');
    const numarContractUnic = `CS-${Math.floor(10000 + Math.random() * 90000)}`;

    // -------------------------------------------------------------------------
    // 5. REDACTARE HTML
    // -------------------------------------------------------------------------
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
          .qr-pay-box { margin: 25px auto; padding: 15px; border: 2px dashed #cbd5e1; background-color: #f8fafc; text-align: center; max-width: 320px; page-break-inside: avoid; border-radius: 8px; }
          .legal-footer { margin-top: 70px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #64748b; text-align: center; font-family: Arial, sans-serif; }
          .linia-dinamica { display: inline-block; border-bottom: 1px solid #000000; vertical-align: bottom; height: 18px; }
          .valoare-importata { font-weight: bold; border-bottom: 1px transparent solid; display: inline; padding: 0 2px; }
        </style>
      </head>
      <body>
        <!-- Brand header eliminat -->
        <div class="contract-title" style="max-width: 80%; margin: 0 auto; line-height: 1.4;">${titluContractOficial}</div>
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
        <div class="text-paragraph"><strong>ART. 2.1. TEMEIUL JURIDIC:</strong> ${temeiJuridicHtml}</div>
        <div class="text-paragraph"><strong>ART. 2.2. SPECIFICAȚII TEHNICE:</strong> Obiectul contractului este stabilit în mod expres prin convenția părților și constă în: ${fieldHtml(obiect, "350px")}.</div>

        <div class="capitol-title">CAPITOLUL III. OBLIGAȚII FINANCIARE ȘI SCADENȚĂ</div>
        <div class="text-paragraph"><strong>ART. 3.1. ONORARIU NOMINAL:</strong> Prețul stabilit de către Părți este în cuantum total de: <strong>${fieldHtml(valoare, "80px")} ${fieldHtml(moneda, "50px")}</strong>.</div>
        <div class="text-paragraph"><strong>ART. 3.2. DECONTARE:</strong> Stingerea obligațiilor de plată se va efectua prin virament bancar, termenele stipulate în facturi fiind esențiale și de decădere.</div>

        ${tipContract === 'constructii' ? `
        <div class="text-paragraph">
          <strong>ART. 3.3. DEVIZ FINANCIAR DEFALCAT:</strong> Valoarea menționată la Art. 3.1 este fundamentată conform devizului atașat lucrării:<br/><br/>
          <table style="width:90%; margin: 0 auto; border-collapse: collapse; font-size: 13px; text-align: left;" border="1">
            <tr><th style="padding: 6px; background-color: #f0f0f0;">Categorie Deviz</th><th style="padding: 6px; background-color: #f0f0f0;">Valoare (RON)</th></tr>
            <tr><td style="padding: 6px;">Materiale de Construcție de Bază</td><td style="padding: 6px; font-weight: bold;">${constructiiMateriale || '0'}</td></tr>
            <tr><td style="padding: 6px;">Manoperă Specializată & Echipă Tehnică</td><td style="padding: 6px; font-weight: bold;">${constructiiManopera || '0'}</td></tr>
            <tr><td style="padding: 6px;">Suprafață Acoperită (${constructiiSuprafata || '0'} mp * ${constructiiPretMp || '0'} lei/mp)</td><td style="padding: 6px; font-weight: bold;">${(parseFloat(constructiiSuprafata || 0) * parseFloat(constructiiPretMp || 0)).toFixed(2)}</td></tr>
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

        <div class="signature-layout" style="margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 20px;">
          <div class="signature-column">
            <strong>PENTRU PRESTATOR (PREDARE)</strong><br>
            <span style="font-size: 10px; color: #64748b;">(Pasul 1: Emitent)</span><br><br>
            ${semnaturaPrestatorBase64 ? `
              <img src="${semnaturaPrestatorBase64}" class="signature-image" alt="Semnatura Prestator" />
              <div style="font-size: 10px; color: #16a34a; background: #f0fdf4; padding: 4px; border-radius: 4px; margin-top: 5px;">
                ✓ Validat Electronic
              </div>
            ` : `
              <div class="signature-placeholder" style="border: 1px dashed #cbd5e1; padding: 10px; border-radius: 4px; color: #d97706;">
                [Așteaptă Semnătură]
              </div>
            `}
          </div>

          <div class="signature-column">
            <strong>PENTRU BENEFICIAR (PRIMIRE)</strong><br>
            <span style="font-size: 10px; color: #64748b;">(Pasul 2: Receptor)</span><br><br>
            ${semnaturaClientBase64 ? `
              <img src="${semnaturaClientBase64}" class="signature-image" alt="Semnatura Beneficiar" />
              <div style="font-size: 10px; color: #16a34a; background: #f0fdf4; padding: 4px; border-radius: 4px; margin-top: 5px;">
                ✓ Validat Electronic
              </div>
            ` : `
              <div class="signature-placeholder" style="border: 1px dashed #cbd5e1; padding: 10px; border-radius: 4px; color: #ef4444;">
                Așteaptă Semnătură
              </div>
            `}
          </div>
        </div>

        <div class="legal-footer">
          Document binar securizat generat digital. Proprietate exclusivă a proceselor auditate ContractSmart 2026.
        </div>
    `;

    // -------------------------------------------------------------------------
    // 6. ADĂUGARE PROCES VERBAL OPȚIONAL
    // -------------------------------------------------------------------------
    if (adaugaProcesVerbal === true || adaugaProcesVerbal === "true") {
      htmlContract += `
        <div style="page-break-before: always;"></div>
        <div class="contract-title" style="max-width: 80%; margin: 0 auto; line-height: 1.4;">${titluContractOficial}</div>
        <div class="contract-title">ANEXA 1: PROCES-VERBAL DE PREDARE-PRIMIRE</div>
        <div class="contract-subtitle">Anexă la Contractul nr. ${numarContractUnic} / ${dataCurenta}</div>
        
        <div class="text-paragraph">Încheiat astăzi, ${dataCurenta}, între:</div>
        <div class="text-paragraph">1. <strong>${fieldHtml(prestatorNume, "220px")}</strong> (în calitate de Prestator / Vânzător)</div>
        <div class="text-paragraph">2. <strong>${fieldHtml(clientNume, "220px")}</strong> (în calitate de Beneficiar / Cumpărător)</div>
        
        <div class="text-paragraph">Obiectul predării a constat în recepționarea fizică și calitativă a următoarelor bunuri/lucrări/servicii: ${fieldHtml(obiect, "350px")}.</div>
        <div class="text-paragraph">Prin semnarea prezentului proces-verbal, Beneficiarul declară în mod expres, ferm și neechivoc că a primit și recepționat bunurile/serviciile mai sus menționate. Beneficiarul confirmă că acestea sunt în stare perfectă de funcționare, cantitativ și calitativ conform standardelor agreate, și că <strong>nu are absolut nicio obiecțiune vizibilă sau ascunsă</strong> cu privire la acestea.</div>
        <div class="text-paragraph">Odată cu semnarea acestui document, se naște obligația de plată (dacă nu a fost deja achitată) și orice răspundere de paza juridică trece în sarcina Beneficiarului.</div>

        <div class="signature-layout">
          <div class="signature-column">
            PENTRU PRESTATOR (PREDARE)<br><br>
            ${semnaturaPrestatorBase64 ? `<img src="${semnaturaPrestatorBase64}" class="signature-image" alt="Semnatura Prestator" /><span style="font-size: 10px; font-weight: normal; color: #16a34a; display:block;">Semnat digital</span>` : `<div class="signature-placeholder" style="color: #ef4444;">[Lipsă Semnătură]</div>`}
          </div>
          <div class="signature-column">
            PENTRU BENEFICIAR (PRIMIRE)<br><br>
            ${semnaturaClientBase64 ? `<img src="${semnaturaClientBase64}" class="signature-image" alt="Semnatura Beneficiar" /><span style="font-size: 10px; font-weight: normal; color: #16a34a; display:block;">Semnat digital</span>` : `<div class="signature-placeholder" style="color: #ef4444;">[Lipsă Semnătură]</div>`}
          </div>
        </div>
      `;
    }

    htmlContract += `</body></html>`;

    // -------------------------------------------------------------------------
    // 7. GENERARE PDF CU PUPPETEER (PROTEJAT DE TRY/CATCH)
    // -------------------------------------------------------------------------
    let pdfBuffer;
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--single-process']
      });
      
      const page = await browser.newPage();
      await page.setContent(htmlContract, { waitUntil: 'networkidle0' });
      pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '40px', bottom: '40px', left: '40px', right: '40px' } });
      await browser.close();
    } catch (pdfError) {
      console.error("Eroare severă la generarea PDF-ului:", pdfError.message);
      return NextResponse.json({ success: false, message: 'A picat motorul de redare PDF intern. ' + pdfError.message }, { status: 500 });
    }

    // -------------------------------------------------------------------------
    // 8. TRIMITERE EMAIL VIA RESEND
    // -------------------------------------------------------------------------
    if (process.env.RESEND_API_KEY && clientEmail) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: 'ContractSmart <contact@contractsmart.ro>',
          to: clientEmail,
          subject: `Document Securizat - ${titluContractOficial}`,
          text: `Salutare!\n\nRegăsiți atașat contractul comercial generat securizat prin intermediul platformei ContractSmart.\n\nO zi excelentă!`,
          attachments: [{ filename: `contract_${tipContract}_securizat.pdf`, content: Buffer.from(pdfBuffer) }],
        });
      } catch (emailErr) {
        console.error("EROARE RESEND:", emailErr.message);
      }
    }

    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // 9. GESTIUNE CREDITE ȘI SMART VAULT (UPLOAD PDF)
    // -------------------------------------------------------------------------
    if (!isPremium && availableCredits > 0) {
      await supabase.from('profiles').update({ credits_remaining: availableCredits - 1 }).eq('id', userId);
    }

    const hashSha256 = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

    // NOU: Urcăm PDF-ul fizic în Supabase Storage (Seif)
    let pdfUrl = null;
    const fileName = `contract_${userId}_${Date.now()}.pdf`;
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('contract_vault')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error("Eroare la upload PDF în contract_vault:", uploadError.message);
    } else {
      // Dacă upload-ul a reușit, obținem link-ul public către fișier
      const { data: publicUrlData } = supabase.storage.from('contract_vault').getPublicUrl(fileName);
      pdfUrl = publicUrlData.publicUrl;
    }

    // Salvăm în baza de date noul contract, INCLUSIV link-ul proaspăt generat
    const { error: dbError } = await supabase.from('user_contracts').insert({
      user_id: userId,
      titlu_contract: `Contract ${tipContract || 'prestari'}`,
      tip_contract: tipContract || 'prestari',
      client_nume: clientNume || 'N/A',
      client_cui: clientCui || null,
      valoare: valoare ? Number(valoare) : 0,
      moneda: moneda || 'RON',
      hash_sha256: hashSha256,
      stare_plata: 'generat',
      pdf_url: pdfUrl // <--- MAGIC: Aici salvăm link-ul către PDF!
    });

    if (dbError) {
      console.error("Eroare salvare Smart Vault în DB:", dbError.message);
    }

    // AICI ERA PARTEA LIPSĂ: Returnăm PDF-ul către client
    return new NextResponse(pdfBuffer, { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/pdf', 
        'Content-Disposition': `attachment; filename=contract_${tipContract}_securizat.pdf`, 
        'Content-Length': pdfBuffer.length 
      }
    });

  } catch (error) { // AICI ERA A DOUA PARTE LIPSĂ: Închiderea blocului Try
    console.error("CATCH GLOBAL:", error.message);
    return NextResponse.json({ success: false, message: 'A picat generarea din server: ' + error.message }, { status: 500 });
  }
}