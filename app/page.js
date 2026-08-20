'use client';
import './globals.css';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { createClient } from '@supabase/supabase-js';
import { Turnstile } from '@marsidev/react-turnstile';
import Navbar from './components/Navbar';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Singleton pattern: refolosim instanța dacă există, ca să evităm warning-ul de Multiple GoTrueClient
const supabase = globalThis.supabaseClient ?? createClient(supabaseUrl, supabaseAnonKey);

if (process.env.NODE_ENV !== 'production') {
  globalThis.supabaseClient = supabase;
}

// Funcție pentru comprimarea pozelor la dimensiunea ideală pentru AI
const compressImage = (file) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) return resolve(file); // Dacă e PDF, nu facem compresie
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIMENSION = 1600;
        let width = img.width;
        let height = img.height;
        if (width > height && width > MAX_DIMENSION) {
          height *= MAX_DIMENSION / width;
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width *= MAX_DIMENSION / height;
          height = MAX_DIMENSION;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.85); // 85% calitate = perfect OCR
      };
    };
  });
};

// NOMENCLATOR COMPLET CU TOATE CLAUZELE (VECHI INTEGRALE + NOI)
const nomenclatorClauze = {
  prestari: [
    { id: 'clauzaPi', titlu: '1. Suspendare IP / Proprietate Intelectuală', detaliu: 'Drepturile patrimoniale de autor și utilizare asupra livrabilelor se transferă exclusiv la data stingerii integrale, certe și exigibile a obligațiilor de plată.' },
    { id: 'clauzaPenalitati', titlu: '2. Majorări Penalizatoare Zilnice (Simetrice)', detaliu: 'Întârzierea executării obligațiilor atrage penalități de 0.1% pe zi din valoarea debitului restant, constituind clauză penală conform Art. 1538 Cod Civil.' },
    { id: 'clauzaRevizii', titlu: '3. Plafonare Feedback / Revizii', detaliu: 'Prețul include maximum 2 runde limitate de modificări structurale. Orice solicitare ulterioară va face obiectul unui act adițional tarifat conform devizului orar.' },
    { id: 'clauzaRawFoto', titlu: '4. Retenție Fișiere Sursă / RAW', detaliu: 'Obiectul contractului se predă exclusiv în format final/compilat. Transmiterea proiectelor deschise sau a fișierelor sursă necesită achitarea unei taxe de cesiune.' },
    { id: 'clauzaMarketingTerti', titlu: '5. Drept Portofoliu & Marketing', detaliu: 'Prestatorul își rezervă dreptul inalienabil de a utiliza elemente din lucrare în portofoliul public cu titlu de studiu de caz comercial, exceptând datele protejate de confidențialitate.' },
    { id: 'clauzaAprobareTacita', titlu: '6. Aprobare Tacită Livrabile', detaliu: 'Livrabilele transmise se consideră recepționate fără obiecțiuni și aprobate în lipsa unui refuz scris, explicit și motivat din partea Beneficiarului în termen de 5 zile calendaristice.' },
    { id: 'clauzaTaxaAnulare', titlu: '7. Taxă Anulare Proiect (Kill Fee)', detaliu: 'Denunțarea unilaterală din culpa Beneficiarului determină pierderea integrală a avansului încasat, cu titlu de daune interese compensatorii pentru imobilizarea resurselor tehnice.' },
    { id: 'clauzaSplitPayment', titlu: '8. Plăți Fracționate (Milestones)', detaliu: 'Decontarea și recepția fiecărei etape intermediare (milestone) condiționează în mod direct și imperativ deblocarea execuției pentru fazele de lucru subsecvente.' },
    { id: 'clauzaRetentie', titlu: '9. Drept de Retenție Tehnic', detaliu: 'În temeiul Art. 2495 Cod Civil, neplata facturilor la scadență acordă Prestatorului dreptul legitim de a suspenda imediat accesul la servicii, servere sau activele digitale.' },
    { id: 'clauzaConstrucVicii', titlu: '10. Garanție Vicii Ascunse și Remedieri', detaliu: 'Răspunderea executantului pentru vicii structurale apărute post-recepție se întinde pe o durată de 10 ani, cu obligația de remediere imediată pe cheltuială proprie conform legii.' },
    { id: 'clauzaConstrucAsigurare', titlu: '11. Poliză de Asigurare CAR (Contractors All Risks)', detaliu: 'Executantul se obligă să mențină valabilă o poliză de asigurare pentru toate riscurile constructorului pe toată durata organizării de șantier, acoperind integral daunele față de terți.' },
    { id: 'clauzaConstrucGrafic', titlu: '12. Penalități Depășire Grafic de Execuție', detaliu: 'Nerespectarea termenelor stabilite în graficul de execuție tehnologică atrage penalități progresive calculate pe fiecare zi de întârziere per fază de proiect.' },
    { id: 'clauzaItSla', titlu: '13. Acord privind Nivelul Serviciilor (SLA)', detaliu: 'Garantarea unui nivel de disponibilitate (uptime) de 99.9% pentru infrastructura cloud pusă la dispoziție, nerespectarea atrăgând credite de penalizare deduse direct din abonament.' },
    { id: 'clauzaItNonSolicit', titlu: '14. Clauză de Non-Solicitare Personal Tehnic', detaliu: 'Părțile se interzic reciproc de a racola, angaja sau contracta direct sau indirect personalul tehnic al celeilalte părți pe o durată de 2 ani de la încetarea relațiilor comerciale.' },
    { id: 'clauzaItEscrow', titlu: '15. Clauză de Escrow pentru Codul Sursă', detaliu: 'Depozitarea codului sursă la un terț autorizat cu titlu de escrow, activându-se dreptul de eliberare și utilizare în beneficiul clientului exclusiv în caz de insolvență a furnizorului.' },
    { id: 'clauzaHorecaForceMajeure', titlu: '16. Drept de Reportare și Forță Majoră Specială', detaliu: 'În caz de forță majoră sau restricții administrative, contractul se suspendă fără penalități, cu obligația de reprogramare obligatorie a evenimentului în limitele calendaristice disposable.' },
    { id: 'clauzaHorecaGarantat', titlu: '17. Număr Minim Garantat de Participanți', detaliu: 'Beneficiarul garantează un prag minim de facturare de 80% din volumul estimat inițial, valoarea fiind datorată integral indiferent de numărul real al participanților prezenți.' },
    { id: 'clauzaMedicalMalpraxis', titlu: '18. Exonerare Răspundere și Malpraxis', detaliu: 'Delimitarea răspunderii furnizorului în limitele obligațiilor de mijloace și a consimțământului informat semnat, sub acoperirea exclusivă a polizei de răspundere civilă profesională.' },
    { id: 'clauzaMedicalNoShow', titlu: '19. Politică Strictă de Anulare Programări', detaliu: 'Anularea ședințelor programate cu mai puțin de 24 de ore înainte atrage facturarea integrală a tariefelor aferente sau reținerea definitivă a creditului din pachetul achiziționat.' },
    { id: 'clauzaTranspCmr', titlu: '20. Răspundere conform Convenției CMR', detaliu: 'Angajarea răspunderii transportatorului pentru pierderea, avarierea mărfii sau depășirea termenului de livrare se guvernează strict de limitele plafonate impuse de Convenția CMR.' },
    { id: 'clauzaTranspStationare', titlu: '21. Taxă de Staționare / Demurrage', detaliu: 'Depășirea timpului alocat pentru operațiunile de încărcare/descărcare la rampă atrage aplicarea unei taxe fixe de staționare, calculată pe fiecare order de imobilizare a autovehiculului.' }
  ],
  colaborare_b2b: [
    { id: 'clauzaPi', titlu: '1. Suspendare IP / Proprietate Intelectuală', detaliu: 'Drepturile patrimoniale de autor se transferă exclusiv la data stingerii integrale a obligațiilor de plată.' },
    { id: 'clauzaAntiRecalificare', titlu: '2. Anti-Recalificare Fiscală (ANAF)', detaliu: 'Contractul elimină total subordonarea (Art. 7 Cod Fiscal), Prestatorul lucrând independent, cu program și mijloace proprii.' },
    { id: 'clauzaPenalitati', titlu: '3. Majorări Penalizatoare Zilnice', detaliu: 'Întârzierea executării obligațiilor atrage penalități zilnice din valoarea debitului restant.' },
    { id: 'clauzaItNonSolicit', titlu: '4. Clauză de Non-Solicitare Personal', detaliu: 'Părțile se interzic reciproc de a racola personalul sau clienții celeilalte părți pe o durată de 2 ani.' },
    { id: 'clauzaTaxaAnulare', titlu: '5. Taxă Anulare Proiect (Kill Fee)', detaliu: 'Denunțarea unilaterală din culpa Beneficiarului determină pierderea integrală a avansului încasat.' }
  ],
  design_arhitectura: [
    { id: 'clauzaPi', titlu: '1. Suspendare IP / Proprietate Intelectuală', detaliu: 'Drepturile de utilizare asupra livrabilelor arhitecturale se transferă la data plății integrale.' },
    { id: 'clauzaSuspendareFeedback', titlu: '2. Suspendare pentru Lipsă Feedback', detaliu: 'Întârzierea aprobărilor de către client decalează automat predarea și permite facturarea muncii la stadiul curent.' },
    { id: 'clauzaRevizii', titlu: '3. Plafonare Feedback / Revizii', detaliu: 'Prețul include maximum 2 runde limitate de modificări structurale.' },
    { id: 'clauzaSplitPayment', titlu: '4. Plăți Fracționate (Milestones)', detaliu: 'Decontarea și recepția fiecărei etape intermediare condiționează deblocarea execuției pentru fazele subsecvente.' },
    { id: 'clauzaMarketingTerti', titlu: '5. Drept Portofoliu & Marketing', detaliu: 'Prestatorul își rezervă dreptul de a utilize elemente din lucrare în portofoliul public.' }
  ],
  evenimente: [
    { id: 'clauzaTaxaAnulare', titlu: '1. Reținere Avans (Non-Refundable Retainer)', detaliu: 'Sumele achitate cu titlu de avans rămân integral la Prestator dacă evenimentul este anulat.' },
    { id: 'clauzaLogisticaHoreca', titlu: '2. Asigurare Logistică (Masă & Curent)', detaliu: 'Beneficiarul e obligat să asigure curent stabil, masă caldă pentru echipa tehnică și parcare.' },
    { id: 'clauzaHorecaForceMajeure', titlu: '3. Forță Majoră Specială (Reprogramare)', detaliu: 'Contractul se suspendă fără penalități în caz de stare de urgență/restricții, obligând la reprogramare.' },
    { id: 'clauzaMarketingTerti', titlu: '4. Drept Portofoliu & Marketing', detaliu: 'Prestatorul își rezervă dreptul inalienabil de a utiliza materiale foto/video în portofoliul de clienți.' }
  ],
  nda: [
    { id: 'clauzaPi', titlu: '1. Protecție Secrete Comerciale', detaliu: 'Interdicție absolută de utilizare, copiere sau multiplicare a informațiilor primite în scopuri exterioare negocierilor, sub sancțiunea legii privind combaterea concurenței neloiale.' },
    { id: 'clauzaPenalitati', titlu: '2. Daune Interese Predefinite', detaliu: 'Încălcarea obligației de confidențialitate atrage aplicarea unei clauze penale cu titlu de daune interese preevaluate, datorate instant fără obligația de a dovedi cuantumul prejudiciului.' },
    { id: 'clauzaRetentie', titlu: '3. Distrugere Obligatorie Date', detaliu: 'La încetarea discuțiilor, Partea Primitoare se obligă să returneze sau să distrugă definitiv toate documentele și copiile digitale primite, transmițând o confirmare scrisă în 48 de ore.' },
    { id: 'clauzaNdaDurata', titlu: '4. Ultraactivitatea Obligațiilor', detaliu: 'Obligațiile de confidențialitate și neutilizare a informațiilor supraviețuiesc încetării contractului cadru sau a negocierilor și rămân în vigoare pentru o durată de minimum 5 ani.' },
    { id: 'clauzaNdaPermis', titlu: '5. Dezvăluiri Permise prin Lege', detaliu: 'Divulgarea nu constituie o încălcare dacă este cerută de o autoritate judecătorească, cu condiția notificării imediate a celeilalte părți în scopul obținerii unei măsuri de protecție.' }
  ],
  cda: [
    { id: 'clauzaPi', titlu: '1. Transfer Condiționat de Drepturi', detaliu: 'Cesiunea drepturilor patrimoniale de autor se naște și produce efecte juridice exclusiv la data creditării contului Autorului cu valoarea integrală a prețului contractual.' },
    { id: 'clauzaOriginalitate', titlu: '2. Garanția Originalității (Anti-Plagiat)', detaliu: 'Autorul garantează absolut că opera este 100% creație proprie și nu încalcă drepturile altor autori.' },
    { id: 'clauzaPenalitati', titlu: '3. Penalități de Utilizare Neautorizată', detaliu: 'Utilizarea, difuzarea sau exploatarea operei înainte de achitarea integrală a prețului sau cu depășirea limitelor convenite atrage aplicarea unui tarif penalizator dublu per incidență.' },
    { id: 'clauzaMarketingTerti', titlu: '4. Drept de Creditare Paternitate', detaliu: 'Beneficiarul are obligația corelativă de a menționa numele Autorului pe toate materialele publicate, pe canalele de difuzare și suporturile media electronice sau fizice utilizate.' },
    { id: 'clauzaCdaMoral', titlu: '5. Inalienabilitatea Drepturilor Morale', detaliu: 'Drepturile morale de autor (paternitatea operei, dreptul de a se opune oricărei deformări sau modificări aduse operei) rămân atașate Autorului în mod perpetuu, inalienabil și imprescriptibil.' },
    { id: 'clauzaCdaTeritoriu', titlu: '6. Delimitare Teritorială și Canale', detaliu: 'Drepturile de exploatare comercială transmise sunt limitate strict la aria geografică și canalele media indicate în anexa tehnică, orice extindere necesitând un acord scris distinct.' }
  ],
  inchiriere_imobil: [
    { id: 'clauzaPi', titlu: '1. Pact Comisoriu / Titlu Executoriu', detaliu: 'În conformitate cu Art. 1798 Cod Civil, prezentul contract constituie titlu executoriu pentru plata chiriei și evacuare rapidă la expirarea termenului, fără necesitatea unei acțiuni în justiție.' },
    { id: 'clauzaDauneTerti', titlu: '2. Răspundere Daune Terți', detaliu: 'Locatarul răspunde 100% pentru distrugerile (inundații/incendii) provocate vecinilor din culpa sa.' },
    { id: 'clauzaPenalitati', titlu: '3. Penalități pentru Întârziere Chirie', detaliu: 'Neplata chiriei la termenul fixat atrage majorări zilnice penalizatoare. Depășirea scadenței cu mai mult de 15 zile activează de drept pactul comisoriu și rezilierea unilaterală.' },
    { id: 'clauzaRawFoto', titlu: '4. Reținere Garanție / Depozit Daune', detaliu: 'Fondul de garanție constituit este reținut de Locator la încetarea contractului pentru acoperirea eventualelor deteriorări aduse imobilului sau a restanțelor la utilități din culpa Locatarului.' },
    { id: 'clauzaAprobareTacita', titlu: '5. Drept de Inspecție Proprietar', detaliu: 'Locatorul își rezervă dreptul de a inspecta starea tehnică a imobilului o dată pe lună, în prezența Locatarului, în baza unei notificări scrise prealabile transmise cu minimum 24 de ore înainte.' },
    { id: 'clauzaTaxaAnulare', titlu: '6. Interdicție Subînchiriere Spațiu', detaliu: 'Locatarului îi este interzisă în mod absolut subînchirierea, cedarea folosinței sau darea în comodat a imobilului, total sau parțial, către terțe persoane fără acordul prealabil scris al Locatorului.' },
    { id: 'clauzaInchiriereRegie', titlu: '7. Dovada Plății Utilităților la Zi', detaliu: 'Locatarul are obligația de a transmite lunar către Locator dovezile de plată ale utilităților. Acumularea de restanțe pe mai mult de 45 de zile dă dreptul la rezilierea de drept a contractului.' },
    { id: 'clauzaInchiriereDest', titlu: '8. Schimbare Destinație Spațiu', detaliu: 'Imobilul va fi utilizat exclusiv conform destinației stabilite. Schimbarea destinației în spațiu comercial, sediu social sau desfășurarea de activități economice fără acord scris este strict interzisă.' }
  ],
  promisiune_vanzare: [
    { id: 'clauzaTaxaAnulare', titlu: '1. Arvună Confirmatorie (Pierdere Avans)', detaliu: 'În temeiul Art. 1544 Cod Civil, dacă Promitentul-Cumpărător renunță la tranzacție, avansul se pierde integral. Dacă Promitentul-Vânzător refuză perfectarea, va restitui dublul arvunei primite.' },
    { id: 'clauzaRiscPieire', titlu: '2. Riscul Pieirii Bunului', detaliu: 'Până la semnarea la notar, riscul degradării bunului e la Vânzător, generând scăderea prețului.' },
    { id: 'clauzaPenalitati', titlu: '3. Penalități Zi de Întârziere Act Notarial', detaliu: 'Refuzul nejustificat sau neprezentarea uneia dintre părți la biroul notarial la data fixată atrage o penalitate simetrică pe fiecare zi de întârziere, datorată cu titlu de daune interese moratorii.' },
    { id: 'clauzaAprobareTacita', titlu: '4. Rezoluțiune de Drept la Termenul Fixat', detaliu: 'Împlinirea termenului extinctiv fără perfectarea contractului de vânzare determină desființarea de drept a promisiunii prin efectul pactului comisoriu, fără punere în întârziere sau formalități.' },
    { id: 'clauzaPromisSarcini', titlu: '5. Garanție Evicțiune și Sarcini Imobil', detaliu: 'Promitentul-Vânzător garantează pe propria răspundere că imobilul este liber de orice sarcini, ipoteci, privileges, procese de revendicare sau litigii aflate pe rolul instanțelor judecătorești.' },
    { id: 'clauzaPromisCheltuieli', titlu: '6. Repartizare Taxe Notariale', detaliu: 'Cheltuielile ocazionate de autentificarea actelor, onorariile notariale, taxele de intabulare în Cartea Funciară (OCPI) și extrasul de autentificare vor fi suportate conform convenției părților.' }
  ],
  influencer: [
    { id: 'clauzaPi', titlu: '1. Drepturi de Utilizare a Imaginii (Usage Rights)', detaliu: 'Beneficiarul are dreptul de a refolosi, sponsoriza (Dark Posting) și integra materialele în campaniile proprii de paid media pe perioada agreata.' },
    { id: 'clauzaRevizii', titlu: '2. Plafonare Rundă Revizii (Reshoots)', detaliu: 'Sunt incluse gratuit maxim 2 runde de modificări pe draftul de conținut. Refilmările integrale din alte motive decât calitatea se tarifează extra.' },
    { id: 'clauzaAntiRecalificare', titlu: '3. Exclusivitate Sectorială', detaliu: 'Creatorului îi este strict interzis să asocieze imaginea sau să promoveze branduri concurente directe pe o perioadă de 6 luni de la publicare.' },
    { id: 'clauzaTaxaAnulare', titlu: '4. Penalități pentru Întârziere Livrabile', detaliu: 'Depășirea termenului agreat de publicare atrage penalități de 10% per zi de întârziere din onorariul total stabilit.' }
  ],
  it_sla: [
    { id: 'clauzaItSla', titlu: '1. Service Level Agreement (SLA)', detaliu: 'Se garantează un uptime de 99.9% și un timp de răspuns la incidente critice de maximum 24h. Încălcarea atrage creditări automate (reducere factură).' },
    { id: 'clauzaItEscrow', titlu: '2. Depozitare Cod Sursă (Escrow)', detaliu: 'Codul sursă va fi depozitat la o entitate terță de tip escrow, eliberându-se Beneficiarului doar în cazul insolvenței sau falimentului Prestatorului.' },
    { id: 'clauzaItNonSolicit', titlu: '3. Non-Solicitare Angajați IT', detaliu: 'Interdicție absolută de a oferta, recruta sau angaja dezvoltatorii/inginerii celeilalte părți pe o durată de 2 ani de la încheierea relației.' },
    { id: 'clauzaPi', titlu: '4. Transfer Proprietate Intelectuală (IP)', detaliu: 'Transferul integral al drepturilor patrimoniale de autor pe codul compilat se produce strict la achitarea completă a fiecărui Sprint/Milestone.' }
  ],
  constructii: [
    { id: 'clauzaConstrucVicii', titlu: '1. Garanție de Bună Execuție', detaliu: 'Executantul garantează calitatea lucrărilor pe o perioadă de 36 de luni de la Procesul-Verbal de recepție finală, obligându-se la remedieri gratuite.' },
    { id: 'clauzaConstrucAsigurare', titlu: '2. Poliză de Asigurare Șantier (C.A.R.)', detaliu: 'Constructorul trebuie să dețină asigurare validă tip Contractors All Risks pe durata execuției, preluând 100% din răspunderea pentru daunele față de terți.' },
    { id: 'clauzaConstrucGrafic', titlu: '3. Penalități Grafic de Execuție', detaliu: 'Întârzierea predării frontului de lucru la termenele agreate atrage penalități de 0.15% per zi de întârziere din valoarea etapei nerealizate.' },
    { id: 'clauzaPenalitati', titlu: '4. Recepție pe Faze Determinante', detaliu: 'Plățile se eliberează exclusiv în baza confirmării scrise a calității la finalul fiecărei faze (fundație, roșu, finisaje), nefiind permise avansuri neacoperite.' }
  ]
};

// LINK-URI GUMROAD DINAMICE
const gumroadLinks = {
  founder: 'https://zensoftware.gumroad.com/l/founder-lifetime',
  pro: 'https://zensoftware.gumroad.com/l/abonament-pro',
  contract_auto: 'https://zensoftware.gumroad.com/l/pachet-acte-auto',
  qr_vcard: 'https://zensoftware.gumroad.com/l/qr-vcard-pro',
  qr_branding: 'https://zensoftware.gumroad.com/l/qr-branding',
  qr_dynamic: 'https://zensoftware.gumroad.com/l/qr-dinamic',
  sablon_tipizat: 'https://zensoftware.gumroad.com/l/sablon-tipizat-legal',
  one_time_contract: 'https://zensoftware.gumroad.com/l/contract-b2b',
  raport_detaliat: 'https://zensoftware.gumroad.com/l/raport-companie'
};

export default function Home() {
  const [loadingText, setLoadingText] = useState(null);
  const [step, setStep] = useState(1);
  const [autoStep, setAutoStep] = useState('upload');
  const [acordGdpr, setAcordGdpr] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [captchaToken, setCaptchaToken] = useState(null); 
  const isProcessingForm = useRef(false);

  // STATE-URI MEGA QR
  const [qrType, setQrType] = useState('url'); 
  const [qrUrl, setQrUrl] = useState('');
  const [wifiData, setWifiData] = useState({ ssid: '', password: '', type: 'WPA' });
  const [waData, setWaData] = useState({ phone: '', message: '' });
  const [cryptoData, setCryptoData] = useState({ coin: 'bitcoin', address: '', amount: '' });
  const [iosUrl, setIosUrl] = useState('');
  const [androidUrl, setAndroidUrl] = useState('');
  const [geoRules, setGeoRules] = useState([{ country: 'RO', url: '' }, { country: 'DE', url: '' }]);
  const [landingData, setLandingData] = useState({ avatarUrl: '', title: '', desc: '', links: [{ label: 'Website', url: '' }] });

  const [uploadedPdfUrl, setUploadedPdfUrl] = useState('');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  // Tracking
  const [dynamicDestUrl, setDynamicDestUrl] = useState('');
  const [generatedDynamicUrl, setGeneratedDynamicUrl] = useState('');
  const [isGeneratingShortlink, setIsGeneratingShortlink] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [qrStats, setQrStats] = useState([]);
  const [editingQrId, setEditingQrId] = useState(null);
  const [editQrUrl, setEditQrUrl] = useState('');

  const handleEditQr = async (id) => {
    if (!editQrUrl) return;
    try {
      const res = await fetch('/api/qr/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, newUrl: editQrUrl, userId: user.id })
      });
      if (res.ok) {
        setQrStats(prev => prev.map(q => q.id === id ? { ...q, url: editQrUrl } : q));
        setEditingQrId(null);
        setEditQrUrl('');
      }
    } catch(e) {}
  };

  const handleDeleteQr = async (id) => {
    if (!confirm('Sigur vrei să ștergi acest link? Codul QR tipărit nu va mai duce nicăieri!')) return;
    try {
      const res = await fetch('/api/qr/manage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, userId: user.id })
      });
      if (res.ok) {
        setQrStats(prev => prev.filter(q => q.id !== id));
      }
    } catch(e) {}
  };

  const [qrData, setQrData] = useState({ nume: '', telefon: '', iban: '', suma: '', url: '', email: '', functie: '', banca: '' });
  const [qrGeneratedUrl, setQrGeneratedUrl] = useState('');

  const [cursBnr, setCursBnr] = useState({ eur: '4.9752', usd: '4.5820' });
  const [qrColor, setQrColor] = useState('#000000');
  const [qrLogo, setQrLogo] = useState(null);
  const [qrLogoRatio, setQrLogoRatio] = useState(1);

  const handleQrLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgResult = event.target.result;
        const img = new window.Image();
        img.onload = () => {
          setQrLogoRatio(img.width / img.height);
          setQrLogo(imgResult);
        };
        img.src = imgResult;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadGeneric = async (e, setUrlState, bucketName = 'qr_pdfs', loadingStateSetter) => {
    const file = e.target.files[0];
    if (!file) return;
    loadingStateSetter(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      let { error: uploadError } = await supabase.storage.from(bucketName).upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
      setUrlState(data.publicUrl);
    } catch (error) {
      alert("Eroare la încărcare: " + error.message);
    } finally {
      loadingStateSetter(false);
    }
  };

  const [indiciBursa, setIndiciBursa] = useState({
    bet: { puncte: '17,420.50', procent: '+1.24%', vol: '45.2M', high: '17,450.00', low: '17,210.20', trend: [] },
    sp500: { puncte: '5,310.12', procent: '+0.68%', vol: '2.1B', high: '5,325.50', low: '5,280.10', trend: [] },
    nasdaq: { puncte: '18,650.45', procent: '-0.12%', vol: '1.8B', high: '18,720.00', low: '18,590.30', trend: [] }
  });
  const [stiriLive, setStiriLive] = useState([]);

  const [user, setUser] = useState(null); 
  const [profil, setProfil] = useState(null);
  const [userTier, setUserTier] = useState('free');

  const isPremium = ['founder', 'pro'].includes(profil?.subscription_tier) || profil?.is_pro;

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false); 

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const [widgetCompany, setWidgetCompany] = useState(null);
  const [widgetLoading, setWidgetLoading] = useState(false);

  // STATE-URI PENTRU WIDGET CUI & AUTOCOMPLETARE
  const [cuiSearch, setCuiSearch] = useState('');
  const [cuiDataResult, setCuiDataResult] = useState(null);
  useEffect(() => { setCuiDataResult(null); setCuiSearch(''); }, []);
  const [isSearchingCui, setIsSearchingCui] = useState(false);
  useEffect(() => {
    if (!cuiSearch || cuiSearch.trim() === '') {
      setCuiDataResult(null);
    }
  }, [cuiSearch]);
  const [prestatorCuiStatus, setPrestatorCuiStatus] = useState(null);
  const [clientCuiStatus, setClientCuiStatus] = useState(null);

  // Funcția păstrată exclusiv pentru butonul manual sau Enter în widget
  const handleCautareCuiWidget = async (e) => {
    e.preventDefault();
    const cleanCui = cuiSearch.replace(/[^0-9]/g, '');
    if (!cleanCui || cleanCui.length < 5) return alert("Introdu un CUI valid.");

    setIsSearchingCui(true);
    setCuiDataResult(null);
    try {
      const res = await fetch(`/api/anaf?cui=${cleanCui}`);
      const data = await res.json();
      if (data.success) {
        setCuiDataResult(data.data);
      } else {
        alert(data.message || 'Firma nu a fost găsită.');
      }
    } catch (err) {
      alert("Eroare de rețea.");
    } finally {
      setIsSearchingCui(false);
    }
  };

  const handleDownloadReport = () => {
    if (cuiDataResult?.cui) {
      handleDownloadPremiumReport(cuiDataResult.cui);
    } else {
      alert("Te rog să cauți o firmă mai întâi.");
    }
  };

  // Funcția care doar generează și descarcă PDF-ul
  const handleDownloadPremiumReport = async (cuiTarget) => {
    setLoadingText({ title: "GENERARE RAPORT...", desc: "Preluăm datele financiare și generăm PDF-ul." });
    try {
      const res = await fetch('/api/cui/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cui: cuiTarget, userId: user.id })
      });

      if (res.ok) {
        const blob = await res.blob();
        const urlDownload = window.URL.createObjectURL(blob);
        const elementA = document.createElement('a');
        elementA.href = urlDownload;
        elementA.download = `Raport_Financiar_${cuiTarget}.pdf`;
        document.body.appendChild(elementA);
        elementA.click();
        document.body.removeChild(elementA);
        window.URL.revokeObjectURL(urlDownload);
        alert("Raportul a fost descărcat cu succes!");

        // --- LOGICA NOUĂ: SCĂDEM UN RAPORT PENTRU CONTURILE PRO ---
        if (user?.status === 'pro') {
          const rapoarteConsumateAcum = (user.proReportsUsed || 0) + 1;

          // 1. Salvăm în baza de date
          const { error } = await supabase
            .from('profiles')
            .update({ pro_reports_used: rapoarteConsumateAcum })
            .eq('id', user.id);

          if (!error) {
            // 2. Actualizăm starea vizuală pe loc (să scadă din 3 direct pe ecran)
            setUser(prevUser => ({ ...prevUser, proReportsUsed: rapoarteConsumateAcum }));
          } else {
            console.error("Eroare la update supabase:", error);
          }
        }
      } else {
        const textEroare = await res.json();
        alert(textEroare.message || "Eroare la generare");
      }
    } catch {
      alert("Eroare server.");
    } finally {
      setLoadingText(null);
    }
  };
  
  // --- LOGICA NOUĂ PENTRU BUTON (Aici definim rolurile dinamic) ---
  const isFounder = user?.role === 'founder' || user?.plan === 'founder';
  const userRole = isFounder ? 'founder' : (isPremium ? 'pro' : 'free');
  const proReportsUsed = user?.proReportsUsed || 0;
  const GUMROAD_LINK = "https://zensoftware.gumroad.com/l/raport-companie";

  const handleReportAction = async () => {
    if (!user) return alert("Trebuie să fii autentificat pentru a descărca rapoarte.");

    if (user?.status === 'free') {
      window.open(GUMROAD_LINK, '_blank');
      return;
    }
    if (user?.status === 'pro') {
      if ((user?.proReportsUsed || 0) < 3) {
        await handleDownloadPremiumReport(cuiDataResult.cui);
      } else {
        window.open(GUMROAD_LINK, '_blank');
      }
      return;
    }
    if (user?.status === 'founder') {
      await handleDownloadPremiumReport(cuiDataResult.cui);
      return;
    }
  };

  let buttonText = "Descarcă Raport ( Pret 19 Ron ( 3.99€ ) / Raport )";
  let isLocked = true; 

  if (user?.status === 'founder') {
    buttonText = "Descarcă Raport Detaliat";
    isLocked = false;
  } else if (user?.status === 'pro') {
    if (user?.proReportsUsed < 3) {
      const rapoarteRamase = 3 - (user?.proReportsUsed || 0);
      buttonText = `Descarcă Raport (Gratuit PRO - Mai ai ${rapoarteRamase}/3)`;
      isLocked = false;
    } else {
      buttonText = "Descarcă Raport ( Pret 19 Ron ( 3.99€ ) / Raport )";
      isLocked = true;
    }
  }

  const [fiscal, setFiscal] = useState({
    venitLunar: 0,
    formaJuridica: 'SRL', 
    platitorTva: false,
    areAngajati: true,
    normaRegiune: 45000
  });

  const [formData, setFormData] = useState({
    tipContract: 'prestari', 
    initiatorRol: 'prestator', 
    prestatorNume: '', prestatorCui: '', prestatorEmail: '', prestatorLogo: '', prestatorCuloare: '#8ba888', prestatorReprezentant: '', prestatorAdresa: '',
    clientNume: '', clientCui: '', clientEmail: '', clientReprezentant: '', clientAdresa: '',
    obiect: '', valoare: '', moneda: 'RON', emiteFacturaAvans: false,
    estePlatitorTVA: false,
    clauzaPi: true, clauzaPenalitati: true, clauzaRevizii: false, tarifOrar: '150',
    clauzaRawFoto: false, clauzaMarketingTerti: false, clauzaAprobareTacita: false, clauzaTaxaAnulare: false,
    clauzaSplitPayment: false, clauzaRetentie: false,
    clauzaLimitareRaspundere: false, clauzaInflatie: false, adaugaProcesVerbal: false,
    constructiiMateriale: '', constructiiManopera: '', constructiiSuprafata: '', constructiiPretMp: '',
    adaugaQrPlata: false, ibanPlata: '', clauzaCustom: ''
  });

  const handleAutofillCui = async (cuiValue, rol) => {
    const cleanCui = cuiValue.replace(/[^0-9]/g, '');
    if (cleanCui.length < 5) return;

    try {
      const res = await fetch(`/api/cui?cui=${cleanCui}`);
      const data = await res.json();

      if (data.success && data.data) {
        if (rol === 'prestator') {
          setFormData(prev => ({ 
            ...prev, 
            prestatorNume: data.data.denumire || '',          
            prestatorAdresa: data.data.adresa || '',        
            prestatorReprezentant: data.data.administrator || '' 
          }));
          setPrestatorCuiStatus(data.data.stare);
        } else if (rol === 'client') {
          setFormData(prev => ({ 
            ...prev, 
            clientNume: data.data.denumire || '',              
            clientAdresa: data.data.adresa || '',         
            clientReprezentant: data.data.administrator || ''        
          }));
          setClientCuiStatus(data.data.stare);
        } else if (rol === 'vanzator_auto') {
          setAutoData(prev => ({
            ...prev,
            vanzatorNume: data.data.denumire || prev.vanzatorNume,
            vanzatorSediu: data.data.adresa || prev.vanzatorSediu,
            vanzatorRegCom: data.data.regCom || prev.vanzatorRegCom
          }));
        } else if (rol === 'cumparator_auto') {
          setAutoData(prev => ({
            ...prev,
            cumparatorNume: data.data.denumire || prev.cumparatorNume,
            cumparatorSediu: data.data.adresa || prev.cumparatorSediu,
            cumparatorRegCom: data.data.regCom || prev.cumparatorRegCom
          }));
        }
      }
    } catch (e) {
      console.error("Eroare la autocompletarea CUI:", e);
    }
  };
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (formData.prestatorCui?.replace(/[^0-9]/g, '').length >= 5) {
        handleAutofillCui(formData.prestatorCui, 'prestator');
      } else if (!formData.prestatorCui || formData.prestatorCui.trim() === '') {
        setFormData(prev => ({ ...prev, prestatorNume: '', prestatorReprezentant: '', prestatorAdresa: '' }));
        setPrestatorCuiStatus('');
      }
    }, 800);
    return () => clearTimeout(delayDebounceFn);
  }, [formData.prestatorCui]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (formData.clientCui?.replace(/[^0-9]/g, '').length >= 5) {
        handleAutofillCui(formData.clientCui, 'client');
      } else if (!formData.clientCui || formData.clientCui.trim() === '') {
        setFormData(prev => ({ ...prev, clientNume: '', clientReprezentant: '', clientAdresa: '' }));
        setClientCuiStatus('');
      }
    }, 800);
    return () => clearTimeout(delayDebounceFn);
  }, [formData.clientCui]);

  const [autoDocs, setAutoDocs] = useState({ civ: null, buletin_vanzator: null, buletin_cumparator: null, talon: null });
  const [isUploading, setIsUploading] = useState(false);

  const [isScanning, setIsScanning] = useState(null);

  const [scrollPercent, setScrollPercent] = useState(0);

  const [signatureTab, setSignatureTab] = useState('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const [uploadedSignature, setUploadedSignature] = useState(null);

  const videoRef = useRef(null);
  const autoCanvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [alignmentStatus, setAlignmentStatus] = useState('searching');
  const [targetDocType, setTargetDocType] = useState('civ');
  const [autoSignatureTab, setAutoSignatureTab] = useState('draw');
  const autoSigCanvasRef = useRef(null);
  const [isAutoDrawing, setIsAutoDrawing] = useState(false);
  const [autoUploadedSig, setAutoUploadedSig] = useState(null);

  const [autoData, setAutoData] = useState({
    vanzatorTip: 'PF', 
    vanzatorNume: '', vanzatorCnp: '', vanzatorCui: '', vanzatorRegCom: '', vanzatorSediu: '',
    cumparatorTip: 'PF', 
    cumparatorNume: '', cumparatorCnp: '', cumparatorCui: '', cumparatorRegCom: '', cumparatorSediu: '',
    autoVin: '', autoMarcaModel: '', autoNumarInmatriculare: '', autoPret: '', clientEmail: '',
    autoAdresaVanzator: '', autoAdresaCumparator: '', pretIncludeTVA: false, autoMoneda: 'RON',
    semnaturaBase64: null
  });

  // --- AUTOFILL ANAF PENTRU VÂNZĂTOR AUTO ---
  useEffect(() => {
    const delay = setTimeout(() => {
      if (autoData?.vanzatorTip === 'PJ' && autoData?.vanzatorCui?.replace(/[^0-9]/g, '').length >= 5) handleAutofillCui(autoData.vanzatorCui, 'vanzator_auto');
      else if (!autoData?.vanzatorCui) setAutoData(p => ({ ...p, vanzatorNume: '', vanzatorSediu: '', vanzatorRegCom: '' }));
    }, 800); return () => clearTimeout(delay);
  }, [autoData?.vanzatorCui, autoData?.vanzatorTip]);

  // --- AUTOFILL ANAF PENTRU CUMPĂRĂTOR AUTO ---
  useEffect(() => {
    const delay = setTimeout(() => {
      if (autoData?.cumparatorTip === 'PJ' && autoData?.cumparatorCui?.replace(/[^0-9]/g, '').length >= 5) handleAutofillCui(autoData.cumparatorCui, 'cumparator_auto');
      else if (!autoData?.cumparatorCui) setAutoData(p => ({ ...p, cumparatorNume: '', cumparatorSediu: '', cumparatorRegCom: '' }));
    }, 800); return () => clearTimeout(delay);
  }, [autoData?.cumparatorCui, autoData?.cumparatorTip]);

  const startCamera = async (type) => {
    setTargetDocType(type);
    setIsCameraActive(true);
    setAlignmentStatus('searching');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setTimeout(() => setAlignmentStatus('ready'), 2000);
    } catch (err) {
      alert('Nu s-a putut accesa camera. Verifică permisiunile.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && autoCanvasRef.current) {
      const video = videoRef.current;
      const canvas = autoCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        stopCamera();
        const file = new File([blob], `scan_${targetDocType}.jpg`, { type: 'image/jpeg' });
        const fakeEvent = { target: { files: [file] } };
        await handleAutoFileUpload(fakeEvent, targetDocType);
      }, 'image/jpeg');
    }
  };

  const getQrValue = () => {
    if (qrType === 'url') return qrUrl.trim();
    if (qrType === 'vcard') return qrData.nume ? `BEGIN:VCARD\nVERSION:3.0\nFN:${qrData.nume}\nTITLE:${qrData.functie}\nTEL:${qrData.telefon}\nEMAIL:${qrData.email}\nEND:VCARD` : '';
    if (qrType === 'wifi') return wifiData.ssid ? `WIFI:T:${wifiData.type};S:${wifiData.ssid};P:${wifiData.password};;` : '';
    if (qrType === 'whatsapp') return waData.phone ? `https://wa.me/${waData.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waData.message)}` : '';
    if (qrType === 'crypto') return cryptoData.address ? `${cryptoData.coin}:${cryptoData.address}${cryptoData.amount ? '?amount='+cryptoData.amount : ''}` : '';
    if (['dynamic', 'smart', 'geo', 'landing'].includes(qrType)) return generatedDynamicUrl;
    return '';
  };

  useEffect(() => {
    try {
      localStorage.removeItem('cs_step');
      localStorage.removeItem('cs_autoStep');
      localStorage.removeItem('cs_formData');
      localStorage.removeItem('cs_autoData');
    } catch (e) {
    } finally {
      setHydrated(true);
    }
  }, []);

  const handleDownloadQR = () => {
  const value = getQrValue();

  if (!value || value.trim() === "" || value === "WIFI:S:;T:WPA;P:;;; " || value === "bitcoin:?amount=&label=") {
    alert("Te rugăm să completezi datele înainte de descărcare!");
    return;
  }

  const canvas = document.getElementById('contract-qr-download');
  if (canvas) {
    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = 'ContractSmart-QR-HighRes.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 200);
    } catch (e) {
      alert("Codul QR s-a generat, dar browserul acestui telefon blochează descărcarea automată.");
    }
  } else {
    alert("Eroare: Codul QR nu a putut fi generat pentru descărcare.");
  }
};

  const calculeazaTaxeComplet = () => {
    const SALARIU_MINIM_2026 = 4050;
    const brutAnual = fiscal.venitLunar * 12;
    let impozitFirma = 0;
    let cas = 0;
    let cass = 0;
    let dividendTax = 0;

    if (fiscal.formaJuridica === 'SRL') {
      impozitFirma = brutAnual * 0.16;
      const profitRamas = Math.max(0, brutAnual - impozitFirma);
      dividendTax = profitRamas * 0.10;

      if (fiscal.areAngajati) {
        cas = brutAnual * 0.25;
        cass = brutAnual * 0.10;
      }
    } 
    else if (fiscal.formaJuridica === 'PFA_SISTEM_REAL') {
      if (brutAnual >= SALARIU_MINIM_2026 * 24) cas = SALARIU_MINIM_2026 * 24 * 0.25;
      else if (brutAnual >= SALARIU_MINIM_2026 * 12) cas = SALARIU_MINIM_2026 * 12 * 0.25;

      const bazzCass = Math.max(SALARIU_MINIM_2026 * 6, Math.min(brutAnual, SALARIU_MINIM_2026 * 60));
      cass = bazzCass * 0.10;
      impozitFirma = Math.max(0, (brutAnual - cas) * 0.10);
    } 
    else {
      const bazaCalcul = fiscal.normaRegiune;
      cas = bazaCalcul >= SALARIU_MINIM_2026 * 12 ? SALARIU_MINIM_2026 * 12 * 0.25 : 0;
      cass = bazaCalcul >= SALARIU_MINIM_2026 * 6 ? SALARIU_MINIM_2026 * 6 * 0.10 : SALARIU_MINIM_2026 * 6 * 0.10;
      impozitFirma = bazaCalcul * 0.10;
    }

    const totalTaxeAnuale = impozitFirma + cas + cass + dividendTax;
    const tvaLunar = fiscal.platitorTva ? fiscal.venitLunar * 0.21 : 0;

    return {
      taxeLunare: Math.round(totalTaxeAnuale / 12),
      netLunar: Math.round((brutAnual - totalTaxeAnuale) / 12),
      tvaLunar: Math.round(tvaLunar),
      defalcare: {
        impozit: Math.round(impozitFirma / 12),
        dividende: Math.round(dividendTax / 12),
        sociale: Math.round((cas + cass) / 12)
      }
    };
  };

  const rezultateFiscale = calculeazaTaxeComplet();

  useEffect(() => {
    const handlePopState = () => {
      if (step > 1) {
        setStep(1);
        setAutoStep('upload');
      }
    };

    const handlePageShow = (e) => {
      if (e.persisted) {
        setLoadingText(null);
        isProcessingForm.current = false;
        setCuiSearch('');
        setCuiDataResult(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [step]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollPercent(window.scrollY / totalHeight);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const pornesteDesenul = (e) => {
    if (signatureTab !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const deseneaza = (e) => {
    if (!isDrawing || signatureTab !== 'draw') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const opresteDesenul = () => setIsDrawing(false);

  const curataCanvas = () => {
    if (signatureTab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      setUploadedSignature(null);
    }
  };

  const handleIncarcareSemnatura = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedSignature(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const pornesteDesenulAuto = (e) => {
    if (autoSignatureTab !== 'draw') return;
    const canvas = autoSigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsAutoDrawing(true);
  };
  const deseneazaAuto = (e) => {
    if (!isAutoDrawing || autoSignatureTab !== 'draw') return;
    const canvas = autoSigCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };
  const opresteDesenulAuto = () => setIsAutoDrawing(false);
  const curataCanvasAuto = () => {
    if (autoSignatureTab === 'draw') {
      const canvas = autoSigCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      setAutoUploadedSig(null);
    }
  };
  const handleIncarcareSemnaturaAuto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setAutoUploadedSig(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleInapoiPrincipal = () => {
    setStep(1);
    setAutoStep('upload');
    setFormData({ tipContract: 'prestari', initiatorRol: 'prestator', prestatorNume: '', prestatorCui: '', prestatorEmail: '', prestatorLogo: '', prestatorCuloare: '#8ba888', clientNume: '', clientCui: '', clientEmail: '', obiect: '', valoare: '', moneda: 'RON', emiteFacturaAvans: false, estePlatitorTVA: false, clauzaPi: true, clauzaPenalitati: true, clauzaRevizii: false, tarifOrar: '150', clauzaRawFoto: false, clauzaMarketingTerti: false, clauzaAprobareTacita: false, clauzaTaxaAnulare: false, clauzaSplitPayment: false, clauzaRetentie: false, clauzaLimitareRaspundere: false, clauzaInflatie: false, adaugaProcesVerbal: false, constructiiMateriale: '', constructiiManopera: '', constructiiSuprafata: '', constructiiPretMp: '', adaugaQrPlata: false, ibanPlata: '', clauzaCustom: '' });
    curataCanvas();
    curataCanvasAuto();
    setAutoData({ vanzatorTip: 'PF', vanzatorNume: '', vanzatorCnp: '', vanzatorCui: '', vanzatorRegCom: '', vanzatorSediu: '', cumparatorTip: 'PF', cumparatorNume: '', cumparatorCnp: '', cumparatorCui: '', cumparatorRegCom: '', cumparatorSediu: '', autoVin: '', autoMarcaModel: '', autoNumarInmatriculare: '', autoPret: '', clientEmail: '', autoAdresaVanzator: '', autoAdresaCumparator: '', pretIncludeTVA: false, autoMoneda: 'RON', semnaturaBase64: null });
    setAutoDocs({ civ: null, buletin_vanzator: null, buletin_cumparator: null, talon: null });
  };

  useEffect(() => {
    const fetchUserProfile = async (userId, email) => {
      try {
        const { data: profile } = await supabase.from('profiles').select('subscription_tier, credits_remaining, has_qr_branding, has_qr_vcard, has_qr_dynamic, has_qr_pdf, is_pro, is_enterprise, pro_reports_used').eq('id', userId).single();
        setUser({ 
          id: userId, 
          email: email, 
          status: profile?.subscription_tier || 'free', 
          credits: profile?.credits_remaining ?? 0,
          proReportsUsed: profile?.pro_reports_used || 0
        });
        setProfil(profile);
        setUserTier(profile?.subscription_tier || 'free');
      } catch (err) {
        setUser({ id: userId, email: email, status: 'free', credits: 0 });
        setProfil({ subscription_tier: 'free', has_qr_branding: false, has_qr_vcard: false, has_qr_dynamic: false, has_qr_pdf: false, is_pro: false});
        setUserTier('free');
      }
    };

    const restaureazaSesiunea = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user.id, session.user.email);
        }
      } catch (e) { }
    };

    restaureazaSesiunea();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setProfil({ subscription_tier: 'free', has_qr_branding: false, has_qr_vcard: false, has_qr_dynamic: false, has_qr_pdf: false, is_pro: false});
        setUserTier('free');
      }
    });

    return () => subscription?.unsubscribe?.();
  }, []);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/EUR')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          setCursBnr({
            eur: data.rates.RON ? data.rates.RON.toFixed(4) : '4.9752',
            usd: (data.rates.RON / data.rates.USD) ? (data.rates.RON / data.rates.USD).toFixed(4) : '4.5820'
          });
        }
      }).catch(() => {});

    const incarcaStiriSecurizat = async () => {
      try {
        const res = await fetch('/api/stiri');
        const data = await res.json();
        if (data?.success) setStiriLive(data.stiri);
      } catch (e) {}
    };
    incarcaStiriSecurizat();
  }, []);

  const handleCumparaPremium = async (tipProdus = 'founder') => {
    if (isProcessingForm.current) return;

    if (!user) {
      alert('Trebuie să fii autentificat pentru a putea plasa comenzi și a atașa produsele contului tău.');
      setIsSignUp(false);
      setAuthEmail('');
      setAuthPassword('');
      setAuthConfirmPassword('');
      setShowAuthModal(true);
      return;
    }

    isProcessingForm.current = true;
    setLoadingText({ title: "SE INIȚIAZĂ PLATA...", desc: "Redirecționare către procesatorul securizat Gumroad." });

    setTimeout(() => {
      const destinatie = gumroadLinks[tipProdus];
      if (destinatie) {
        const urlObj = new URL(destinatie);
        urlObj.searchParams.set('user_id', user.id); 
        window.location.href = urlObj.toString();
      } else {
        alert("Eroare: Produsul nu a fost găsit în catalog.");
        setLoadingText(null);
      }
      isProcessingForm.current = false;
    }, 1200);
  };

  const handleCheckout = (tipProdus) => {
    handleCumparaPremium(tipProdus);
  };

  const handleGenerateDynamicQr = async () => {
    if (!user) return alert('Trebuie să fii autentificat pentru a salva linkurile în baza de date.');
    if (isProcessingForm.current) return;

    isProcessingForm.current = true;
    setIsGeneratingShortlink(true);

    const payload = {
      userId: user.id,
      type: qrType,
      url: (qrType === 'dynamic' && uploadedPdfUrl) ? uploadedPdfUrl : dynamicDestUrl,
      ios_url: iosUrl,
      android_url: androidUrl,
      geo_rules: geoRules,
      landing_data: landingData,
      captchaToken 
    };

    if (qrType === 'dynamic' && !dynamicDestUrl && !uploadedPdfUrl) {
      setIsGeneratingShortlink(false); isProcessingForm.current = false; return alert('Introdu o adresă de destinație sau încarcă un PDF.');
    }
    if (qrType === 'smart' && (!iosUrl || !androidUrl)) {
      setIsGeneratingShortlink(false); isProcessingForm.current = false; return alert('Sunt necesare ambele link-uri pentru App Store și Google Play.');
    }

    try {
      const res = await fetch('/api/qr/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedDynamicUrl(data.shortUrl);
        alert('Codul Mega-QR a fost generat, securizat și salvat cu succes!');
      } else {
        alert('Eroare la generarea link-ului.');
      }
    } catch {
      alert('Eroare conexiune.');
    } finally {
      setIsGeneratingShortlink(false);
      isProcessingForm.current = false;
    }
  };

  const fetchStats = async () => {
    if (!user) return alert('Te rog autentifică-te.');
    try {
      const res = await fetch(`/api/qr/stats?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setQrStats(data.stats);
        setShowStatsModal(true);
      } else {
        alert('Eroare la preluarea statisticilor.');
      }
    } catch (e) {
      alert('Eroare rețea la încărcarea statisticilor.');
    }
  };

  const handleLansareContract = async (e) => {
    e.preventDefault();
    if (isProcessingForm.current) return;
    if (!acordGdpr) {
      alert('Pentru a continua, trebuie să fii de acord cu prelucrarea tranzitorie a datelor (GDPR).');
      return;
    }

    if (!user) {
      alert('Pentru a descărca documentul direct în format binar, creează un cont rapid în 10 secunde.');
      setIsSignUp(false);
      setAuthEmail('');
      setAuthPassword('');
      setAuthConfirmPassword('');
      setShowAuthModal(true);
      return;
    }

    if (!captchaToken && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      alert("Vă rugăm așteptați validarea anti-spam (Cloudflare).");
      return;
    }

    isProcessingForm.current = true;
    setLoadingText({ title: "SECURIZARE CONTRACT...", desc: "Redactăm articolele din Codul Civil și pregătim PDF-ul." });

    let imagineSemnaturaText = '';
    if (signatureTab === 'draw' && canvasRef.current) {
      imagineSemnaturaText = canvasRef.current.toDataURL('image/png');
    } else if (signatureTab === 'upload' && uploadedSignature) {
      imagineSemnaturaText = uploadedSignature;
    }

    try {
      const res = await fetch('/api/generate-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, prestatorEmail: user.email, semnăturaBase64: imagineSemnaturaText, userId: user.id, captchaToken })
      });

      if (res.ok) {
        const blob = await res.blob();
        const urlDownload = window.URL.createObjectURL(blob);
        const elementA = document.createElement('a');
        elementA.href = urlDownload;
        elementA.download = `contract_${formData.tipContract}_securizat.pdf`;
        document.body.appendChild(elementA);
        elementA.click();
        document.body.removeChild(elementA);
        window.URL.revokeObjectURL(urlDownload);
        alert('Succes! Contractul a fost generat dinamic și descărcat automat în format PDF.');
        handleInapoiPrincipal();
      } else {
        const textEroare = await res.json();
        if (textEroare.needsPayment) {
          setShowPaymentModal(true);
        } else {
          alert(textEroare.message || 'Eroare la procesarea backend a contractului.');
        }
      }
    } catch {
      alert('Eroare de comunicare rețea cu serverele de producție.');
    } finally {
      isProcessingForm.current = false;
      setLoadingText(null);
    }
  };

  const handleAutoFileUpload = async (e, tipDoc) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    
    setIsScanning(tipDoc); // Pornește rotița fix pe actul încărcat

    try {
      // 1. Comprimare instantă (sau ignoră dacă e PDF)
      const compressedFile = await compressImage(file);

      // 2. Pregătim pachetul pentru AI
      const localFormData = new FormData();
      localFormData.append('file', compressedFile);
      localFormData.append('tipDocument', tipDoc);
      localFormData.append('context', 'auto'); // Îi spunem AI-ului din route.js că e auto

      const res = await fetch('/api/auto/upload-ocr', { method: 'POST', body: localFormData });
      const data = await res.json();

      if (data.success && data.extractedData) {
        // Punem bifă verde pe documentul scanat în UI
        setAutoDocs(prev => ({ ...prev, [tipDoc]: true }));

        let dateFinale = data.extractedData;

        // 3. MACAZUL: Turnăm datele exact unde trebuie
        setAutoData(prev => {
          let updated = { ...prev };
          
          // A. Datele mașinii se completează oricând găsește ceva despre ele (pe talon sau civ)
          updated.autoVin = dateFinale.autoVin || prev.autoVin;
          updated.autoMarcaModel = dateFinale.autoMarcaModel || prev.autoMarcaModel;
          updated.autoNumarInmatriculare = dateFinale.autoNumarInmatriculare || prev.autoNumarInmatriculare;

          // B. Macaz Buletin CUMPĂRĂTOR
          if (tipDoc === 'buletin_cumparator') {
            updated.cumparatorNume = dateFinale.numePersoana || prev.cumparatorNume;
            updated.cumparatorCnp = dateFinale.cnpPersoana || prev.cumparatorCnp;
            updated.autoAdresaCumparator = dateFinale.adresaPersoana || prev.autoAdresaCumparator;
          } 
          // C. Macaz Buletin VÂNZĂTOR
          else if (tipDoc === 'buletin_vanzator') {
            updated.vanzatorNume = dateFinale.numePersoana || prev.vanzatorNume;
            updated.vanzatorCnp = dateFinale.cnpPersoana || prev.vanzatorCnp;
            updated.autoAdresaVanzator = dateFinale.adresaPersoana || prev.autoAdresaVanzator;
          }

          return updated;
        });
      } else {
        alert('Datele nu au putut fi extrase. Încearcă o poză mai clară.');
      }
    } catch (err) {
      alert('Eroare tehnică la citirea documentului.');
    } finally {
      setIsScanning(null); // Oprește rotița
      if (e.target) e.target.value = ''; // Resetează input-ul
    }
  };

  const handleEliminaDocument = (type) => {
    setAutoDocs(prev => ({ ...prev, [type]: null }));
    const elementInput = document.getElementById(`file-input-${type}`);
    if (elementInput) elementInput.value = '';

    setAutoData(prev => {
      let updated = { ...prev };
      if (type === 'civ' || type === 'talon') {
        updated.autoVin = ''; updated.autoMarcaModel = ''; updated.autoNumarInmatriculare = '';
      } else if (type === 'buletin_cumparator') {
        updated.cumparatorNume = ''; updated.cumparatorCnp = ''; updated.autoAdresaCumparator = '';
      } else {
        updated.vanzatorNume = ''; updated.vanzatorCnp = ''; updated.autoAdresaVanzator = '';
      }
      return updated;
    });
  };

  const handleGenereazaPachetAuto = async (e) => {
    e.preventDefault();
    if (isProcessingForm.current) return;
    if (!acordGdpr) {
      alert('Pentru a continua, trebuie să fii de acord cu prelucrarea tranzitorie a datelor (GDPR).');
      return;
    }

    if (!user) {
      alert('Creează un cont rapid pentru a securiza și descărca documentele auto.');
      setIsSignUp(false);
      setAuthEmail('');
      setAuthPassword('');
      setAuthConfirmPassword('');
      setShowAuthModal(true);
      return;
    }

    if (!captchaToken && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      alert("Vă rugăm așteptați validarea anti-spam (Cloudflare).");
      return;
    }

    isProcessingForm.current = true;
    setLoadingText({ title: "COMPILARE DOSAR AUTO...", desc: "Generăm cele 5 exemplare DITL și fișa de înmatriculare." });

    let imagineSemnaturaText = '';
    if (autoSignatureTab === 'draw' && autoSigCanvasRef.current) {
      imagineSemnaturaText = autoSigCanvasRef.current.toDataURL('image/png');
    } else if (autoSignatureTab === 'upload' && autoUploadedSig) {
      imagineSemnaturaText = autoUploadedSig;
    }

    try {
      const binarFormData = new FormData();
      const secureAutoDataPayload = {
        ...autoData,
        clientEmail: user.email,
        userId: user.id, 
        pretIncludeTVA: autoData.pretIncludeTVA,
        semnaturaBase64: imagineSemnaturaText,
        captchaToken
      };

      binarFormData.append('autoDataJson', JSON.stringify(secureAutoDataPayload));

      const inputCiv = document.getElementById('file-input-civ')?.files[0];
      const inputTalon = document.getElementById('file-input-talon')?.files[0];
      const inputBv = document.getElementById('file-input-buletin_vanzator')?.files[0];
      const inputBc = document.getElementById('file-input-buletin_cumparator')?.files[0];

      if (inputCiv) binarFormData.append('civ', inputCiv);
      if (inputTalon) binarFormData.append('talon', inputTalon);
      if (inputBv) binarFormData.append('buletin_vanzator', inputBv);
      if (inputBc) binarFormData.append('buletin_cumparator', inputBc);

      const res = await fetch('/api/auto/generate-all', {
        method: 'POST',
        body: binarFormData
      });

      if (res.ok) {
        const blob = await res.blob();
        const urlDownload = window.URL.createObjectURL(blob);
        const elementA = document.createElement('a');
        elementA.href = urlDownload;
        elementA.download = `pachet_auto_${autoData.autoVin || 'securizat'}.zip`;
        document.body.appendChild(elementA);
        elementA.click();
        document.body.removeChild(elementA);
        window.URL.revokeObjectURL(urlDownload);
        setAutoStep('success');
        setAutoData({ vanzatorTip: 'PF', vanzatorNume: '', vanzatorCnp: '', vanzatorCui: '', vanzatorRegCom: '', vanzatorSediu: '', cumparatorTip: 'PF', cumparatorNume: '', cumparatorCnp: '', cumparatorCui: '', cumparatorRegCom: '', cumparatorSediu: '', autoVin: '', autoMarcaModel: '', autoNumarInmatriculare: '', autoPret: '', clientEmail: '', autoAdresaVanzator: '', autoAdresaCumparator: '', pretIncludeTVA: false, autoMoneda: 'RON', semnaturaBase64: null });
        setAutoDocs({ civ: null, buletin_vanzator: null, buletin_cumparator: null, talon: null });
        curataCanvasAuto();
      } else {
        const textEroare = await res.json();
        if (textEroare.needsPayment) {
          handleCumparaPremium('contract_auto');
        } else {
          alert(textEroare.message || 'Eroare la generarea arhivei din backend.');
        }
      }
    } catch {
      alert('Eroare de rețea la descărcarea pachetului auto.');
    } finally {
      isProcessingForm.current = false;
      setLoadingText(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserTier('free');
    setWidgetCompany(null);
    window.location.reload();
  };

  const stergeCont = async () => {
    if (!confirm("Ești sigur? Acțiunea este ireversibilă și pierzi toate contractele și creditele.")) return;
    try {
      const res = await fetch(`/api/user/manage?userId=${user.id}&email=${user.email}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await supabase.auth.signOut();
        setUser(null);
        setWidgetCompany(null);
        alert("Contul tău a fost șters.");
      } else {
        alert(data.message);
      }
    } catch {
      alert("Eroare de rețea la ștergerea contului.");
    }
  };

  const handleResetareParola = async () => {
    if (!authEmail) {
      alert("Te rog să introduci adresa de email în câmpul de mai sus pentru a primi link-ul de resetare.");
      return;
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
        redirectTo: window.location.origin, 
      });
      
      if (error) throw error;
      alert("Dacă adresa de email există în sistem, vei primi un link. Verifică și folderul Spam!");
    } catch (error) {
      alert("Eroare la resetarea parolei: " + error.message);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (isProcessingForm.current) return;

    if (!authEmail || !authPassword) return alert('Introdu datele complete.');
    if (isSignUp && authPassword !== authConfirmPassword) {
      return alert('Eroare: Parolele introduse nu coincid!');
    }

    isProcessingForm.current = true;
    setLoadingText({ title: "AUTENTIFICARE", desc: "Se securizează token-urile de sesiune." }); 
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
        if (error) {
           if (error.message.includes("Password should be at least 6 characters")) {
               throw new Error("Parola trebuie să aibă minim 6 caractere.");
           } else if (error.message.includes("User already registered")) {
               throw new Error("Acest e-mail este deja înregistrat. Te rugăm să te autentifici.");
           } else {
               throw new Error(error.message);
           }
        }

        alert("Cont creat cu succes! Te poți autentifica acum.");
        setIsSignUp(false);
        setAuthPassword('');
        setAuthConfirmPassword('');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) {
            if (error.message.includes("Invalid login credentials")) {
                throw new Error("E-mailul sau parola sunt incorecte.");
            } else {
                throw new Error(error.message);
            }
        }

        alert("Autentificare realizată cu succes!");
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPassword('');
        setAuthConfirmPassword('');
      }
    } catch (err) {
      alert(err.message || "Eroare la autentificare. Verificați datele introduse.");
    } finally {
      isProcessingForm.current = false;
      setLoadingText(null);
    }
  };

  // FUNCȚIE REUTILIZABILĂ PENTRU PREȚURI (Redesign Compact - 4 Coloane)
  const renderCarduriPreturi = () => (
    <div id="sectiune-preturi" className="max-w-6xl mx-auto px-4 mt-20 mb-20 scroll-mt-20">
      
      {/* Antet Centrat */}
      <div className="text-center border-b border-slate-800/80 pb-8 mb-10">
        <span className="text-[#8ba888] text-[10px] font-black uppercase tracking-widest block mb-2">Ecosistem ContractSmart</span>
        <h2 className="text-3xl font-black text-white tracking-tight">Planuri de Business & Tranzacții</h2>
      </div>

      {/* Grid Centrat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
        
        {/* Onetime Contract B2B */}
        <div className="bg-[#12181D]/60 border border-slate-800/80 hover:border-slate-600 rounded-xl p-4 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex justify-center items-center mb-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800/50 px-2 py-0.5 rounded">Plată Unică</span>
            </div>
            <h4 className="text-sm font-bold text-white">1x Contract B2B</h4>
            <div className="text-xl font-black text-[#8ba888] mt-1 mb-2">19 RON <span className="text-[9px] text-slate-500 font-normal">(~3.99 €)</span></div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Plătești strict pentru documentul generat. Ideal pentru nevoi punctuale.</p>
          </div>
          <button type="button" onClick={() => handleCumparaPremium('one_time_contract')} className="w-full bg-[#0B0F12] border border-slate-700 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm">Cumpără 3.99 €</button>
        </div>

        {/* Onetime Auto */}
        <div className="bg-[#12181D]/60 border border-slate-800/80 hover:border-blue-500/50 rounded-xl p-4 flex flex-col justify-between transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div>
            <div className="flex justify-center items-center mb-3">
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider bg-blue-900/20 border border-blue-500/20 px-2 py-0.5 rounded">Pachet Auto</span>
            </div>
            <h4 className="text-sm font-bold text-white">Vânzare Auto</h4>
            <div className="text-xl font-black text-white mt-1 mb-2">99 RON <span className="text-[9px] text-slate-500 font-normal">(~19.99 €)</span></div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">5 exemplare DITL, PV + ghid complet automatizat post-vânzare.</p>
          </div>
          <button type="button" onClick={() => handleCumparaPremium('contract_auto')} className="w-full bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600 hover:text-white text-blue-400 font-bold py-2 rounded-lg text-xs transition-colors shadow-sm">Cumpără 19.99 €</button>
        </div>

        {/* PRO */}
        <div className="bg-[#12181D] border border-[#8ba888]/40 hover:border-[#8ba888] rounded-xl p-4 flex flex-col justify-between transition-colors relative shadow-[0_0_15px_rgba(139,168,136,0.05)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#8ba888] to-transparent"></div>
          <div>
            <div className="flex justify-center items-center mb-3">
              <span className="text-[9px] font-bold text-[#0B0F12] uppercase tracking-wider bg-[#8ba888] px-2 py-0.5 rounded">Popular</span>
            </div>
            <h4 className="text-sm font-bold text-white">Abonament PRO</h4>
            <div className="text-xl font-black text-white mt-1 mb-2">99 RON <span className="text-[9px] text-slate-500 font-normal">/lună (~19.99 €)</span></div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Contracte B2B nelimitate + Mega-QR Studio (Smart, Geo, Landing).</p>
          </div>
          <button type="button" onClick={() => handleCumparaPremium('pro')} className="w-full bg-[#8ba888] text-[#0B0F12] hover:opacity-90 font-black py-2 rounded-lg text-xs transition-opacity shadow-sm">Abonează-te</button>
        </div>

        {/* FOUNDER LIFETIME */}
        <div className="bg-gradient-to-b from-[#16221A] to-[#0B0F12] border border-amber-500/30 hover:border-amber-500/60 rounded-xl p-4 flex flex-col justify-between transition-colors relative overflow-hidden group shadow-lg">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-500/10 blur-2xl rounded-full group-hover:bg-amber-500/20 transition-colors"></div>
          <div className="relative z-10">
            <div className="flex justify-center items-center mb-3">
              <span className="text-[9px] font-black text-amber-900 uppercase tracking-wider bg-gradient-to-r from-amber-200 to-yellow-500 px-2 py-0.5 rounded shadow-sm">VIP Lifetime</span>
            </div>
            <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">Membru Fondator</h4>
            <div className="text-xl font-black text-white mt-1 mb-2">999 RON <span className="text-[9px] text-slate-500 font-normal">(~199.99 €)</span></div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Plătești o singură dată. Acces nelimitat pe viață la absolut toate funcțiile.</p>
          </div>
          <button type="button" onClick={() => handleCumparaPremium('founder')} className="relative z-10 w-full bg-gradient-to-r from-amber-200 to-yellow-500 text-black hover:opacity-90 font-black py-2 rounded-lg text-xs transition-opacity shadow-md">Devino Fondator</button>
        </div>

      </div>
    </div>
  );

  if (!hydrated) {
    return <div className="min-h-screen bg-[#0B0F12]" />;
  }

  return (
    <div 
      className="min-h-screen bg-[#0B0F12] text-slate-200 font-sans pb-16 relative overflow-clip"
      style={{
        '--scroll-y': `${scrollPercent * 100}%`,
        '--scroll-y-reverse': `${(1 - scrollPercent) * 100}%`
      }}
    >

      <Navbar 
  user={user} 
  isPremium={isPremium} 
  handleLogout={handleLogout} 
  stergeCont={stergeCont} 
  setShowAuthModal={setShowAuthModal} 
  setIsSignUp={setIsSignUp}
  handleInapoiPrincipal={handleInapoiPrincipal}
/>

      {/* PREMIUM CINEMATIC LIGHT LEAKS (FROSTED AURORA) - SAFARI OPTIMIZED */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute -top-[20%] -left-[10%] w-[100vw] h-[100vw] min-w-[600px] min-h-[600px] rounded-full animate-glow-1"
          style={{
            background: 'radial-gradient(circle, rgba(139, 168, 136, 0.12) 0%, rgba(11, 15, 18, 0) 65%)'
          }}
        />
        <div 
          className="absolute -bottom-[20%] -right-[10%] w-[100vw] h-[100vw] min-w-[600px] min-h-[600px] rounded-full animate-glow-2"
          style={{
            background: 'radial-gradient(circle, rgba(100, 116, 139, 0.10) 0%, rgba(11, 15, 18, 0) 65%)'
          }}
        />
      </div>

      <div className="relative z-10">

        {/* OVERLAY ELEGANT DE LOADING DINAMIC */}
        {loadingText && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0F12]/80 backdrop-blur-md animate-fadeIn">
            <div className="flex flex-col items-center bg-[#12181D] p-8 rounded-2xl border border-slate-800 shadow-2xl">
              <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-t-[#8ba888] border-b-[#8ba888]/20 border-r-transparent border-l-transparent animate-spin"></div>
                <div className="absolute w-10 h-10 rounded-full border-4 border-l-[#8ba888]/80 border-r-[#8ba888]/20 border-t-transparent border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
                <span className="text-xl">🔒</span>
              </div>
              <h3 className="text-sm font-black text-white tracking-widest uppercase mb-2">{loadingText.title}</h3>
              <p className="text-xs text-slate-400 text-center max-w-[250px]">{loadingText.desc}</p>
            </div>
          </div>
        )}

        {/* MODAL AUTH */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#12181D] border border-slate-800 p-8 rounded-xl max-w-sm w-full shadow-lg relative">
              <button type="button" onClick={() => { setShowAuthModal(false); setIsSignUp(false); setAuthPassword(''); setAuthConfirmPassword(''); }} className="absolute top-4 right-4 text-slate-500 hover:text-white text-md font-bold transition">✕</button>
              <h3 className="text-xl font-black text-white mb-1">{isSignUp ? 'Creează un Cont Nou' : 'AUTENTIFICARE'}</h3>

             <form onSubmit={handleAuthSubmit} className="space-y-4">
  <div>
    <label htmlFor="authEmail" className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Adresă de Email</label>
    <input id="authEmail" name="email" type="email" required placeholder="nume@companie.ro" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full p-3 bg-[#0B0F12] border border-slate-700 rounded-md text-xs text-white outline-none focus:border-[#8ba888]" />
  </div>
  
  <div>
    <label htmlFor="authPassword" className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Parolă Validă</label>
    <input id="authPassword" name="password" type="password" required placeholder="••••••••" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full p-3 bg-[#0B0F12] border border-slate-700 rounded-md text-xs text-white outline-none focus:border-[#8ba888]" />
  </div>

  {!isSignUp && (
    <div className="flex justify-end w-full mt-1 mb-2">
      <button 
        type="button" 
        onClick={handleResetareParola} 
        className="text-[10px] text-slate-400 hover:text-[#8ba888] hover:underline transition-colors font-bold uppercase tracking-wider"
      >
        Ai uitat parola?
      </button>
    </div>
  )}

  {isSignUp && (
    <div>
      <label htmlFor="authConfirmPassword" className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Confirmă Parola</label>
      <input id="authConfirmPassword" name="confirmPassword" type="password" required placeholder="••••••••" value={authConfirmPassword} onChange={e => setAuthConfirmPassword(e.target.value)} className="w-full p-3 bg-[#0B0F12] border border-slate-700 rounded-md text-xs text-white outline-none focus:border-[#8ba888]" />
    </div>
  )}
  
  <button type="submit" disabled={!!loadingText} className="w-full bg-[#8ba888] text-[#0B0F12] font-black py-3 rounded-md text-xs tracking-tight transition hover:opacity-90 mt-2">
    {loadingText ? 'Se procesează...' : isSignUp ? 'Confirmă Înregistrarea' : 'Conectare Securizată'}
  </button>
</form>
              <div className="text-center mt-5 pt-4 border-t border-slate-800/80">
                <button type="button" onClick={() => { setIsSignUp(!isSignUp); setAuthPassword(''); setAuthConfirmPassword(''); }} className="text-xs text-slate-400 hover:text-white underline">{isSignUp ? 'Ai deja cont? Conectează-te' : 'Nu ai cont? Creează unul acum'}</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PLĂȚI */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#12181D] border border-slate-800 p-8 rounded-xl max-w-md w-full shadow-lg relative text-center">
              <button type="button" onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white text-md font-bold transition">✕</button>
              <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🔒</div>
              <h3 className="text-xl font-black text-white mb-2">Plafon Gratuit Atins</h3>
              <p className="text-sm text-slate-400 mb-6">Ai utilizat generarea gratuită din această lună. Deblochează documentul actual sau treci la Premium pentru generări nelimitate.</p>

              <div className="space-y-3">
                <button onClick={() => { setShowPaymentModal(false); handleCumparaPremium('one_time_contract'); }} className="w-full bg-[#0B0F12] hover:bg-slate-900 border border-slate-700 text-white font-bold py-3 rounded-md text-sm transition flex justify-between items-center px-4">
                  <span>Cumpără 1 Contract Acum</span>
                  <span className="text-[#8ba888]">19 RON (~3.99 €)</span>
                </button>
                <button onClick={() => { setShowPaymentModal(false); handleCumparaPremium('pro'); }} className="w-full bg-[#8ba888] text-[#0B0F12] font-black py-3 rounded-md text-sm transition hover:opacity-90 flex justify-between items-center px-4 shadow-md shadow-[#8ba888]/10">
                  <span>Abonament Pro (Nelimitat)</span>
                  <span>99 RON (~19.99 €)</span>
                </button>
              </div>
              <button onClick={() => { setShowPaymentModal(false); const el = document.getElementById('sectiune-preturi'); el?.scrollIntoView({ behavior: 'smooth' }); }} className="text-xs text-slate-500 hover:text-white mt-5 underline">Vezi toate beneficiile planurilor</button>
            </div>
          </div>
        )}

        {/* MODAL STATISTICI QR */}
        {showStatsModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#12181D] border border-slate-800 p-8 rounded-xl max-w-2xl w-full shadow-lg relative">
              <button type="button" onClick={() => { setShowStatsModal(false); setEditingQrId(null); }} className="absolute top-4 right-4 text-slate-500 hover:text-white text-md font-bold transition">✕</button>
              <h3 className="text-xl font-black text-white mb-2">Panou Analiză și Gestiune QR</h3>
              <p className="text-xs text-slate-400 mb-6">Modifică destinația codurilor tipărite în timp real sau urmărește conversiile.</p>

              <div className="bg-[#0B0F12] rounded-md border border-slate-800 overflow-hidden">
                <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                  {qrStats.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">Nu ai coduri dinamice generate încă.</p>
                  ) : (
                    qrStats.map((stat, i) => (
                      <div key={i} className="bg-[#16221A] p-4 rounded text-xs border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1 w-full">
                          {editingQrId === stat.id ? (
                            <div className="flex gap-2 w-full mb-2">
                              <input type="text" value={editQrUrl} onChange={(e) => setEditQrUrl(e.target.value)} placeholder="Noua destinație (https://...)" className="flex-1 bg-[#0B0F12] border border-slate-700 rounded p-1.5 text-xs text-white outline-none focus:border-[#8ba888]" />
                              <button onClick={() => handleEditQr(stat.id)} className="bg-[#8ba888] text-black px-3 py-1.5 rounded text-xs font-bold hover:opacity-90">Salvează</button>
                              <button onClick={() => setEditingQrId(null)} className="text-slate-400 px-2 text-xs hover:text-white">Anulează</button>
                            </div>
                          ) : (
                            <p className="text-sm text-white font-mono mb-1 truncate max-w-[280px]" title={stat.url}>{stat.url}</p>
                          )}
                          <p className="text-[10px] text-slate-500">ID Cod: <strong className="text-slate-300">{stat.id}</strong> | Ultimul scan: {stat.lastScan ? new Date(stat.lastScan).toLocaleString('ro-RO') : 'Niciodată'}</p>
                        </div>

                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 border-slate-800 pt-3 sm:pt-0">
                          <div className="flex gap-3">
                            <button onClick={() => { setEditingQrId(stat.id); setEditQrUrl(stat.url); }} className="text-[10px] text-[#8ba888] hover:underline uppercase font-bold">Editează</button>
                            <button onClick={() => handleDeleteQr(stat.id)} className="text-[10px] text-red-400 hover:underline uppercase font-bold">Șterge</button>
                          </div>
                          <div className="text-right">
                            <span className="block text-xl font-black text-purple-400">{stat.totalScans}</span>
                            <span className="text-[10px] uppercase text-slate-500 font-bold">Scanări</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}


        {/* =========================================================================
                                    STEP 1: DASHBOARD / HOME 
            ========================================================================= */}
        {step === 1 && (
          <div className="w-full animate-fadeIn">
            <div className="max-w-3xl mx-auto py-12 px-4 text-center">
              
              {/* TEXT ELEGANT ÎN DOUĂ CULORI */}
              <div className="mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tighter mb-5">
                  Contracte <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ba888] to-emerald-400">Inteligente</span>
                </h1>
                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tighter mb-5">
                  Prin Management <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ba888] to-emerald-400">De Clauze</span>
                </h1>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto px-4">
                <button type="button" onClick={() => { setFormData(prev => ({ ...prev, tipContract: 'prestari' })); setStep(2); }} className="bg-[#8ba888] text-[#0B0F12] font-black px-6 py-6 rounded-xl shadow-[0_0_20px_rgba(139,168,136,0.15)] transition-all hover:scale-105 text-sm uppercase tracking-wide flex items-center justify-center gap-2">
                    Generator Contracte B2B / Servicii
                </button>
                <button type="button" onClick={() => { setFormData(prev => ({ ...prev, tipContract: 'auto' })); setStep(2); }} className="bg-[#12181D] border-2 border-slate-700 text-white font-bold px-6 py-6 rounded-xl hover:border-[#8ba888]/80 transition-all hover:scale-105 text-sm uppercase tracking-wide flex items-center justify-center gap-2">
                    Generator Pachet Acte Auto
                </button>
              </div>
            </div>

            {/* BRIDGE SELLING / VALUE PROPOSITION */}
            <div className="max-w-3xl mx-auto px-6 mt-10 mb-8 text-center animate-fadeIn">
              <div className="inline-flex items-center justify-center gap-2 bg-[#8ba888]/10 border border-[#8ba888]/20 px-4 py-1.5 rounded-full mb-5">
                <span className="w-2 h-2 rounded-full bg-[#8ba888] animate-pulse"></span>
                <span className="text-[10px] uppercase font-black text-[#8ba888] tracking-widest">Protecție Completă</span>
              </div>
                <h2 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tighter mb-5">
                  Generezi ocazional sau vrei <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ba888] to-emerald-400">siguranță pe termen lung?</span>
                </h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
                Testează platforma gratuit pentru nevoi urgente, dar nu lăsa birocrația viitoare la voia întâmplării. 
                Treci la un plan Premium și deblochează contracte nelimitate, verificări ANAF și ecosistemul complet de încasări rapide prin QR Studio.
              </p>
            </div>

            {/* ADAUGAM PREȚURILE AICI ÎN PASUL 1 */}
            {renderCarduriPreturi()}

            {/* QR CODE STUDIO */}
          <div className="max-w-7xl mx-auto px-6 mt-16 pt-12 mb-8 text-center border-t border-slate-800">
            <span className="text-[#8ba888] text-xs font-black uppercase tracking-widest block mb-1">Ecosistem Digital Dinamic</span>
            <h2 className="text-3xl font-black text-white tracking-tight">ContractSmart QR ProStudio</h2>
            <p className="text-xs text-slate-400 mt-2">Generator multifuncțional avansat.</p>
          </div>

          <div className="max-w-5xl mx-auto px-6 mt-6">              
            <div className="bg-[#12181D] rounded-2xl border border-slate-800/80 shadow-xl flex flex-col">
              {/* Header & Tabs */}
              <div className="p-6 border-b border-slate-800/80 bg-[#0B0F12]/30 rounded-t-2xl text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                  <span className="text-2xl"></span>
                  <div className="text-center sm:text-left">
                    <h3 className="text-sm font-bold text-[#8ba888] uppercase tracking-wider block">ContractSmart QR ProStudio</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Generator multifuncțional avansat.</p>
                  </div>
                </div>
                {/* Butoanele de tip (URL, Wi-Fi, etc.) centrate pe mobile */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <button onClick={() => setQrType('url')} className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${qrType === 'url' ? 'bg-[#8ba888] text-[#0B0F12]' : 'bg-[#16221A] text-slate-400 hover:text-white'}`}>URL</button>
                  <button onClick={() => setQrType('wifi')} className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${qrType === 'wifi' ? 'bg-[#8ba888] text-[#0B0F12]' : 'bg-[#16221A] text-slate-400 hover:text-white'}`}>Wi-Fi</button>
                  <button onClick={() => setQrType('crypto')} className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${qrType === 'crypto' ? 'bg-[#8ba888] text-[#0B0F12]' : 'bg-[#16221A] text-slate-400 hover:text-white'}`}>Crypto</button>
                  <button onClick={() => { if(!isPremium && !profil?.has_qr_vcard) handleCheckout('qr_vcard'); else setQrType('vcard'); }} className={`relative px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${qrType === 'vcard' ? 'bg-[#8ba888] text-[#0B0F12]' : 'bg-[#16221A] text-slate-400 hover:text-white'}`}>
                    vCard {(!isPremium && !profil?.has_qr_vcard) && <span className="absolute -top-1 -right-1 text-[8px] bg-amber-500 text-black px-1.5 rounded-full shadow-md">69 RON</span>}
                  </button>
                  <button onClick={() => { if(!isPremium && !profil?.has_qr_pdf) handleCheckout('qr_dynamic'); else setQrType('dynamic'); }} className={`relative px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${qrType === 'dynamic' ? 'bg-purple-600 text-white' : 'bg-[#16221A] text-slate-400 hover:text-white'}`}>
                    Dinamic {(!isPremium && !profil?.has_qr_pdf) && <span className="absolute -top-1 -right-1 text-[8px] bg-purple-500 text-white px-1.5 rounded-full shadow-md">39 RON</span>}
                  </button>
                  <button onClick={() => { if(!isPremium) handleCheckout('pro'); else setQrType('smart'); }} className={`relative px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${qrType === 'smart' ? 'bg-blue-600 text-white' : 'bg-[#16221A] text-slate-400 hover:text-white'}`}>
                    Smart OS {(!isPremium) && <span className="absolute -top-1 -right-1 text-[8px] bg-blue-500 text-white px-1.5 rounded-full shadow-md">PRO</span>}
                  </button>
                  <button onClick={() => { if(!isPremium) handleCheckout('pro'); else setQrType('geo'); }} className={`relative px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${qrType === 'geo' ? 'bg-blue-600 text-white' : 'bg-[#16221A] text-slate-400 hover:text-white'}`}>
                    Geo-Target {(!isPremium) && <span className="absolute -top-1 -right-1 text-[8px] bg-blue-500 text-white px-1.5 rounded-full shadow-md">PRO</span>}
                  </button>
                  <button onClick={() => { if(!isPremium) handleCheckout('pro'); else setQrType('landing'); }} className={`relative px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${qrType === 'landing' ? 'bg-blue-600 text-white' : 'bg-[#16221A] text-slate-400 hover:text-white'}`}>
                    Landing Page {(!isPremium) && <span className="absolute -top-1 -right-1 text-[8px] bg-blue-500 text-white px-1.5 rounded-full shadow-md">PRO</span>}
                  </button>
                </div>
              </div>

                {/* Main Content Area */}
                <div className="p-6 flex flex-col sm:flex-row gap-6 h-auto lg:h-full">
                  {/* Left Form */}
                  <div className="flex-1 flex flex-col justify-between space-y-4 h-auto lg:h-full">
                    <div>
                      {qrType === 'url' && (
                        <div className="p-4 bg-[#8ba888]/10 border border-[#8ba888]/30 rounded-xl space-y-4">
                          <div>
                            <label className="text-[10px] text-[#8ba888] uppercase font-bold block mb-1">Standard URL (Link Web)</label>
                            <p className="text-[10px] text-slate-400 leading-tight">Cel mai comun tip de QR. Direcționează utilizatorul instant către site-ul tău, portofoliu sau profil social.</p>
                          </div>
                          <input type="text" placeholder="https://site-ul-tau.ro" value={qrUrl} onChange={(e) => setQrUrl(e.target.value)} className="w-full bg-[#0B0F12] border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-[#8ba888] outline-none" />
                        </div>
                      )}

                      {qrType === 'crypto' && (
                        <div className="p-4 bg-emerald-900/10 border border-[#8ba888]/30 rounded-xl space-y-4">
                          <div>
                            <label className="text-[10px] text-[#8ba888] uppercase font-bold block mb-1">Cerere Încasare Crypto (Wallet Request)</label>
                            <p className="text-[10px] text-slate-400 leading-tight">Generează un cod QR scanabil direct din aplicații precum Binance sau Trust Wallet pentru a primi fonduri instant în portofel.</p>
                          </div>
                          <div className="flex gap-3">
                            <select value={cryptoData.coin} onChange={e => setCryptoData({...cryptoData, coin: e.target.value})} className="w-1/3 bg-[#0B0F12] border border-slate-700 rounded-lg p-2.5 text-white text-xs outline-none">
                              <option value="bitcoin">BTC</option>
                              <option value="ethereum">ETH</option>
                              <option value="solana">SOL</option>
                              <option value="tether">USDT</option>
                            </select>
                            <input type="number" placeholder="Sumă (Opțional)" value={cryptoData.amount} onChange={(e) => setCryptoData({...cryptoData, amount: e.target.value})} className="flex-1 bg-[#0B0F12] border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-[#8ba888] outline-none" />
                          </div>
                          <input type="text" placeholder="Adresă Publică Portofel (ex: 0x... sau bc1...)" value={cryptoData.address} onChange={(e) => setCryptoData({...cryptoData, address: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-[#8ba888] outline-none font-mono" />
                        </div>
                      )}

                      {qrType === 'wifi' && (
                        <div className="p-4 bg-[#8ba888]/10 border border-[#8ba888]/30 rounded-xl space-y-4">
                          <div>
                            <label className="text-[10px] text-[#8ba888] uppercase font-bold block mb-1">Conectare Rapidă Wi-Fi</label>
                            <p className="text-[10px] text-slate-400 leading-tight">Ideal pentru HORECA sau birouri. Clienții se conectează la rețea instant, fără să mai ceară parola, doar scanând codul.</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input type="text" placeholder="Nume Rețea (SSID)" value={wifiData.ssid} onChange={(e) => setWifiData({...wifiData, ssid: e.target.value})} className="bg-[#0B0F12] border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-[#8ba888] outline-none sm:col-span-2" />
                            <input type="text" placeholder="Parolă Rețea" value={wifiData.password} onChange={(e) => setWifiData({...wifiData, password: e.target.value})} className="bg-[#0B0F12] border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-[#8ba888] outline-none" />
                            <select value={wifiData.type} onChange={e => setWifiData({...wifiData, type: e.target.value})} className="bg-[#0B0F12] border border-slate-700 rounded-lg p-2.5 text-white text-xs outline-none">
                              <option value="WPA">Securitate WPA/WPA2</option>
                              <option value="WEP">Securitate WEP</option>
                              <option value="nopass">Fără parolă (Liber)</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {qrType === 'vcard' && (
                        <div className="p-4 bg-[#8ba888]/10 border border-[#8ba888]/30 rounded-xl space-y-4">
                          <div>
                            <label className="text-[10px] text-[#8ba888] uppercase font-bold block mb-1">Carte de Vizită Digitală (vCard)</label>
                            <p className="text-[10px] text-slate-400 leading-tight">La scanare, telefonul partenerului va deschide automat o fișă de contact cu toate datele tale, gata de salvat în agendă cu un singur click.</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input type="text" placeholder="Nume Complet" value={qrData.nume} onChange={(e) => setQrData({...qrData, nume: e.target.value})} className="bg-[#0B0F12] border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-[#8ba888] outline-none sm:col-span-2" />
                            <input type="text" placeholder="Funcție / Titlu (ex: Manager)" value={qrData.functie} onChange={(e) => setQrData({...qrData, functie: e.target.value})} className="bg-[#0B0F12] border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-[#8ba888] outline-none sm:col-span-2" />
                            <input type="text" placeholder="Telefon" value={qrData.telefon} onChange={(e) => setQrData({...qrData, telefon: e.target.value})} className="bg-[#0B0F12] border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-[#8ba888] outline-none" />
                            <input type="email" placeholder="Email" value={qrData.email} onChange={(e) => setQrData({...qrData, email: e.target.value})} className="bg-[#0B0F12] border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-[#8ba888] outline-none" />
                          </div>
                        </div>
                      )}

                      {qrType === 'dynamic' && (
                        <div className="p-4 bg-purple-900/10 border border-purple-500/30 rounded-xl space-y-4">
                          <div>
                            <label className="text-[10px] text-purple-400 uppercase font-bold block mb-1">Redirecționare Dinamică & Găzduire PDF</label>
                            <p className="text-[10px] text-slate-400 leading-tight">Codul QR rămâne neschimbat fizic (tipărit), dar tu poți modifica destinația sau PDF-ul (Meniul Horeca) oricând din platformă. Primești și statistici de scanare.</p>
                          </div>
                          <div className="flex flex-col md:flex-row gap-4 items-center border-t border-purple-500/20 pt-4">
                            <div className="w-full md:w-1/2">
                              <label className="text-[10px] text-purple-400 uppercase font-bold block mb-1">A. Link URL Simplu</label>
                              <input type="text" placeholder="https://site-ul-tau.ro/oferta" value={dynamicDestUrl} onChange={e => setDynamicDestUrl(e.target.value)} className="w-full bg-[#0B0F12] border border-purple-500/50 rounded-lg p-2.5 text-white text-xs outline-none" />
                            </div>
                            <div className="w-full md:w-1/2">
                              <label className="text-[10px] text-purple-400 uppercase font-bold block mb-1">B. Sau Încărcare Meniu/PDF</label>
                              <input type="file" accept="application/pdf" onChange={(e) => handleUploadGeneric(e, setUploadedPdfUrl, 'qr_pdfs', setIsUploadingPdf)} className="block w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-purple-600 file:text-white cursor-pointer" />
                              {isUploadingPdf && <span className="text-[10px] text-purple-400 mt-1 block animate-pulse">Se încarcă PDF...</span>}
                              {uploadedPdfUrl && <span className="text-[10px] text-emerald-400 mt-1 block">✅ PDF Găzduit Securizat</span>}
                            </div>
                            <div className="shrink-0 w-full md:w-auto mt-2 md:mt-0">
                              {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                                <div className="hidden"><Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} onSuccess={setCaptchaToken} options={{ theme: 'dark', size: 'invisible' }} /></div>
                              )}
                              <button type="button" onClick={handleGenerateDynamicQr} disabled={isGeneratingShortlink} className="w-full bg-purple-600 text-white font-bold px-4 py-2.5 rounded-lg text-xs hover:bg-purple-500 transition whitespace-nowrap">
                                {isGeneratingShortlink ? 'Securizare...' : '🔗 Salvează'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {qrType === 'smart' && (
                        <div className="p-4 bg-blue-900/10 border border-blue-500/30 rounded-xl space-y-4">
                          <div>
                            <label className="text-[10px] text-blue-400 uppercase font-bold block mb-1">Smart OS Routing (App Stores)</label>
                            <p className="text-[10px] text-slate-400 leading-tight">Același cod QR detectează automat telefonul utilizatorului și îl redirecționează corect (iPhone-ul către App Store, Android-ul către Google Play).</p>
                          </div>
                          <div className="flex flex-col md:flex-row gap-3 items-center border-t border-blue-500/20 pt-4">
                            <input type="url" placeholder="🍏 Link App Store (iOS)" value={iosUrl} onChange={(e) => setIosUrl(e.target.value)} className="w-full flex-1 bg-[#0B0F12] border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-blue-500 outline-none" />
                            <input type="url" placeholder="🤖 Link Google Play (Android)" value={androidUrl} onChange={(e) => setAndroidUrl(e.target.value)} className="w-full flex-1 bg-[#0B0F12] border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-blue-500 outline-none" />
                            <div className="shrink-0 w-full md:w-auto mt-2 md:mt-0">
                              {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                                <div className="hidden"><Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} onSuccess={setCaptchaToken} options={{ theme: 'dark', size: 'invisible' }} /></div>
                              )}
                              <button type="button" onClick={handleGenerateDynamicQr} disabled={isGeneratingShortlink} className="w-full bg-blue-600 text-white font-bold px-4 py-2.5 rounded-lg text-xs hover:bg-blue-500 transition">Activează Routing</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {qrType === 'geo' && (
                        <div className="p-4 bg-blue-900/10 border border-blue-500/30 rounded-xl space-y-4">
                          <div>
                            <label className="text-[10px] text-blue-400 uppercase font-bold block mb-1">Geo-Targeting Inteligent</label>
                            <p className="text-[10px] text-slate-400 leading-tight">Redirecționează utilizatorii diferit în funcție de țara în care se află fizic la momentul scanării. Ideal pentru meniuri/pagini multi-limbă.</p>
                          </div>
                          <div className="border-t border-blue-500/20 pt-4 space-y-2">
                            {geoRules.map((rule, idx) => (
                              <div key={idx} className="flex gap-2">
                                <input type="text" placeholder="Cod Țară (RO)" value={rule.country} onChange={(e) => { const newRules = [...geoRules]; newRules[idx].country = e.target.value.toUpperCase(); setGeoRules(newRules); }} className="w-24 bg-[#0B0F12] border border-slate-700 rounded-lg p-2 text-white text-xs text-center font-bold outline-none" disabled={rule.country === 'DEFAULT'} />
                                <input type="url" placeholder="URL Destinație Specifică" value={rule.url} onChange={(e) => { const newRules = [...geoRules]; newRules[idx].url = e.target.value; setGeoRules(newRules); }} className="flex-1 bg-[#0B0F12] border border-slate-700 rounded-lg p-2 text-white text-xs outline-none" />
                              </div>
                            ))}
                            <div className="flex justify-between items-center mt-2">
                              <button type="button" onClick={() => setGeoRules([...geoRules.slice(0, -1), { country: '', url: '' }, geoRules[geoRules.length-1]])} className="text-[10px] text-blue-400 font-bold underline">+ Adaugă regulă țară</button>
                              {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                                <div className="hidden"><Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} onSuccess={setCaptchaToken} options={{ theme: 'dark', size: 'invisible' }} /></div>
                              )}
                              <button type="button" onClick={handleGenerateDynamicQr} disabled={isGeneratingShortlink} className="bg-blue-600 text-white font-bold px-4 py-1.5 rounded-lg text-[11px] hover:bg-blue-500 transition">Activează Geo-Route</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {qrType === 'landing' && (
                        <div className="p-4 bg-blue-900/10 border border-blue-500/30 rounded-xl space-y-4 max-h-56 overflow-y-auto custom-scrollbar">
                          <div>
                            <label className="text-[10px] text-blue-400 uppercase font-bold block mb-1">Mini Landing-Page Generator (Link-in-Bio)</label>
                            <p className="text-[10px] text-slate-400 leading-tight">Nu ai site web? Generăm noi o mini-pagină elegantă de prezentare unde poți pune multiple butoane pe care clienții o vor accesa la scanare.</p>
                          </div>
                          <div className="border-t border-blue-500/20 pt-4 space-y-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                              <input type="text" placeholder="Titlu Pagină (ex: Restaurantul Meu)" value={landingData.title} onChange={(e) => setLandingData({...landingData, title: e.target.value})} className="flex-1 bg-[#0B0F12] border border-slate-700 rounded-lg p-2.5 text-white text-xs outline-none" />
                              <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleUploadGeneric(e, (url) => setLandingData({...landingData, avatarUrl: url}), 'landing_images', setIsUploadingPdf)} className="flex-1 text-[10px] text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-blue-600 file:text-white cursor-pointer" />
                            </div>
                            {landingData.links.map((link, idx) => (
                              <div key={idx} className="flex gap-2">
                                <input type="text" placeholder="Nume Buton" value={link.label} onChange={(e) => { const newLinks = [...landingData.links]; newLinks[idx].label = e.target.value; setLandingData({...landingData, links: newLinks}); }} className="w-1/3 bg-[#0B0F12] border border-slate-700 rounded-lg p-2 text-white text-[11px] outline-none" />
                                <input type="url" placeholder="https://..." value={link.url} onChange={(e) => { const newLinks = [...landingData.links]; newLinks[idx].url = e.target.value; setLandingData({...landingData, links: newLinks}); }} className="flex-1 bg-[#0B0F12] border border-slate-700 rounded-lg p-2 text-white text-[11px] outline-none" />
                              </div>
                            ))}
                            <div className="flex justify-between items-center">
                              <button type="button" onClick={() => setLandingData({...landingData, links: [...landingData.links, { label: '', url: '' }]})} className="text-[10px] text-blue-400 font-bold underline block">+ Adaugă Link Extra</button>
                              {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                                <div className="hidden"><Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} onSuccess={setCaptchaToken} options={{ theme: 'dark', size: 'invisible' }} /></div>
                              )}
                              <button type="button" onClick={handleGenerateDynamicQr} disabled={isGeneratingShortlink} className="bg-blue-600 text-white font-bold px-5 py-1.5 rounded-lg text-[11px] hover:bg-blue-500 transition">Generează Landing</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Branding Bar sub form - centrat pe mobile */}
                    <div className="flex items-center justify-center sm:justify-start gap-3 pt-4 border-t border-slate-800/50 mt-4 flex-wrap">
                      <div className="flex items-center justify-center sm:justify-start gap-3 w-full flex-wrap">
                        <label className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Culoare</label>
                        <input type="color" value={qrColor} onChange={(e) => setQrColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer shrink-0 bg-transparent border-0 p-0" />
                        
                        {!isPremium ? (
                          <a 
                            href="https://zensoftware.gumroad.com/l/qr-branding" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="relative text-[10px] text-slate-400 font-bold uppercase ml-2 shrink-0 border border-slate-700 p-2 rounded-lg bg-[#0B0F12] cursor-pointer hover:bg-slate-800 transition flex items-center gap-1"
                          >
                            Incarca Logo Central
                            <span className="absolute -top-2 -right-2 text-[8px] bg-amber-500 text-black px-1.5 py-0.5 rounded-full shadow-md z-10">49 RON</span>
                          </a>
                        ) : (
                          <label className="text-[10px] text-slate-400 font-bold uppercase ml-2 shrink-0 border border-slate-700 p-2 rounded-lg bg-[#0B0F12] cursor-pointer hover:bg-slate-800 transition">
                            <span className="flex items-center gap-1">Incarca Logo Central</span>
                            <input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleQrLogoUpload} className="hidden" />
                          </label>
                        )}

                        {qrLogo && (
                          <button type="button" onClick={() => { setQrLogo(null); setQrLogoRatio(1); }} className="text-[10px] text-red-400 font-bold hover:underline">
                            Elimină ❌
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: QR Preview Area */}
                  <div className="w-full sm:w-[220px] shrink-0 border border-slate-800 rounded-xl bg-[#0B0F12]/50 p-5 flex flex-col justify-center items-center h-auto">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4 block">Live Preview</span>
                    <div className="bg-white p-3 rounded-xl shadow-md relative flex justify-center items-center overflow-hidden mb-5">
                      <QRCodeCanvas 
                        id="contract-qr"
                        value={getQrValue()} 
                        size={140} 
                        level={"H"}
                        fgColor={qrColor}
                        bgColor="#FFFFFF"
                        imageSettings={qrLogo ? { 
                          src: qrLogo, 
                          height: qrLogoRatio > 1 ? 40 / qrLogoRatio : 40, 
                          width: qrLogoRatio > 1 ? 40 : 40 * qrLogoRatio, 
                          excavate: true 
                        } : undefined}
                      />
                      <div className="hidden">
                        <QRCodeCanvas 
                          id="contract-qr-download"
                          value={getQrValue()} 
                          size={1000} 
                          level={"H"}
                          fgColor={qrColor}
                          bgColor="#FFFFFF"
                          imageSettings={qrLogo ? { 
                            src: qrLogo, 
                            height: qrLogoRatio > 1 ? 280 / qrLogoRatio : 280, 
                            width: qrLogoRatio > 1 ? 280 : 280 * qrLogoRatio, 
                            excavate: true 
                          } : undefined}
                        />
                      </div>
                      {['dynamic', 'smart', 'geo', 'landing'].includes(qrType) && (
                        <div className="absolute -bottom-1 -right-1 bg-purple-600 p-1.5 rounded-full shadow-md">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                      <button 
                        onClick={handleDownloadQR} 
                        disabled={!getQrValue() || getQrValue().trim() === "" || getQrValue() === "WIFI:S:;T:WPA;P:;;; " || getQrValue() === "bitcoin:?amount=&label="}
                        className={`w-full py-2.5 font-black rounded-lg transition-colors flex justify-center items-center gap-1.5 text-[11px] uppercase tracking-wide shadow-md ${
                          (!getQrValue() || getQrValue().trim() === "" || getQrValue() === "WIFI:S:;T:WPA;P:;;; " || getQrValue() === "bitcoin:?amount=&label=") 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' 
                            : 'bg-[#8ba888] hover:bg-[#7a9677] text-[#0B0F12] shadow-[#8ba888]/10'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Descarcă QR
                      </button>
                      {(['dynamic', 'smart', 'geo', 'landing'].includes(qrType) && (isPremium || profil?.has_qr_dynamic)) && (
                        <button onClick={fetchStats} className="w-full py-1.5 border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 font-bold rounded-lg transition-colors uppercase tracking-wide text-[10px]">
                          📊 Statistici Scanări
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* PREȚURI SECUNDARE: Șabloane & QR Individual */}
            <div className="max-w-6xl mx-auto px-4 mb-20 mt-4">
              <div className="border-t border-slate-800/80 pt-8 pb-4 mb-6 text-center">
                <h3 className="text-xl font-black text-white tracking-tight">Șabloane & Extensii QR <span className="text-[#8ba888] font-bold">(Plată Unică)</span></h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Sablon */}
                <div className="bg-[#12181D]/60 border border-slate-800/80 hover:border-slate-600 rounded-xl p-4 flex flex-col justify-between transition-colors text-center">
                  <div>
                    <div className="flex justify-center items-center mb-3">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800/50 px-2 py-0.5 rounded">Document Legal</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Șablon Tipizat</h4>
                    <div className="text-xl font-black text-white mt-1 mb-2">49 RON <span className="text-[9px] text-slate-500 font-normal">(~9.99 €)</span></div>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Contracte PDF standard, gata redactate și verificate juridic.</p>
                  </div>
                  <button type="button" onClick={() => handleCumparaPremium('sablon_tipizat')} className="w-full bg-[#0B0F12] border border-slate-700 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm">Cumpără 9.99 €</button>
                </div>

                {/* QR Branding */}
                <div className="bg-[#12181D]/60 border border-slate-800/80 hover:border-slate-600 rounded-xl p-4 flex flex-col justify-between transition-colors text-center">
                  <div>
                    <div className="flex justify-center items-center mb-3">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800/50 px-2 py-0.5 rounded">Design QR</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Pachet Branding</h4>
                    <div className="text-xl font-black text-white mt-1 mb-2">49 RON <span className="text-[9px] text-slate-500 font-normal">(~9.99 €)</span></div>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Adaugă logo-ul companiei tale în centrul codului QR generat.</p>
                  </div>
                  <button type="button" onClick={() => handleCumparaPremium('qr_branding')} className="w-full bg-[#0B0F12] border border-slate-700 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm">Cumpără 9.99 €</button>
                </div>

                {/* QR Dynamic */}
                <div className="bg-[#12181D]/60 border border-slate-800/80 hover:border-[#8ba888]/50 rounded-xl p-4 flex flex-col justify-between transition-colors group text-center">
                  <div>
                    <div className="flex justify-center items-center mb-3">
                      <span className="text-[9px] font-bold text-[#8ba888] uppercase tracking-wider bg-[#8ba888]/10 px-2 py-0.5 rounded border border-[#8ba888]/20 transition-colors group-hover:bg-[#8ba888] group-hover:text-black">Sistem QR</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">QR Dinamic + PDF</h4>
                    <div className="text-xl font-black text-[#8ba888] mt-1 mb-2">39 RON <span className="text-[9px] text-slate-500 font-normal">(~7.99 €)</span></div>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Schimbă destinația link-ului oricând + Găzduire PDF inclusă.</p>
                  </div>
                  <button type="button" onClick={() => handleCumparaPremium('qr_dynamic')} className="w-full bg-[#0B0F12] border border-slate-700 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm">Cumpără 7.99 €</button>
                </div>

                {/* QR vCard */}
                <div className="bg-[#12181D]/60 border border-slate-800/80 hover:border-blue-500/50 rounded-xl p-4 flex flex-col justify-between transition-colors group text-center">
                  <div>
                    <div className="flex justify-center items-center mb-3">
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider bg-blue-900/20 px-2 py-0.5 rounded border border-blue-500/20 transition-colors group-hover:bg-blue-500 group-hover:text-white">Premium QR</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">vCard Pro</h4>
                    <div className="text-xl font-black text-white mt-1 mb-2">69 RON <span className="text-[9px] text-slate-500 font-normal">(~13.99 €)</span></div>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Carte de vizită digitală inteligentă cu salvare directă în agendă.</p>
                  </div>
                  <button type="button" onClick={() => handleCumparaPremium('qr_vcard')} className="w-full bg-[#0B0F12] border border-slate-700 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm">Cumpără 13.99 €</button>
                </div>

              </div>
            </div>

            {/* ȘTIRI LIVE - GLOBALE CU THUMBNAILS UI/UX */}
            <div className="max-w-7xl mx-auto px-6 mt-16 pt-12 mb-12 border-t border-slate-800/80 relative">
              {/* Element de design fundal (Glow subtil pe linie) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#8ba888]/30 to-transparent"></div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#12181D] flex items-center justify-center border border-slate-700/60 shadow-inner">
                  <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span></span>
                </div>
                <div>
                  <span className="text-sm font-black text-white uppercase tracking-widest block">Flux Monitorizare Legală Real-Time</span>
                  <span className="text-[10px] text-slate-400">Actualizări automate din surse oficiale și presă economică</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stiriLive.slice(0, 6).map((stire, i) => (
                  <a href={stire.link} target="_blank" rel="noreferrer" key={i} className="group flex flex-col bg-[#0B0F12] border border-slate-800/80 rounded-2xl overflow-hidden hover:border-[#8ba888]/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_-15px_rgba(139,168,136,0.3)] transition-all duration-300 h-full relative">
                    {/* Gradient subtil pe hover */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#8ba888]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    
                    {stire.imagine ? (
                      <div className="w-full h-44 overflow-hidden relative border-b border-slate-800/60">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                        <img src={stire.imagine} alt="News thumbnail" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                        <div className="absolute bottom-3 left-3 z-20">
                          <span className="text-[9px] font-black text-black bg-[#8ba888] px-2.5 py-1 rounded-md shadow-lg uppercase tracking-wider">{stire.sursa || "Presă Economică"}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-1.5 bg-gradient-to-r from-slate-800 to-[#8ba888]/30"></div>
                    )}
                    
                    <div className="p-6 flex flex-col justify-between flex-1 relative z-10">
                      <div>
                        {!stire.imagine && (
                          <span className="text-[9px] font-bold text-[#8ba888] bg-[#12181D] px-2 py-1 rounded border border-[#8ba888]/20 uppercase inline-block mb-4">{stire.sursa || "Presă Economică"}</span>
                        )}
                        <h3 className="text-sm font-bold text-slate-200 leading-relaxed group-hover:text-white transition-colors line-clamp-3">{stire.titlu || stire.title}</h3>
                      </div>
                      <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          Astăzi
                        </span>
                        <span className="text-[10px] font-bold text-[#8ba888] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Citește Articol <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
                                    STEP 2: FORMULARE GENERATOR B2B / AUTO
            ========================================================================= */}
        {step === 2 && (
          <div className="w-full animate-fadeIn">
            <div className="max-w-5xl mx-auto py-6 px-4 md:px-6">
              
              {/* TOP BAR / BREADCRUMB */}
              <div className="mb-6 flex items-center justify-between bg-[#0B0F12]/80 backdrop-blur-sm border border-slate-800/80 px-6 py-4 rounded-xl shadow-sm">
                <button type="button" onClick={handleInapoiPrincipal} className="text-[11px] font-bold text-[#8ba888] hover:text-white flex items-center gap-2 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                  Înapoi la Panoul Principal
                </button>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Conexiune Securizată v2.0</span>
                </div>
              </div>

              <div className="bg-[#0c1014] p-6 md:p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#8ba888] opacity-[0.02] blur-3xl rounded-full pointer-events-none"></div>

                {formData.tipContract !== 'auto' ? (
                  /* ========================== FORMULAR B2B ========================== */
                  <form onSubmit={handleLansareContract} className="space-y-8 relative z-10">
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight">Configurator Document Comercial</h2>
                      <p className="text-xs text-slate-400 mt-1">Completează datele de mai jos pentru a genera contractul electronic perfect adaptat.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tip Contract */}
                      <div className="bg-[#12181D]/60 p-5 rounded-xl border border-slate-800/60 transition-colors hover:border-slate-700/60">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Tipul Documentului Generat</label>
                        <select 
                          value={formData.tipContract} 
                          onChange={e => setFormData({...formData, tipContract: e.target.value})} 
                          className="w-full bg-[#0B0F12] border border-slate-700 rounded-lg p-3 text-xs text-white outline-none focus:ring-1 focus:ring-[#8ba888]/50 focus:border-[#8ba888] transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.2em_1.2em] bg-[right_1rem_center] bg-no-repeat pr-10 cursor-pointer"
                        >
                          <option value="prestari">Contract de Prestări Servicii (General)</option>
                          <option value="colaborare_b2b">Contract Colaborare Comercială (Freelanceri)</option>
                          <option value="design_arhitectura">Contract Antrepriză Design / Arhitectură</option>
                          <option value="evenimente">Contract Servicii Evenimente (Foto/Video/Trupă)</option>
                          <option value="nda">Acord de Confidențialitate (NDA)</option>
                          <option value="cda">Contract de Drepturi de Autor (CDA)</option>
                          <option value="inchiriere_imobil">Contract de Închiriere Spațiu</option>
                          <option value="promisiune_vanzare">Promisiune (Antecontract) Vânzare Imobil</option>
                          <option value="influencer">Contract de Parteneriat & Influencer Marketing</option>
                          <option value="it_sla">Contract Prestări Servicii IT & Software (SLA)</option>
                          <option value="constructii">Contract de Execuție Lucrări & Construcții (Regie)</option>
                        </select>
                      </div>

                      {/* Calitate Contract */}
                      <div className="bg-[#12181D]/60 p-5 rounded-xl border border-slate-800/60 transition-colors hover:border-slate-700/60 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Calitatea ta în acest Contract</span>
                        <div className="flex gap-4 text-xs">
                          <label className="flex items-center text-white cursor-pointer select-none group">
                            <input type="radio" name="initiatorRol" value="prestator" checked={formData.initiatorRol === 'prestator'} onChange={e => setFormData({...formData, initiatorRol: e.target.value})} className="mr-2.5 w-4 h-4 accent-[#8ba888] bg-slate-800 border-slate-700" />
                            <span className="group-hover:text-[#8ba888] transition-colors">Eu sunt PRESTATORUL / LOCATORUL</span>
                          </label>
                          <label className="flex items-center text-white cursor-pointer select-none group">
                            <input type="radio" name="initiatorRol" value="client" checked={formData.initiatorRol === 'client'} onChange={e => setFormData({...formData, initiatorRol: e.target.value})} className="mr-2.5 w-4 h-4 accent-[#8ba888] bg-slate-800 border-slate-700" />
                            <span className="group-hover:text-[#8ba888] transition-colors">Eu sunt BENEFICIARUL / LOCATARUL</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Identitate Prestator */}
                    <div className="bg-[#12181D]/40 p-6 rounded-xl border border-slate-800/80">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded bg-[#8ba888]/20 flex items-center justify-center text-[#8ba888] font-bold text-xs">1</div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Identitate Prestator (Furnizor)</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">CUI / CNP Prestator</label>
                          <div className="relative">
                            <input type="text" placeholder="Scrie CUI / CNP" autoComplete="new-password" value={formData.prestatorCui} onChange={e => setFormData({...formData, prestatorCui: e.target.value})} onBlur={(e) => handleAutofillCui(e.target.value, 'prestator')} className="w-full p-3 bg-[#0B0F12] border border-slate-700/60 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-[#8ba888]/50 focus:border-[#8ba888] transition-all pr-24" />
                            {prestatorCuiStatus && (
                              <span className={`absolute right-2 top-2 px-2 py-1 rounded text-[9px] font-bold uppercase shadow-sm ${prestatorCuiStatus?.toUpperCase().includes('INACTIV') || prestatorCuiStatus?.toUpperCase().includes('RADIAT') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>{prestatorCuiStatus}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-3">
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1.5 block">Denumire Companie / Nume</label>
                            <input type="text" placeholder="Denumire Completă" autoComplete="new-password" value={formData.prestatorNume} onChange={e => setFormData({...formData, prestatorNume: e.target.value})} className="w-full p-3 bg-[#0B0F12] border border-slate-700/60 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-[#8ba888]/50 focus:border-[#8ba888] transition-all" />
                          </div>
                          <textarea rows="2" placeholder="Reprezentant Legal / Administratori (se poate mări)" value={formData.prestatorReprezentant} onChange={e => setFormData({...formData, prestatorReprezentant: e.target.value})} className="w-full p-3 bg-[#0B0F12] border border-slate-700/60 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-[#8ba888]/50 focus:border-[#8ba888] transition-all resize-y"></textarea>
                          <input type="text" placeholder="Adresă Sediu Social Completă" autoComplete="new-password" value={formData.prestatorAdresa || ''} onChange={e => setFormData({...formData, prestatorAdresa: e.target.value})} className="w-full p-3 bg-[#0B0F12] border border-slate-700/60 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-[#8ba888]/50 focus:border-[#8ba888] transition-all" />
                        </div>
                      </div>
                    </div>

                    {/* Identitate Client */}
                    <div className="bg-[#12181D]/40 p-6 rounded-xl border border-slate-800/80">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs">2</div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Identificare Beneficiar (Client)</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">CUI / CNP Client</label>
                          <div className="relative">
                            <input type="text" placeholder="Scrie CUI / CNP" autoComplete="new-password" value={formData.clientCui} onChange={e => setFormData({...formData, clientCui: e.target.value})} onBlur={(e) => handleAutofillCui(e.target.value, 'client')} className="w-full p-3 bg-[#0B0F12] border border-slate-700/60 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-[#8ba888]/50 focus:border-[#8ba888] transition-all pr-24" />
                            {clientCuiStatus && (
                              <span className={`absolute right-2 top-2 px-2 py-1 rounded text-[9px] font-bold uppercase shadow-sm ${clientCuiStatus?.toUpperCase().includes('INACTIV') || clientCuiStatus?.toUpperCase().includes('RADIAT') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>{clientCuiStatus}</span>
                            )}
                          </div>
                          
                          <div className="pt-3">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1.5 block">Email Contract Finalizat</label>
                            <input type="email" placeholder="Email Client (pentru trimitere)" autoComplete="new-password" value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} className="w-full p-3 bg-[#0B0F12] border border-slate-700/60 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-[#8ba888]/50 focus:border-[#8ba888] transition-all" required />
                          </div>

                          <div className="pt-2">
                             <label className="flex items-center p-3 bg-[#0B0F12] rounded-lg border border-slate-700/60 cursor-pointer select-none transition-colors hover:border-slate-600">
                              <input type="checkbox" checked={formData.adaugaProcesVerbal || false} onChange={e => setFormData({...formData, adaugaProcesVerbal: e.target.checked})} className="mr-3 w-4 h-4 accent-[#8ba888] bg-slate-800 border-slate-700" />
                              <div>
                                <span className="font-bold block text-white text-xs">Atașează Proces Verbal PV</span>
                                <span className="text-[10px] text-slate-500 block mt-0.5">Generează automat PV anexă la contract.</span>
                              </div>
                            </label>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-3">
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1.5 block">Companie Client / Nume</label>
                            <input type="text" placeholder="Denumire Completă" autoComplete="new-password" value={formData.clientNume} onChange={e => setFormData({...formData, clientNume: e.target.value})} className="w-full p-3 bg-[#0B0F12] border border-slate-700/60 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-[#8ba888]/50 focus:border-[#8ba888] transition-all" />
                          </div>
                          <textarea rows="2" placeholder="Reprezentant Legal / Administratori (se poate mări)" value={formData.clientReprezentant} onChange={e => setFormData({...formData, clientReprezentant: e.target.value})} className="w-full p-3 bg-[#0B0F12] border border-slate-700/60 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-[#8ba888]/50 focus:border-[#8ba888] transition-all resize-y"></textarea>
                          <input type="text" placeholder="Adresă Sediu Social Completă" autoComplete="new-password" value={formData.clientAdresa || ''} onChange={e => setFormData({...formData, clientAdresa: e.target.value})} className="w-full p-3 bg-[#0B0F12] border border-slate-700/60 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-[#8ba888]/50 focus:border-[#8ba888] transition-all" />
                        </div>
                      </div>
                    </div>

                    {/* Detalii Tranzactie */}
                    <div className="bg-[#12181D]/40 p-6 rounded-xl border border-slate-800/80 space-y-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-xs">3</div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Obiect, Remunerație & Clauze</span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block">Obiectul Serviciilor / Sarcini Contractuale</label>
                        <textarea placeholder="Descrierea explicită a sarcinilor, termenelor și obiectivelor..." value={formData.obiect} onChange={e => setFormData({...formData, obiect: e.target.value})} className="w-full p-4 bg-[#0B0F12] border border-slate-700/60 rounded-xl text-xs h-24 text-white resize-y outline-none focus:ring-1 focus:ring-[#8ba888]/50 focus:border-[#8ba888] transition-all shadow-inner" required></textarea>
                      </div>
                      
                      {/* Deviz specific construcții */}
                      {formData.tipContract === 'constructii' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#0B0F12] p-5 rounded-xl border border-slate-700/60">
                          <div>
                            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1.5">Cost Materiale (RON)</label>
                            <input type="number" placeholder="0" value={formData.constructiiMateriale} onChange={e => setFormData({...formData, constructiiMateriale: e.target.value})} className="w-full p-3 bg-[#12181D] border border-slate-700/60 rounded-lg text-xs text-white outline-none focus:border-[#8ba888] transition-colors" />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1.5">Cost Manoperă (RON)</label>
                            <input type="number" placeholder="0" value={formData.constructiiManopera} onChange={e => setFormData({...formData, constructiiManopera: e.target.value})} className="w-full p-3 bg-[#12181D] border border-slate-700/60 rounded-lg text-xs text-white outline-none focus:border-[#8ba888] transition-colors" />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1.5">Suprafață (mp)</label>
                            <input type="number" placeholder="0" value={formData.constructiiSuprafata} onChange={e => setFormData({...formData, constructiiSuprafata: e.target.value})} className="w-full p-3 bg-[#12181D] border border-slate-700/60 rounded-lg text-xs text-white outline-none focus:border-[#8ba888] transition-colors" />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1.5">Preț pe mp (RON)</label>
                            <input type="number" placeholder="0" value={formData.constructiiPretMp} onChange={e => setFormData({...formData, constructiiPretMp: e.target.value})} className="w-full p-3 bg-[#12181D] border border-slate-700/60 rounded-lg text-xs text-white outline-none focus:border-[#8ba888] transition-colors" />
                          </div>
                        </div>
                      )}

                      {formData.tipContract !== 'nda' && (
                        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center bg-[#0B0F12] p-5 rounded-xl border border-slate-700/60">
                          <div className="flex w-full sm:w-1/2 gap-3">
                            <div className="flex-1">
                              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1.5">Valoare Contractuală</label>
                              <input type="number" placeholder="Suma" autoComplete="new-password" value={formData.valoare} onChange={e => setFormData({...formData, valoare: e.target.value})} className="w-full p-3 bg-[#12181D] border border-slate-700/60 rounded-lg text-xs text-white outline-none focus:border-[#8ba888] transition-colors" required />
                            </div>
                            <div className="w-24">
                              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1.5">Monedă</label>
                              <select value={formData.moneda} onChange={e => setFormData({...formData, moneda: e.target.value})} className="w-full bg-[#12181D] border border-slate-700/60 rounded-lg p-3 text-xs text-white outline-none focus:border-[#8ba888] appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.2em_1.2em] bg-[right_0.5rem_center] bg-no-repeat pr-8 cursor-pointer">
                                <option value="RON">RON</option>
                                <option value="EUR">EUR</option>
                              </select>
                            </div>
                          </div>
                          <label className="flex items-center w-full sm:w-1/2 text-xs text-slate-300 cursor-pointer select-none p-3 mt-4 sm:mt-0 bg-[#12181D] border border-slate-700/60 rounded-lg hover:border-slate-500 transition-colors h-[42px] self-end">
                            <input type="checkbox" checked={formData.estePlatitorTVA} onChange={e => setFormData({...formData, estePlatitorTVA: e.target.checked})} className="mr-3 w-4 h-4 accent-[#8ba888]" />
                            <span className="font-medium truncate">Firma e plătitoare de TVA (+21%)</span>
                          </label>
                        </div>
                      )}

                      {/* QR PAY OPTION */}
                      <div className="bg-[#0B0F12] p-5 rounded-xl border border-slate-700/60 space-y-4">
                        <label className="flex items-center cursor-pointer group">
                          <input type="checkbox" checked={formData.adaugaQrPlata} onChange={e => setFormData({...formData, adaugaQrPlata: e.target.checked})} className="mr-3 w-4 h-4 accent-[#8ba888]" />
                          <div>
                            <span className="text-xs text-white font-bold block group-hover:text-[#8ba888] transition-colors">Atașează Cod QR de Plată pe Contract</span>
                            <span className="text-[10px] text-slate-500">Permite clientului să scaneze și să plătească direct din contract.</span>
                          </div>
                        </label>
                        {formData.adaugaQrPlata && (
                          <div className="animate-fadeIn">
                            <input 
                              type="text" 
                              placeholder="Introdu Contul IBAN sau Link de Plată (Stripe/Revolut)" 
                              value={formData.ibanPlata} 
                              onChange={e => setFormData({...formData, ibanPlata: e.target.value})} 
                              className="w-full p-3 bg-[#12181D] border border-[#8ba888]/50 rounded-lg text-xs text-white focus:ring-1 focus:ring-[#8ba888] outline-none font-mono transition shadow-sm" 
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#12181D]/40 p-6 rounded-xl border border-slate-800/80 space-y-5">
                      <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block border-b border-slate-800 pb-3">Activare Clauze de Protecție & Personalizare</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-2">
                        <label className="flex items-start p-4 bg-amber-900/10 border border-amber-900/30 rounded-xl cursor-pointer hover:bg-amber-900/20 transition-colors">
                          <input type="checkbox" checked={!!formData.clauzaLimitareRaspundere} onChange={e => setFormData({...formData, clauzaLimitareRaspundere: e.target.checked})} className="mt-0.5 mr-3 w-4 h-4 accent-amber-500" />
                          <div>
                            <span className="font-bold text-amber-500 block text-xs">Limitare Răspundere Comercială</span>
                            <span className="text-[10px] text-slate-400 block mt-1 leading-relaxed">Nu vei plăti niciodată daune mai mari decât factura încasată. Protecție juridică esențială.</span>
                          </div>
                        </label>

                        <label className="flex items-start p-4 bg-amber-900/10 border border-amber-900/30 rounded-xl cursor-pointer hover:bg-amber-900/20 transition-colors">
                          <input type="checkbox" checked={!!formData.clauzaInflatie} onChange={e => setFormData({...formData, clauzaInflatie: e.target.checked})} className="mt-0.5 mr-3 w-4 h-4 accent-amber-500" />
                          <div>
                            <span className="font-bold text-amber-500 block text-xs">Indexare Anti-Inflație (BNR)</span>
                            <span className="text-[10px] text-slate-400 block mt-1 leading-relaxed">Actualizează automat suma contractului dacă BNR crește cursul EUR oficial.</span>
                          </div>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {(nomenclatorClauze[formData.tipContract] || nomenclatorClauze.prestari).map((clauza) => (
                          <label key={clauza.id} className="flex items-start p-4 bg-[#0B0F12] border border-slate-700/60 rounded-xl cursor-pointer hover:border-slate-500 transition-colors group">
                            <input type="checkbox" checked={!!formData[clauza.id]} onChange={e => setFormData({...formData, [clauza.id]: e.target.checked})} className="mt-0.5 mr-3 w-4 h-4 accent-[#8ba888]" />
                            <div>
                              <span className="font-bold text-white block group-hover:text-slate-200">{clauza.titlu}</span>
                              <span className="text-[10px] text-slate-500 block mt-1 leading-relaxed">{clauza.detaliu || clauza.text}</span>
                            </div>
                          </label>
                        ))}
                      </div>

                      {/* CLAUZĂ CUSTOM ADĂUGATĂ MANUAL */}
                      <div className="pt-5 mt-2">
                        <label className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold text-[#8ba888] uppercase tracking-wider block">Adaugă Clauză Specifică (Opțional)</span>
                          <span className="bg-[#16221A] text-[#8ba888] text-[9px] px-2 py-1 rounded font-bold border border-[#8ba888]/30 tracking-widest shadow-sm">AUTO-NUMEROTARE</span>
                        </label>
                        <p className="text-[10px] text-slate-500 leading-relaxed mb-3">Dacă lipsește ceva din lista de mai sus, redactează textul aici. Sistemul ContractSmart îl va numerota și integra perfect la finalul contractului, păstrând formatul juridic.</p>
                        <textarea 
                          placeholder="Ex: Părțile convin ca predarea materialelor finale să se facă exclusiv pe un hard-disk extern furnizat de Beneficiar la sediul acestuia..." 
                          value={formData.clauzaCustom} 
                          onChange={e => setFormData({...formData, clauzaCustom: e.target.value})} 
                          className="w-full p-4 bg-[#0B0F12] border border-slate-700/60 rounded-xl text-xs h-24 text-white resize-y focus:ring-1 focus:ring-[#8ba888]/50 focus:border-[#8ba888] outline-none transition-all shadow-inner" 
                        ></textarea>
                      </div>
                    </div>

                    {/* SISTEM AVANSAT DE SEMNĂTURI */}
                    <div className="bg-[#12181D]/40 p-6 rounded-xl border border-slate-800/80">
                      <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-4 sm:gap-0">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded bg-[#8ba888]/20 flex items-center justify-center text-[#8ba888] font-bold text-xs">4</div>
                           <span className="text-xs font-bold text-white uppercase tracking-wider block">Aprobare și Semnare Document</span>
                        </div>
                        <div className="flex bg-[#0B0F12] p-1 rounded-lg border border-slate-700/60 shadow-inner">
                          <button type="button" onClick={() => { setSignatureTab('draw'); curataCanvas(); }} className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200 ${signatureTab === 'draw' ? 'bg-[#8ba888] text-black shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>Desenează</button>
                          <button type="button" onClick={() => { setSignatureTab('upload'); curataCanvas(); }} className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200 ${signatureTab === 'upload' ? 'bg-[#8ba888] text-black shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>📁 Încarcă PNG/JPG</button>
                        </div>
                      </div>

                      <div className="bg-[#0B0F12] p-4 rounded-xl border border-slate-700/60">
                        {signatureTab === 'draw' && (
                          <div className="space-y-3 relative">
                            <div className="relative border-2 border-dashed border-slate-600 rounded-xl bg-white overflow-hidden shadow-inner">
                              {!isDrawing && !canvasRef.current?.toDataURL().length > 100 && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                  <span className="text-slate-800 text-3xl font-black italic tracking-tighter">Semnează aici</span>
                                </div>
                              )}
                              {/* O grilă subtilă de fundal pentru aspect premium */}
                              <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=')] opacity-50"></div>
                              <canvas 
                                ref={canvasRef} 
                                width={600} 
                                height={160} 
                                onTouchStart={pornesteDesenul} 
                                onTouchMove={deseneaza} 
                                onTouchEnd={opresteDesenul} 
                                onMouseDown={pornesteDesenul} 
                                onMouseMove={deseneaza} 
                                onMouseUp={opresteDesenul} 
                                onMouseLeave={opresteDesenul} 
                                className="w-full h-40 cursor-crosshair block touch-none relative z-10" 
                              />
                            </div>
                            <div className="flex justify-end">
                              <button type="button" onClick={curataCanvas} className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest flex items-center gap-1.5 bg-red-400/10 px-3 py-1.5 rounded-lg border border-red-400/20">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                Curăță / Resemnează
                              </button>
                            </div>
                          </div>
                        )}

                        {signatureTab === 'upload' && (
                          <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-600 rounded-xl bg-[#12181D]/50 transition-colors hover:border-[#8ba888]/50 hover:bg-[#12181D]">
                            {!uploadedSignature ? (
                              <>
                                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-[#8ba888] shadow-inner">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                </div>
                                <label className="cursor-pointer bg-[#8ba888] text-black px-6 py-2.5 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[#8ba888]/20">
                                  Selectează Imaginea
                                  <input type="file" accept="image/png, image/jpeg" onChange={handleIncarcareSemnatura} className="hidden" />
                                </label>
                                <span className="text-[10px] text-slate-500 mt-3 max-w-xs text-center leading-relaxed">Pentru un rezultat perfect, folosiți o imagine clară (PNG fără fundal este ideal). Sistemul o va încadra pe document.</span>
                              </>
                            ) : (
                              <div className="flex flex-col items-center w-full px-4">
                                <div className="bg-white p-4 rounded-xl mb-5 w-full max-w-sm flex justify-center border border-slate-300 shadow-inner relative overflow-hidden">
                                  <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=')] opacity-50"></div>
                                  <img src={uploadedSignature} alt="Semnatura Incarcata" className="max-h-28 object-contain relative z-10 drop-shadow-sm" />
                                </div>
                                <button type="button" onClick={() => setUploadedSignature(null)} className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest flex items-center gap-1.5 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                  Șterge & Reîncarcă
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                      <div className="flex justify-center">
                        <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} onSuccess={setCaptchaToken} options={{ theme: 'dark', size: 'invisible' }} />
                      </div>
                    )}

                    <div className="pt-4 pb-2">
                      <label className="flex items-start cursor-pointer group bg-[#12181D]/30 p-4 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                        <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                          <input type="checkbox" checked={acordGdpr} onChange={e => setAcordGdpr(e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-slate-600 rounded bg-[#0B0F12] checked:bg-[#8ba888] checked:border-[#8ba888] transition-all cursor-pointer shadow-inner" />
                          <svg className="absolute w-3.5 h-3.5 text-[#0B0F12] opacity-0 peer-checked:opacity-100 pointer-events-none stroke-current" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <span className="ml-3 text-[11px] text-slate-400 leading-relaxed select-none">
                          Sunt de acord cu <Link href="/termeni-si-conditii" target="_blank" className="text-[#8ba888] hover:underline font-semibold">Termenii și Condițiile</Link> și înțeleg că documentele sunt generate digital cu valoare legală deplină. Datele și semnăturile sunt criptate și <strong>NU</strong> sunt stocate permanent sau vândute terților, fiind procesate strict pentru generarea contractului curent conform <Link href="/politica-si-confidentialitate" target="_blank" className="text-[#8ba888] hover:underline font-semibold">Politicii GDPR</Link>.
                        </span>
                      </label>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-between items-center pt-8 border-t border-slate-800/80 gap-4 sm:gap-0">
                      <button type="button" onClick={handleInapoiPrincipal} className="text-xs font-semibold text-slate-400 hover:text-white transition-colors underline underline-offset-4">Anulează și întoarce-te</button>
                      <button type="submit" disabled={!!loadingText} className="w-full sm:w-auto bg-gradient-to-r from-[#8ba888] to-[#6d8a6a] text-[#0B0F12] font-black px-10 py-4 rounded-xl text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(139,168,136,0.3)] hover:shadow-[0_0_25px_rgba(139,168,136,0.5)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
                        {loadingText ? (
                          <>
                             <svg className="animate-spin h-4 w-4 text-[#0B0F12]" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             <span>Se Înregistrează Securizat...</span>
                          </>
                        ) : (
                          <>
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                             Generează Contractul (PDF)
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  
                  /* ========================== FORMULAR AUTO ========================== */
                  
                  <form onSubmit={handleGenereazaPachetAuto} className="space-y-8 relative z-10" autoComplete="off">
                    <div className="border-b border-slate-800/80 pb-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8ba888]/10 border border-[#8ba888]/20 text-[#8ba888] text-[10px] font-black uppercase tracking-widest mb-3">
                        <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>
                        Modul Auto
                      </div>
                      <h2 className="text-3xl font-black text-white tracking-tight">Asistent Vânzare Auto</h2>
                      <p className="text-xs text-slate-400 mt-2 max-w-2xl leading-relaxed">Sistemul generează 5 exemplare oficiale omologate DITL/DRPCIV, fișa de înmatriculare și procesul-verbal de predare cu atestare kilometri reali.</p>
                    </div>

                    {autoStep === 'upload' && (
                      <div className="space-y-6">
                        
                        {/* 1. Vanzator */}
                        <div className="p-6 bg-[#12181D]/40 border border-slate-800/80 rounded-xl space-y-5 relative overflow-hidden group hover:border-slate-700/60 transition-colors">
                          <div className="absolute top-0 left-0 w-1 h-full bg-slate-700 group-hover:bg-[#8ba888] transition-colors"></div>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 border-b border-slate-800/60 pb-3">
                            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2"><span className="text-slate-500 font-mono">01.</span> Identitate Vânzător</span>
                            <div className="flex bg-[#0B0F12] p-1 rounded-lg border border-slate-700/60 shadow-inner w-full sm:w-auto">
                              <button type="button" onClick={() => setAutoData({...autoData, vanzatorTip: 'PF'})} className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200 ${autoData.vanzatorTip === 'PF' ? 'bg-[#8ba888] text-black shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>Fizică (PF)</button>
                              <button type="button" onClick={() => setAutoData({...autoData, vanzatorTip: 'PJ'})} className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200 ${autoData.vanzatorTip === 'PJ' ? 'bg-[#8ba888] text-black shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>Firmă (PJ)</button>
                            </div>
                          </div>
                          
                          {autoData.vanzatorTip === 'PF' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1.5">Nume Complet din Buletin</label>
                                <input type="text" placeholder="Nume și Prenume" autoComplete="new-password" value={autoData.vanzatorNume} onChange={e => setAutoData({...autoData, vanzatorNume: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700/60 p-3 rounded-lg text-xs text-white outline-none focus:border-[#8ba888] transition-colors" />
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1.5">Cod Numeric Personal (CNP)</label>
                                <input type="text" placeholder="Ex: 1900101..." autoComplete="new-password" value={autoData.vanzatorCnp} onChange={e => setAutoData({...autoData, vanzatorCnp: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700/60 p-3 rounded-lg text-xs text-white font-mono outline-none focus:border-[#8ba888] transition-colors" />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1.5">Adresă Domiciliu (exact ca în buletin)</label>
                                <input type="text" placeholder="Strada, Număr, Bloc, Apartament, Localitate, Județ" autoComplete="new-password" value={autoData.autoAdresaVanzator} onChange={e => setAutoData({...autoData, autoAdresaVanzator: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700/60 p-3 rounded-lg text-xs text-white outline-none focus:border-[#8ba888] transition-colors" />
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1.5">Denumire Companie / PFA</label>
                                <input type="text" placeholder="Firma SRL" autoComplete="new-password" value={autoData.vanzatorNume} onChange={e => setAutoData({...autoData, vanzatorNume: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700/60 p-3 rounded-lg text-xs text-white outline-none focus:border-[#8ba888] transition-colors" />
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1.5">CUI / CIF Fiscal</label>
                                <input type="text" placeholder="RO..." autoComplete="new-password" value={autoData.vanzatorCui} onChange={e => setAutoData({...autoData, vanzatorCui: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700/60 p-3 rounded-lg text-xs text-white font-mono outline-none focus:border-[#8ba888] transition-colors" />
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1.5">Nr. Înmatriculare Reg. Comerțului</label>
                                <input type="text" placeholder="J/..." autoComplete="new-password" value={autoData.vanzatorRegCom} onChange={e => setAutoData({...autoData, vanzatorRegCom: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700/60 p-3 rounded-lg text-xs text-white outline-none focus:border-[#8ba888] transition-colors" />
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1.5">Sediu Social Oficial</label>
                                <input type="text" placeholder="Adresa firmei" autoComplete="new-password" value={autoData.vanzatorSediu} onChange={e => setAutoData({...autoData, vanzatorSediu: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700/60 p-3 rounded-lg text-xs text-white outline-none focus:border-[#8ba888] transition-colors" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 2. Cumparator */}
                        <div className="p-6 bg-[#12181D]/40 border border-slate-800/80 rounded-xl space-y-5 relative overflow-hidden group hover:border-slate-700/60 transition-colors">
                          <div className="absolute top-0 left-0 w-1 h-full bg-slate-700 group-hover:bg-[#8ba888] transition-colors"></div>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 border-b border-slate-800/60 pb-3">
                            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2"><span className="text-slate-500 font-mono">02.</span> Identitate Cumpărător</span>
                            <div className="flex bg-[#0B0F12] p-1 rounded-lg border border-slate-700/60 shadow-inner w-full sm:w-auto">
                              <button type="button" onClick={() => setAutoData({...autoData, cumparatorTip: 'PF'})} className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200 ${autoData.cumparatorTip === 'PF' ? 'bg-[#8ba888] text-black shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>Fizică (PF)</button>
                              <button type="button" onClick={() => setAutoData({...autoData, cumparatorTip: 'PJ'})} className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200 ${autoData.cumparatorTip === 'PJ' ? 'bg-[#8ba888] text-black shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>Firmă (PJ)</button>
                            </div>
                          </div>
                          
                          {autoData.cumparatorTip === 'PF' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1.5">Nume Complet din Buletin</label>
                                <input type="text" placeholder="Nume și Prenume" autoComplete="new-password" value={autoData.cumparatorNume} onChange={e => setAutoData({...autoData, cumparatorNume: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700/60 p-3 rounded-lg text-xs text-white outline-none focus:border-[#8ba888] transition-colors" />
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1.5">Cod Numeric Personal (CNP)</label>
                                <input type="text" placeholder="Ex: 1900101..." autoComplete="new-password" value={autoData.cumparatorCnp} onChange={e => setAutoData({...autoData, cumparatorCnp: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700/60 p-3 rounded-lg text-xs text-white font-mono outline-none focus:border-[#8ba888] transition-colors" />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1.5">Adresă Domiciliu (exact ca în buletin)</label>
                                <input type="text" placeholder="Strada, Număr, Bloc, Apartament, Localitate, Județ" autoComplete="new-password" value={autoData.autoAdresaCumparator} onChange={e => setAutoData({...autoData, autoAdresaCumparator: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700/60 p-3 rounded-lg text-xs text-white outline-none focus:border-[#8ba888] transition-colors" />
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1.5">Denumire Companie / PFA</label>
                                <input type="text" placeholder="Firma SRL" autoComplete="new-password" value={autoData.cumparatorNume} onChange={e => setAutoData({...autoData, cumparatorNume: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700/60 p-3 rounded-lg text-xs text-white outline-none focus:border-[#8ba888] transition-colors" />
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1.5">CUI / CIF Fiscal</label>
                                <input type="text" placeholder="RO..." autoComplete="new-password" value={autoData.cumparatorCui} onChange={e => setAutoData({...autoData, cumparatorCui: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700/60 p-3 rounded-lg text-xs text-white font-mono outline-none focus:border-[#8ba888] transition-colors" />
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1.5">Nr. Înmatriculare Reg. Comerțului</label>
                                <input type="text" placeholder="J/..." autoComplete="new-password" value={autoData.cumparatorRegCom} onChange={e => setAutoData({...autoData, cumparatorRegCom: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700/60 p-3 rounded-lg text-xs text-white outline-none focus:border-[#8ba888] transition-colors" />
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1.5">Sediu Social Oficial</label>
                                <input type="text" placeholder="Adresa firmei" autoComplete="new-password" value={autoData.cumparatorSediu} onChange={e => setAutoData({...autoData, cumparatorSediu: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700/60 p-3 rounded-lg text-xs text-white outline-none focus:border-[#8ba888] transition-colors" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 3. Zona Scanare Inteligenta (RE-DESIGNED) */}
                        <div className="p-6 bg-[#0B0F12] border border-[#8ba888]/20 rounded-xl space-y-6 shadow-lg shadow-[#8ba888]/5">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800/80 pb-3">
                            <div>
                              <span className="text-xs font-bold text-[#8ba888] uppercase tracking-wider flex items-center gap-2"><span className="text-slate-500 font-mono">03.</span> Scanare Optică Inteligentă (Opțional)</span>
                              <span className="text-[10px] text-slate-400 block mt-1">Sistemul OCR extrage automat datele din pozele actelor. Folosește telefonul sau calculatorul.</span>
                            </div>
                            <div className="px-3 py-1 bg-blue-900/20 text-blue-400 text-[10px] font-bold uppercase rounded-md border border-blue-900/30">AI Powered</div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            
                            {/* Card 1: CIV */}
                            <div className="bg-[#12181D]/60 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between min-h-[160px] hover:border-[#8ba888]/40 transition-all duration-300 relative group overflow-hidden shadow-sm">
                              <div className="text-center mb-3">
                                <h4 className="text-white text-xs font-semibold tracking-wide">Cartea Mașinii (CIV)</h4>
                                <p className="text-slate-500 text-[9px] mt-1 uppercase">Format: JPG/PNG/PDF</p>
                              </div>
                              {!autoDocs.civ ? (
                                isScanning === 'civ' ? (
                                  <div className="flex flex-col items-center justify-center flex-1 gap-2">
                                    <svg className="animate-spin h-6 w-6 text-[#8ba888]" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <span className="text-[9px] text-[#8ba888] animate-pulse">OCR extrage date...</span>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2 mt-auto">
                                    <label className="flex flex-col items-center justify-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-200 text-[10px] py-2.5 px-1 rounded-lg cursor-pointer transition-colors text-center">
                                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                      <span className="font-bold leading-none">Alege<br/>Fișier</span>
                                      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleAutoFileUpload(e, 'civ')} />
                                    </label>
                                    <button type="button" onClick={() => startCamera('civ')} className="flex flex-col items-center justify-center gap-1.5 bg-[#1e293b] hover:bg-blue-600 border border-blue-500/40 text-white text-[10px] py-2.5 px-1 rounded-lg cursor-pointer transition-colors text-center">
                                      <svg className="w-4 h-4 text-blue-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                      <span className="font-bold leading-none">Cameră<br/>Live</span>
                                    </button>
                                  </div>
                                )
                              ) : (
                                <div className="flex flex-col items-center justify-center flex-1 gap-3">
                                  <div className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-full flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    <span className="text-[10px] font-bold tracking-wide">Document Procesat</span>
                                  </div>
                                  <button type="button" onClick={() => handleEliminaDocument('civ')} className="text-[10px] text-red-400 font-bold hover:text-red-300 transition-colors uppercase flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    Șterge Memoria
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Card 2: Talon */}
                            <div className="bg-[#12181D]/60 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between min-h-[160px] hover:border-[#8ba888]/40 transition-all duration-300 relative group overflow-hidden shadow-sm">
                              <div className="text-center mb-3">
                                <h4 className="text-white text-xs font-semibold tracking-wide">Certificat (Talon)</h4>
                                <p className="text-slate-500 text-[9px] mt-1 uppercase">Format: JPG/PNG/PDF</p>
                              </div>
                              {!autoDocs.talon ? (
                                isScanning === 'talon' ? (
                                  <div className="flex flex-col items-center justify-center flex-1 gap-2">
                                    <svg className="animate-spin h-6 w-6 text-[#8ba888]" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <span className="text-[9px] text-[#8ba888] animate-pulse">OCR extrage date...</span>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2 mt-auto">
                                    <label className="flex flex-col items-center justify-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-200 text-[10px] py-2.5 px-1 rounded-lg cursor-pointer transition-colors text-center">
                                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                      <span className="font-bold leading-none">Alege<br/>Fișier</span>
                                      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleAutoFileUpload(e, 'talon')} />
                                    </label>
                                    <button type="button" onClick={() => startCamera('talon')} className="flex flex-col items-center justify-center gap-1.5 bg-[#1e293b] hover:bg-blue-600 border border-blue-500/40 text-white text-[10px] py-2.5 px-1 rounded-lg cursor-pointer transition-colors text-center">
                                      <svg className="w-4 h-4 text-blue-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                      <span className="font-bold leading-none">Cameră<br/>Live</span>
                                    </button>
                                  </div>
                                )
                              ) : (
                                <div className="flex flex-col items-center justify-center flex-1 gap-3">
                                  <div className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-full flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    <span className="text-[10px] font-bold tracking-wide">Document Procesat</span>
                                  </div>
                                  <button type="button" onClick={() => handleEliminaDocument('talon')} className="text-[10px] text-red-400 font-bold hover:text-red-300 transition-colors uppercase flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    Șterge Memoria
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Card 3: Buletin Vanzator */}
                            <div className="bg-[#12181D]/60 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between min-h-[160px] hover:border-[#8ba888]/40 transition-all duration-300 relative group overflow-hidden shadow-sm">
                              <div className="text-center mb-3">
                                <h4 className="text-white text-xs font-semibold tracking-wide">ID Vânzător</h4>
                                <p className="text-slate-500 text-[9px] mt-1 uppercase">Format: JPG/PNG/PDF</p>
                              </div>
                              {!autoDocs.buletin_vanzator ? (
                                isScanning === 'buletin_vanzator' ? (
                                  <div className="flex flex-col items-center justify-center flex-1 gap-2">
                                    <svg className="animate-spin h-6 w-6 text-[#8ba888]" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <span className="text-[9px] text-[#8ba888] animate-pulse">OCR extrage date...</span>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2 mt-auto">
                                    <label className="flex flex-col items-center justify-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-200 text-[10px] py-2.5 px-1 rounded-lg cursor-pointer transition-colors text-center">
                                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                      <span className="font-bold leading-none">Alege<br/>Fișier</span>
                                      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleAutoFileUpload(e, 'buletin_vanzator')} />
                                    </label>
                                    <button type="button" onClick={() => startCamera('buletin_vanzator')} className="flex flex-col items-center justify-center gap-1.5 bg-[#1e293b] hover:bg-blue-600 border border-blue-500/40 text-white text-[10px] py-2.5 px-1 rounded-lg cursor-pointer transition-colors text-center">
                                      <svg className="w-4 h-4 text-blue-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                      <span className="font-bold leading-none">Cameră<br/>Live</span>
                                    </button>
                                  </div>
                                )
                              ) : (
                                <div className="flex flex-col items-center justify-center flex-1 gap-3">
                                  <div className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-full flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    <span className="text-[10px] font-bold tracking-wide">Document Procesat</span>
                                  </div>
                                  <button type="button" onClick={() => handleEliminaDocument('buletin_vanzator')} className="text-[10px] text-red-400 font-bold hover:text-red-300 transition-colors uppercase flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    Șterge Memoria
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Card 4: Buletin Cumparator */}
                            <div className="bg-[#12181D]/60 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between min-h-[160px] hover:border-[#8ba888]/40 transition-all duration-300 relative group overflow-hidden shadow-sm">
                              <div className="text-center mb-3">
                                <h4 className="text-white text-xs font-semibold tracking-wide">ID Cumpărător</h4>
                                <p className="text-slate-500 text-[9px] mt-1 uppercase">Format: JPG/PNG/PDF</p>
                              </div>
                              {!autoDocs.buletin_cumparator ? (
                                isScanning === 'buletin_cumparator' ? (
                                  <div className="flex flex-col items-center justify-center flex-1 gap-2">
                                    <svg className="animate-spin h-6 w-6 text-[#8ba888]" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <span className="text-[9px] text-[#8ba888] animate-pulse">OCR extrage date...</span>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2 mt-auto">
                                    <label className="flex flex-col items-center justify-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-200 text-[10px] py-2.5 px-1 rounded-lg cursor-pointer transition-colors text-center">
                                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                      <span className="font-bold leading-none">Alege<br/>Fișier</span>
                                      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleAutoFileUpload(e, 'buletin_cumparator')} />
                                    </label>
                                    <button type="button" onClick={() => startCamera('buletin_cumparator')} className="flex flex-col items-center justify-center gap-1.5 bg-[#1e293b] hover:bg-blue-600 border border-blue-500/40 text-white text-[10px] py-2.5 px-1 rounded-lg cursor-pointer transition-colors text-center">
                                      <svg className="w-4 h-4 text-blue-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                      <span className="font-bold leading-none">Cameră<br/>Live</span>
                                    </button>
                                  </div>
                                )
                              ) : (
                                <div className="flex flex-col items-center justify-center flex-1 gap-3">
                                  <div className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-full flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    <span className="text-[10px] font-bold tracking-wide">Document Procesat</span>
                                  </div>
                                  <button type="button" onClick={() => handleEliminaDocument('buletin_cumparator')} className="text-[10px] text-red-400 font-bold hover:text-red-300 transition-colors uppercase flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    Șterge Memoria
                                  </button>
                                </div>
                              )}
                            </div>

                          </div>
                        </div>

                        {/* Modal Cameră Live OCR */}
                        {isCameraActive && (
                          <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md">
                            <div className="relative w-full max-w-xl aspect-[4/3] bg-black rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
                              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                              <canvas ref={autoCanvasRef} className="hidden"></canvas>
                              <div className="absolute inset-10 pointer-events-none flex items-center justify-center">
                                <div className={`w-full h-full border-4 rounded-xl transition-all duration-500 relative ${
                                  alignmentStatus === 'ready' ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)] scale-105' : 'border-amber-400/80 animate-pulse'
                                }`}>
                                  <span className={`absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-black px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap transition-colors ${
                                    alignmentStatus === 'ready' ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'
                                  }`}>
                                    {alignmentStatus === 'ready' ? '✓ ALINIAT PERFECT - APASĂ CAPTURĂ' : 'Încadrează documentul în chenar...'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-4 mt-8">
                              <button type="button" onClick={capturePhoto} className={`px-8 py-3.5 rounded-xl font-black text-sm transition-all shadow-lg ${alignmentStatus === 'ready' ? 'bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-105 animate-bounce' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>📷 Faceți Captura</button>
                              <button type="button" onClick={stopCamera} className="bg-red-900/30 text-red-400 border border-red-900/50 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-red-900/50 transition-colors">Anulează</button>
                            </div>
                          </div>
                        )}

                        {/* 4. Date Vehicul Extrase */}
                        <div className="p-6 bg-[#12181D]/40 border border-slate-800/80 rounded-xl space-y-5 relative overflow-hidden group hover:border-slate-700/60 transition-colors">
                          <div className="absolute top-0 left-0 w-1 h-full bg-slate-700 group-hover:bg-[#8ba888] transition-colors"></div>
                          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/60 pb-3"><span className="text-slate-500 font-mono">04.</span> Date Vehicul & Tranzacție</span>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="sm:col-span-1">
                              <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1.5">Serie Șasiu / VIN</label>
                              <input type="text" placeholder="WBA..." autoComplete="new-password" required value={autoData.autoVin} onChange={e => setAutoData({...autoData, autoVin: e.target.value.toUpperCase()})} className="w-full p-3 bg-[#0B0F12] border border-slate-700/60 rounded-lg text-xs text-white uppercase font-mono outline-none focus:border-[#8ba888] transition-colors" />
                            </div>
                            <div className="sm:col-span-1">
                              <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1.5">Număr Înmatriculare</label>
                              <input type="text" placeholder="B 101 ABC" autoComplete="new-password" value={autoData.autoNumarInmatriculare} onChange={e => setAutoData({...autoData, autoNumarInmatriculare: e.target.value.toUpperCase()})} className="w-full p-3 bg-[#0B0F12] border border-slate-700/60 rounded-lg text-xs text-white uppercase font-mono outline-none focus:border-[#8ba888] transition-colors" />
                            </div>
                            <div className="sm:col-span-1">
                              <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1.5">Marcă și Model</label>
                              <input type="text" placeholder="VW Golf" autoComplete="new-password" value={autoData.autoMarcaModel} onChange={e => setAutoData({...autoData, autoMarcaModel: e.target.value})} className="w-full p-3 bg-[#0B0F12] border border-slate-700/60 rounded-lg text-xs text-white outline-none focus:border-[#8ba888] transition-colors" />
                            </div>
                            <div className="sm:col-span-1">
                              <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1.5">Preț Tranzacție</label>
                              <div className="flex gap-1.5 min-w-0">
                                <input 
                                  type="number" 
                                  placeholder="Sumă" 
                                  autoComplete="new-password" 
                                  value={autoData.autoPret} 
                                  onChange={e => setAutoData({...autoData, autoPret: e.target.value})} 
                                  className="min-w-0 flex-1 p-3 bg-[#0B0F12] border border-slate-700/60 rounded-lg text-xs text-white outline-none focus:border-[#8ba888] transition-colors" 
                                />
                                <select 
                                  value={autoData.autoMoneda} 
                                  onChange={e => setAutoData({...autoData, autoMoneda: e.target.value})} 
                                  className="w-16 bg-[#0B0F12] border border-slate-700/60 rounded-lg p-3 text-xs text-white outline-none appearance-none cursor-pointer focus:border-[#8ba888] bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1.0em] bg-[right_0.2rem_center] bg-no-repeat pr-5"
                                >
                                  <option value="RON">RON</option>
                                  <option value="EUR">EUR</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                             <div>
                               <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1.5">Email Primire Acte Finale</label>
                               <input type="email" placeholder="Adresa unde trimitem ZIP-ul..." autoComplete="new-password" required value={autoData.clientEmail} onChange={e => setAutoData({...autoData, clientEmail: e.target.value})} className="w-full p-3 bg-[#0B0F12] border border-slate-700/60 rounded-lg text-xs text-white outline-none focus:border-[#8ba888] transition-colors" />
                             </div>
                             <div className="flex items-end">
                               <label className="flex items-center w-full h-[42px] px-4 text-xs text-slate-300 cursor-pointer select-none border border-slate-700/60 rounded-lg bg-[#0B0F12] hover:border-slate-500 transition-colors">
                                 <input type="checkbox" checked={autoData.pretIncludeTVA} onChange={e => setAutoData({...autoData, pretIncludeTVA: e.target.checked})} className="mr-3 w-4 h-4 accent-[#8ba888]" />
                                 <span className="font-medium">Prețul include TVA (Dacă Vânzătorul e firmă)</span>
                               </label>
                             </div>
                          </div>
                        </div>

                        {/* SECȚIUNE SEMNĂTURĂ PENTRU AUTO */}
                        <div className="bg-[#12181D]/40 p-6 rounded-xl border border-slate-800/80">
                          <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-4 sm:gap-0">
                            <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded bg-[#8ba888]/20 flex items-center justify-center text-[#8ba888] font-bold text-xs">5</div>
                               <span className="text-xs font-bold text-white uppercase tracking-wider block">Aprobare și Semnare Dosar Auto</span>
                            </div>
                            <div className="flex bg-[#0B0F12] p-1 rounded-lg border border-slate-700/60 shadow-inner">
                              <button type="button" onClick={() => { setAutoSignatureTab('draw'); curataCanvasAuto(); }} className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200 ${autoSignatureTab === 'draw' ? 'bg-[#8ba888] text-black shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}> Desenează</button>
                              <button type="button" onClick={() => { setAutoSignatureTab('upload'); curataCanvasAuto(); }} className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200 ${autoSignatureTab === 'upload' ? 'bg-[#8ba888] text-black shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>📁 Încarcă PNG/JPG</button>
                            </div>
                          </div>

                          <div className="bg-[#0B0F12] p-4 rounded-xl border border-slate-700/60">
                            {autoSignatureTab === 'draw' && (
                              <div className="space-y-3 relative">
                                <div className="relative border-2 border-dashed border-slate-600 rounded-xl bg-white overflow-hidden shadow-inner">
                                  {!isAutoDrawing && !autoSigCanvasRef.current?.toDataURL().length > 100 && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                      <span className="text-slate-800 text-3xl font-black italic tracking-tighter">Semnează aici</span>
                                    </div>
                                  )}
                                  {/* Grilă de fundal */}
                                  <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=')] opacity-50"></div>
                                  <canvas 
                                    ref={autoSigCanvasRef} 
                                    width={600} 
                                    height={160} 
                                    onTouchStart={pornesteDesenulAuto} 
                                    onTouchMove={deseneazaAuto} 
                                    onTouchEnd={opresteDesenulAuto} 
                                    onMouseDown={pornesteDesenulAuto} 
                                    onMouseMove={deseneazaAuto} 
                                    onMouseUp={opresteDesenulAuto} 
                                    onMouseLeave={opresteDesenulAuto} 
                                    className="w-full h-40 cursor-crosshair block touch-none relative z-10" 
                                  />
                                </div>
                                <div className="flex justify-end">
                                  <button type="button" onClick={curataCanvasAuto} className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest flex items-center gap-1.5 bg-red-400/10 px-3 py-1.5 rounded-lg border border-red-400/20">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    Curăță / Resemnează
                                  </button>
                                </div>
                              </div>
                            )}

                            {autoSignatureTab === 'upload' && (
                              <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-600 rounded-xl bg-[#12181D]/50 transition-colors hover:border-[#8ba888]/50 hover:bg-[#12181D]">
                                {!autoUploadedSig ? (
                                  <>
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-[#8ba888] shadow-inner">
                                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                    </div>
                                    <label className="cursor-pointer bg-[#8ba888] text-black px-6 py-2.5 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[#8ba888]/20">
                                      Selectează Imaginea
                                      <input type="file" accept="image/png, image/jpeg" onChange={handleIncarcareSemnaturaAuto} className="hidden" />
                                    </label>
                                    <span className="text-[10px] text-slate-500 mt-3 max-w-xs text-center leading-relaxed">Sistemul ContractSmart o va aplica perfect pe toate cele 5 exemplare DITL.</span>
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center w-full px-4">
                                    <div className="bg-white p-4 rounded-xl mb-5 w-full max-w-sm flex justify-center border border-slate-300 shadow-inner relative overflow-hidden">
                                      <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=')] opacity-50"></div>
                                      <img src={autoUploadedSig} alt="Semnatura Incarcata" className="max-h-28 object-contain relative z-10 drop-shadow-sm" />
                                    </div>
                                    <button type="button" onClick={() => setAutoUploadedSig(null)} className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest flex items-center gap-1.5 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                      Șterge & Reîncarcă
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                          <div className="flex justify-center">
                            <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} onSuccess={setCaptchaToken} options={{ theme: 'dark', size: 'invisible' }} />
                          </div>
                        )}

                        <div className="pt-4 pb-2">
                          <label className="flex items-start cursor-pointer group bg-[#12181D]/30 p-4 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                            <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                              <input type="checkbox" checked={acordGdpr} onChange={e => setAcordGdpr(e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-slate-600 rounded bg-[#0B0F12] checked:bg-[#8ba888] checked:border-[#8ba888] transition-all cursor-pointer shadow-inner" />
                              <svg className="absolute w-3.5 h-3.5 text-[#0B0F12] opacity-0 peer-checked:opacity-100 pointer-events-none stroke-current" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <span className="ml-3 text-[11px] text-slate-400 leading-relaxed select-none">
                              Sunt de acord cu <Link href="/termeni-si-conditii" target="_blank" className="text-[#8ba888] hover:underline font-semibold">Termenii și Condițiile</Link> și înțeleg că documentele încărcate sunt procesate volatil pentru OCR. Datele <strong>NU</strong> sunt stocate permanent, conform <Link href="/politica-si-confidentialitate" target="_blank" className="text-[#8ba888] hover:underline font-semibold">Politicii de Confidențialitate (GDPR)</Link>.
                            </span>
                          </label>
                        </div>
                        
                        <div className="flex flex-col-reverse sm:flex-row justify-between items-center pt-8 border-t border-slate-800/80 gap-4 sm:gap-0">
                          <button type="button" onClick={handleInapoiPrincipal} className="text-xs font-semibold text-slate-400 hover:text-white transition-colors underline underline-offset-4 order-2 sm:order-1">
                            Anulează și întoarce-te
                          </button>
                          <button type="submit" disabled={isUploading || !!loadingText} className="w-full sm:w-auto bg-gradient-to-r from-[#8ba888] to-[#6d8a6a] text-black font-black px-10 py-4 rounded-xl text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(139,168,136,0.3)] hover:shadow-[0_0_25px_rgba(139,168,136,0.5)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 order-1 sm:order-2">
                            {loadingText ? (
                              <>
                                 <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                 <span>Se Procesează Arhiva...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                {user?.status === 'founder' 
                                  ? 'Generează Pachet Auto (.ZIP)' 
                                  : `Generează Pachet Auto (.ZIP) - ${autoData.autoMoneda === 'EUR' ? `${Math.round(99 / cursBnr.eur)} EUR` : '19.99 €'}`
                                }
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {autoStep === 'success' && (
                      <div className="bg-[#0c1014] border border-emerald-500/30 p-10 rounded-2xl text-center space-y-6 shadow-[0_0_50px_rgba(52,211,153,0.05)]">
                        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-4xl font-bold shadow-[0_0_20px_rgba(52,211,153,0.2)]">✓</div>
                        <div>
                          <h4 className="text-2xl font-black text-white tracking-tight">Pachetul Auto a fost generat!</h4>
                          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">Verifică folderul de descărcări. Arhiva `.ZIP` conține cele 5 exemplare oficiale DITL, procesul-verbal avocațial cu km garantați și ghidul procedural post-vânzare.</p>
                        </div>
                        <div className="flex justify-center mt-8">
                          <button type="button" onClick={() => { setAutoStep('upload'); setStep(1); }} className="text-sm font-bold text-[#8ba888] hover:text-white flex items-center gap-2 transition-colors bg-[#12181D] px-6 py-3 rounded-xl border border-slate-700/60 hover:border-[#8ba888]/50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Finalizează și întoarce-te la Panou
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>

            {/* WIDGET-URI (DOAR LA B2B) ȘI PREȚURI (LA B2B ȘI AUTO) */}
            <div className="w-full">
              
              {/* Afișăm Widget-urile doar dacă NU suntem la Auto */}
              {formData.tipContract !== 'auto' && (
                <div className="max-w-6xl mx-auto mt-16 mb-12 px-4">
                  <div className="text-center mb-12">
                    <h3 className="text-2xl font-black text-white uppercase tracking-wider">Instrumente Utile pentru Contractul Tău</h3>
                    <p className="text-sm text-slate-400 mt-2">Verifică partenerul la ANAF sau calculează taxele aplicabile contractului.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-8 items-stretch">
                    
                    {/* WIDGET ANAF */}
                    <div className="w-full max-w-2xl mx-auto">
                    <div className="w-full">
                      <div className="bg-[#12181D] rounded-2xl border border-slate-800/80 shadow-xl p-6 md:p-8 flex flex-col items-center relative overflow-hidden h-full">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#8ba888]/5 rounded-full blur-3xl pointer-events-none"></div>
                        
                        <div className="w-full relative z-10 mb-6 border-b border-slate-800/80 pb-6 text-center">
                          <h3 className="text-sm font-bold text-[#8ba888] uppercase tracking-wider block mb-2">Verificare Firmă ANAF</h3>
                          <p className="text-[11px] text-slate-400 leading-relaxed">Interoghează rapid orice companie din România și descarcă raportul financiar.</p>
                        </div>
                        
                        <div className="w-full relative z-10 flex flex-col justify-center flex-1">
                          
                          {/* FORMULAR CĂUTARE - AJUSTAT PENTRU MOBILE & DESKTOP */}
                          <form onSubmit={handleCautareCuiWidget} className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto mb-6">
                            <input 
                              type="text" 
                              placeholder="Introdu CUI (ex: 123456)" 
                              value={cuiSearch} 
                              onChange={e => setCuiSearch(e.target.value)} 
                              className="w-full sm:w-7/12 bg-[#0B0F12] border border-slate-700 rounded-xl p-3.5 text-sm text-white font-mono outline-none focus:border-[#8ba888] transition text-center shadow-inner" 
                              required 
                            />
                            <button 
                              type="submit" 
                              disabled={isSearchingCui} 
                              className="w-full sm:w-5/12 bg-[#8ba888] text-[#0B0F12] font-black px-2 py-3.5 rounded-xl text-sm transition hover:opacity-90 shadow-md shadow-[#8ba888]/20"
                            >
                              {isSearchingCui ? 'Se caută...' : 'Caută la ANAF'}
                            </button>
                          </form>

                          {!cuiDataResult ? (
                            <div className="w-full max-w-md mx-auto py-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-800/60 rounded-xl bg-[#0B0F12]/30 text-slate-500">
                              <svg className="w-6 h-6 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                              <span className="text-[10px] font-bold uppercase tracking-wider">Așteaptă Căutarea</span>
                            </div>
                          ) : (
                            <div className="w-full max-w-md mx-auto bg-[#0B0F12] border border-slate-700 rounded-xl p-5 animate-fadeIn text-left">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="text-sm font-bold text-white uppercase pr-2">{cuiDataResult.denumire}</h4>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                                    <span className="text-[11px] text-slate-400 font-mono">CUI: <strong className="text-white">{cuiDataResult.cui}</strong></span>
                                    {(cuiDataResult.nrRegCom || cuiDataResult.numar_reg_com || cuiDataResult.reg_com) && (
                                      <span className="text-[11px] text-slate-400 font-mono">
                                        Reg: <strong className="text-white">{cuiDataResult.nrRegCom || cuiDataResult.numar_reg_com || cuiDataResult.reg_com}</strong>
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase shrink-0 mt-0.5 ${cuiDataResult.stare?.toLowerCase().includes('inactiv') || cuiDataResult.stare?.toLowerCase().includes('radiat') ? 'bg-red-900/40 text-red-400 border border-red-900' : 'bg-emerald-900/40 text-emerald-400 border border-emerald-900'}`}>
                                  {cuiDataResult.stare || 'Necunoscut'}
                                </span>
                              </div>
                              
                              {cuiDataResult.adresa && (
                                <div className="mb-5 mt-4 text-[11px] text-slate-400 bg-[#12181D] p-3 rounded-lg border border-slate-800/80 leading-relaxed">
                                  <strong className="text-slate-500 uppercase text-[9px] block mb-1">Sediu Social Declarat:</strong>
                                  {cuiDataResult.adresa}
                                </div>
                              )}

                              <button onClick={(e) => { e.preventDefault(); handleReportAction(); }} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold py-3.5 rounded-lg text-xs transition shadow-lg">
                                {buttonText}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    </div>

                    {/* CALCULATOR FISCAL */}
                    <div className="w-full">
                      <div className="bg-[#12181D] rounded-2xl border border-slate-800/80 shadow-xl p-6 flex flex-col justify-between h-full">
                        <div>
                          <div className="flex items-center gap-3 mb-6 border-b border-slate-800/80 pb-4">
                            <span className="text-3xl"></span>
                            <div>
                              <h4 className="text-[#8ba888] font-bold text-sm">CALCULATOR FISCAL 2026</h4>
                              <p className="text-[11px] text-slate-400">Plafoane CASS & Impozit</p>
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="text-slate-400 text-[10px] font-bold uppercase">Valoare Factură / Venit</label>
                                <span className="text-[#8ba888] font-mono text-[11px] font-bold">{fiscal.venitLunar} RON</span>
                              </div>
                              <input type="range" min="0" max="50000" step="1" value={fiscal.venitLunar} onChange={e => setFiscal({...fiscal, venitLunar: Number(e.target.value)})} className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-[#8ba888]" />
                              <div className="mt-3 flex items-center gap-2">
                                <input type="number" min="0" max="50000" value={fiscal.venitLunar} onChange={e => setFiscal({...fiscal, venitLunar: Number(e.target.value)})} className="w-full p-2 bg-[#0B0F12] text-white rounded border border-slate-700 focus:outline-none focus:border-[#8ba888] text-xs" placeholder="Introdu suma..." />
                                <span className="text-gray-400 font-medium text-xs">RON</span>
                              </div>
                            </div>
                          
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-slate-400 text-[10px] font-bold uppercase mb-1 block">Formă Juridică</label>
                                <select value={fiscal.formaJuridica} onChange={e => setFiscal({...fiscal, formaJuridica: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700 rounded-lg py-2.5 px-3 text-white outline-none text-xs">
                                  <option value="SRL">SRL (Microîntreprindere)</option>
                                  <option value="PFA_SISTEM_REAL">PFA (Sistem Real)</option>
                                </select>
                              </div>
                              {fiscal.formaJuridica !== 'PFA_SISTEM_REAL' && (
                                <div className="flex gap-2 items-end">
                                  <label className="flex-1 flex items-center justify-center bg-[#0B0F12] h-[36px] rounded-lg border border-slate-800 cursor-pointer text-[10px] text-white hover:bg-slate-900 transition">
                                    <input type="checkbox" checked={fiscal.areAngajati} onChange={e => setFiscal({...fiscal, areAngajati: e.target.checked})} className="mr-1.5 accent-[#8ba888]" /> Angajați
                                  </label>
                                  <label className="flex-1 flex items-center justify-center bg-[#0B0F12] h-[36px] rounded-lg border border-slate-800/60 cursor-pointer text-[10px] text-white hover:bg-slate-900 transition">
                                    <input type="checkbox" checked={fiscal.platitorTva} onChange={e => setFiscal({...fiscal, platitorTva: e.target.checked})} className="mr-1.5 accent-[#8ba888]" /> TVA
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-800/50">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 font-mono text-[11px]">
                            <div className="bg-[#0B0F12] p-3 rounded-lg border border-slate-800/40 flex flex-col justify-center">
                              <span className="text-slate-500 text-[10px] block mb-1">Impozit micro:</span>
                              <span className="text-slate-200 font-bold">{rezultateFiscale.defalcare.impozit} RON</span>
                            </div>
                            <div className="bg-[#0B0F12] p-3 rounded-lg border border-slate-800/40 flex flex-col justify-center">
                              <span className="text-slate-500 text-[10px] block mb-1">CAS/CASS:</span>
                              <span className="text-slate-200 font-bold">{rezultateFiscale.defalcare.sociale} RON</span>
                            </div>
                            {fiscal.formaJuridica === 'SRL' && (
                              <div className="bg-[#0B0F12] p-3 rounded-lg border border-slate-800/40 flex flex-col justify-center">
                                <span className="text-slate-500 text-[10px] block mb-1">Dividende(10%):</span>
                                <span className="text-slate-200 font-bold">{rezultateFiscale.defalcare.dividende} RON</span>
                              </div>
                            )}
                            {fiscal.platitorTva && (
                              <div className="bg-[#0B0F12] p-3 rounded-lg border border-slate-800/40 flex flex-col justify-center">
                                <span className="text-slate-500 text-[10px] block mb-1">TVA (21%):</span>
                                <span className="text-slate-200 font-bold">{rezultateFiscale.tvaLunar} RON</span>
                              </div>
                            )}
                          </div>
                          <div className="bg-[#16221A] border border-[#8ba888]/30 p-4 rounded-xl flex justify-between items-center">
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Dări Stat (Total Lunar)</span>
                              <strong className="text-red-400 font-mono text-sm">{rezultateFiscale.taxeLunare} RON</strong>
                            </div>
                            <div className="text-right">
                              <span className="text-[#8ba888] block text-[10px] uppercase font-bold mb-0.5">Profit Curat Net / Lună</span>
                              <strong className="text-white text-xl font-mono tracking-tight">{rezultateFiscale.netLunar} RON</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>
              )}

              {/* Tabelul de prețuri apare mereu la finalul Step 2 (și la B2B și la Auto) */}
              <div className="mt-8">
                {renderCarduriPreturi()}
              </div>

            </div>
          </div>
        )}

        {/* QR CODE REDIRECT STEP 2 */}
        {step === 2 && qrGeneratedUrl && qrGeneratedUrl.includes('/semneaza/') && (
          <div className="max-w-3xl mx-auto mt-6 p-6 bg-[#12181D] border border-slate-800 rounded-lg flex flex-col items-center justify-center text-center shadow-lg">
            <h3 className="text-lg font-bold text-[#8ba888] mb-2">Contractul a fost publicat</h3>
            <p className="text-xs text-slate-400 mb-4">Scanează codul QR pentru a deschide direct fluxul electronic de semnare:</p>
            <div className="p-4 bg-white border rounded shadow-md">
              <QRCodeSVG value={qrGeneratedUrl} size={150} />
            </div>
            <p className="text-xs text-slate-500 mt-3 font-mono">URL Securizat: <a href={qrGeneratedUrl} target="_blank" rel="noreferrer" className="underline text-[#8ba888]">{qrGeneratedUrl}</a></p>
          </div>
        )}

        {/* FOOTER GENERAL CENTRAT */}
        <footer className="relative z-10 border-t border-slate-800 bg-[#0B0F12] pt-12 pb-8 mt-16 text-center">
          <div className="max-w-5xl mx-auto px-6 space-y-6">
            <div className="flex justify-center">
              <div className="w-[180px] h-[30px] cursor-pointer" onClick={handleInapoiPrincipal}>
                <svg viewBox="0 0 240 52" className="w-full h-full mx-auto">
                  <g transform="translate(0, 6)">
                    <path d="M24 6 C15 6, 8 13, 8 22 C8 31, 15 38, 24 38 C31 38, 37 33, 39 27" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round"/>
                    <path d="M16 21 L21 26 L32 12" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <text x="48" y="34" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="22" fill="#FFFFFF" letterSpacing="-0.5">
                    Contract<tspan fill="#8ba888">Smart</tspan>
                  </text>
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Infrastructură electronică avansată dedicată optimizării micro-sistemelor, înmatriculării rapide a entităților comerciale și auditului de clauze pe Codul Civil român.
              </p>
              <div className="flex justify-center space-x-6 text-xs text-slate-400 font-medium">
              <Link href="/termeni-si-conditii" className="hover:text-[#8ba888] transition">Termeni și Condiții</Link>
              <span>•</span>
              <Link href="/politica-si-confidentialitate" className="hover:text-[#8ba888] transition">Confidențialitate</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-[#8ba888] transition">Contact</Link>
            </div>
            <div className="pt-6 border-t border-slate-800/40 flex flex-col items-center gap-4">
              <p className="text-[10px] text-slate-500 font-mono max-w-3xl text-center leading-relaxed px-4">
                <strong className="text-red-500">Disclaimer Legal!</strong> <strong className="text-[#8ba888]">ContractSmart</strong> este o platformă de software. <strong className="text-red-500">NU</strong> suntem o casă de avocatură și nu oferim consultanță juridică. Utilizarea platformei reprezintă acceptarea faptului că modelele generate necesită revizuirea de către un specialist.
              </p>
              <p className="text-[11px] text-slate-500 font-mono">© 2026 <strong className="text-[#8ba888]">ContractSmart</strong>. Powered by <strong className="text-[#8ba888]">ZenSoftWare</strong>. Toate drepturile rezervate legal.</p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}