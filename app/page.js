'use client';
import './globals.css';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { createClient } from '@supabase/supabase-js';
import { Turnstile } from '@marsidev/react-turnstile';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

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
    { id: 'clauzaTranspStationare', titlu: '21. Taxă de Staționare / Demurrage', detaliu: 'Depășirea timpului alocat pentru operațiunile de încărcare/descărcare la rampă atrage aplicarea unei taxe fixe de staționare, calculată pe fiecare oră de imobilizare a autovehiculului.' }
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
    { id: 'clauzaMarketingTerti', titlu: '5. Drept Portofoliu & Marketing', detaliu: 'Prestatorul își rezervă dreptul de a utiliza elemente din lucrare în portofoliul public.' }
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
  one_time_contract: 'https://zensoftware.gumroad.com/l/contract-b2b'
};

export default function Home() {
  const [loadingText, setLoadingText] = useState(null);
  const [step, setStep] = useState(1);
  const [autoStep, setAutoStep] = useState('upload');
  const [hydrated, setHydrated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [captchaToken, setCaptchaToken] = useState(null); 
  const isProcessingForm = useRef(false);

  // STATE-URI MEGA QR
  const [qrType, setQrType] = useState('url'); 
  const [qrUrl, setQrUrl] = useState('');
  const [wifiData, setWifiData] = useState({ ssid: '', password: '', type: 'WPA' });
  const [waData, setWaData] = useState({ phone: '', message: '' });
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

  const [anafCui, setAnafCui] = useState('');

  const [fiscal, setFiscal] = useState({
    venitLunar: 45000,
    formaJuridica: 'SRL', 
    platitorTva: false,
    areAngajati: true,
    normaRegiune: 45000
  });

  const [formData, setFormData] = useState({
    tipContract: 'prestari', 
    initiatorRol: 'prestator', 
    prestatorNume: '', prestatorCui: '', prestatorEmail: '', prestatorLogo: '', prestatorCuloare: '#8ba888',
    clientNume: '', clientCui: '', clientEmail: '',
    obiect: '', valoare: '', moneda: 'RON', emiteFacturaAvans: false,
    estePlatitorTVA: false,
    clauzaPi: true, clauzaPenalitati: true, clauzaRevizii: false, tarifOrar: '150',
    clauzaRawFoto: false, clauzaMarketingTerti: false, clauzaAprobareTacita: false, clauzaTaxaAnulare: false,
    clauzaSplitPayment: false, clauzaRetentie: false,
    clauzaLimitareRaspundere: false, clauzaInflatie: false, adaugaProcesVerbal: false
  });

  const [autoDocs, setAutoDocs] = useState({ civ: null, buletin_vanzator: null, buletin_cumparator: null, talon: null });
  const [isUploading, setIsUploading] = useState(false);

  const [scrollPercent, setScrollPercent] = useState(0);

  // Semnătura Upgrade
  const [signatureTab, setSignatureTab] = useState('draw'); // 'draw' | 'upload'
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const [uploadedSignature, setUploadedSignature] = useState(null);

  const [autoData, setAutoData] = useState({
    vanzatorTip: 'PF', 
    vanzatorNume: '', vanzatorCnp: '', vanzatorCui: '', vanzatorRegCom: '', vanzatorSediu: '',
    cumparatorTip: 'PF', 
    cumparatorNume: '', cumparatorCnp: '', cumparatorCui: '', cumparatorRegCom: '', cumparatorSediu: '',
    autoVin: '', autoMarcaModel: '', autoNumarInmatriculare: '', autoPret: '', clientEmail: '',
    autoAdresaVanzator: '', autoAdresaCumparator: '', pretIncludeTVA: false, autoMoneda: 'RON'
  });

  const getQrValue = () => {
    if (qrType === 'vcard') return `BEGIN:VCARD\nVERSION:3.0\nFN:${qrData.nume}\nTITLE:${qrData.functie}\nTEL:${qrData.telefon}\nEMAIL:${qrData.email}\nEND:VCARD`;
    if (qrType === 'wifi') return `WIFI:T:${wifiData.type};S:${wifiData.ssid};P:${wifiData.password};;`;
    if (qrType === 'whatsapp') return `https://wa.me/${waData.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waData.message)}`;
    if (['dynamic', 'smart', 'geo', 'landing'].includes(qrType)) return generatedDynamicUrl || 'https://contractsmart.ro';
    return qrUrl || 'https://contractsmart.ro';
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
    
    // Curăță ecranul de loading dacă utilizatorul dă "Back" din browser (BFCache)
    const handlePageShow = (e) => {
      if (e.persisted) {
        setLoadingText(null);
        isProcessingForm.current = false;
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

  const handleInapoiPrincipal = () => {
    setStep(1);
    setAutoStep('upload');
    setFormData({ tipContract: 'prestari', initiatorRol: 'prestator', prestatorNume: '', prestatorCui: '', prestatorEmail: '', prestatorLogo: '', prestatorCuloare: '#8ba888', clientNume: '', clientCui: '', clientEmail: '', obiect: '', valoare: '', moneda: 'RON', emiteFacturaAvans: false, estePlatitorTVA: false, clauzaPi: true, clauzaPenalitati: true, clauzaRevizii: false, tarifOrar: '150', clauzaRawFoto: false, clauzaMarketingTerti: false, clauzaAprobareTacita: false, clauzaTaxaAnulare: false, clauzaSplitPayment: false, clauzaRetentie: false, clauzaLimitareRaspundere: false, clauzaInflatie: false, adaugaProcesVerbal: false });
    curataCanvas();
    setAutoData({ vanzatorTip: 'PF', vanzatorNume: '', vanzatorCnp: '', vanzatorCui: '', vanzatorRegCom: '', vanzatorSediu: '', cumparatorTip: 'PF', cumparatorNume: '', cumparatorCnp: '', cumparatorCui: '', cumparatorRegCom: '', cumparatorSediu: '', autoVin: '', autoMarcaModel: '', autoNumarInmatriculare: '', autoPret: '', clientEmail: '', autoAdresaVanzator: '', autoAdresaCumparator: '', pretIncludeTVA: false, autoMoneda: 'RON' });
    setAutoDocs({ civ: null, buletin_vanzator: null, buletin_cumparator: null, talon: null });
  };

  useEffect(() => {
    const fetchUserProfile = async (userId, email) => {
      try {
        const { data: profile } = await supabase.from('profiles').select('subscription_tier, credits_remaining, has_qr_branding, has_qr_vcard, has_qr_dynamic, has_qr_pdf, is_pro, is_enterprise').eq('id', userId).single();
        setUser({ 
          id: userId, 
          email: email, 
          status: profile?.subscription_tier || 'free', 
          credits: profile?.credits_remaining ?? 0 
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
    const actualizeazaIndiciLive = async () => {
      try {
        const targetUrl = encodeURIComponent('https://query1.finance.yahoo.com/v7/finance/quote?symbols=^BET,^GSPC,^IXIC');
        const res = await fetch(`https://api.allorigins.win/get?url=${targetUrl}`);
        if (!res.ok) return;
        const wrapper = await res.json();
        const data = typeof wrapper.contents === 'string' ? JSON.parse(wrapper.contents) : wrapper.contents;
        const quotes = data?.quoteResponse?.result;

        if (quotes && quotes.length > 0) {
          const betQuote = quotes.find(q => q.symbol === '^BET') || quotes[0];
          const sp500Quote = quotes.find(q => q.symbol === '^GSPC') || quotes[1];
          const nasdaqQuote = quotes.find(q => q.symbol === '^IXIC') || quotes[2];

          setIndiciBursa({
            bet: {
              puncte: betQuote?.regularMarketPrice?.toLocaleString('ro-RO') || '17,420.50',
              procent: (betQuote?.regularMarketChangePercent >= 0 ? '+' : '') + (betQuote?.regularMarketChangePercent?.toFixed(2) || '0.00') + '%'
            },
            sp500: {
              puncte: sp500Quote?.regularMarketPrice?.toLocaleString('ro-RO') || '5,310.12',
              procent: (sp500Quote?.regularMarketChangePercent >= 0 ? '+' : '') + (sp500Quote?.regularMarketChangePercent?.toFixed(2) || '0.00') + '%'
            },
            nasdaq: {
              puncte: nasdaqQuote?.regularMarketPrice?.toLocaleString('ro-RO') || '18,650.45',
              procent: (nasdaqQuote?.regularMarketChangePercent >= 0 ? '+' : '') + (nasdaqQuote?.regularMarketChangePercent?.toFixed(2) || '0.00') + '%'
            }
          });
        }
      } catch (err) {}
    };

    actualizeazaIndiciLive();
    const interval = setInterval(actualizeazaIndiciLive, 30000);
    return () => clearInterval(interval);
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
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    
    const localFormData = new FormData();
    localFormData.append('file', file);
    localFormData.append('tipDocument', tipDoc);

    try {
      const res = await fetch('/api/auto/upload-ocr', { method: 'POST', body: localFormData });
      const data = await res.json();
      
      if (data.success) {
        setAutoDocs(prev => ({ ...prev, [tipDoc]: data.fileUrl }));
        
        let dateFinale = data.extractedData || null;

        if (dateFinale) {
          setAutoData(prev => {
            let updated = { ...prev };
            if (tipDoc === 'civ' || tipDoc === 'talon') {
              updated.autoVin = dateFinale.autoVin || prev.autoVin;
              updated.autoMarcaModel = dateFinale.autoMarcaModel || prev.autoMarcaModel;
              updated.autoNumarInmatriculare = dateFinale.autoNumarInmatriculare || prev.autoNumarInmatriculare;
            } 
            else if (tipDoc === 'buletin_cumparator') {
              updated.cumparatorNume = dateFinale.autoNumeVanzator || prev.cumparatorNume;
              updated.cumparatorCnp = dateFinale.autoCnpVanzator || prev.cumparatorCnp;
              updated.autoAdresaCumparator = dateFinale.autoAdresaVanzator || prev.autoAdresaCumparator;
            } 
            else {
              updated.vanzatorNume = dateFinale.autoNumeVanzator || prev.vanzatorNume;
              updated.vanzatorCnp = dateFinale.autoCnpVanzator || prev.vanzatorCnp;
              updated.autoAdresaVanzator = dateFinale.autoAdresaVanzator || prev.autoAdresaVanzator;
            }
            return updated;
          });
          alert(`Documentul ${tipDoc.toUpperCase()} a fost citit cu succes!`);
        } else {
          alert('Modelul AI nu a putut extrage datele complet. Reîncearcă.');
        }
      } else {
        alert('Eroare la încărcarea fișierului pe server.');
      }
    } catch (err) {
      alert('Eroare tehnică la procesarea optică.');
    } finally {
      setIsUploading(false);
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

    try {
      const binarFormData = new FormData();
      const secureAutoDataPayload = {
        ...autoData,
        clientEmail: user.email,
        userId: user.id, 
        pretIncludeTVA: autoData.pretIncludeTVA,
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
        setAutoData({ vanzatorTip: 'PF', vanzatorNume: '', vanzatorCnp: '', vanzatorCui: '', vanzatorRegCom: '', vanzatorSediu: '', cumparatorTip: 'PF', cumparatorNume: '', cumparatorCnp: '', cumparatorCui: '', cumparatorRegCom: '', cumparatorSediu: '', autoVin: '', autoMarcaModel: '', autoNumarInmatriculare: '', autoPret: '', clientEmail: '', autoAdresaVanzator: '', autoAdresaCumparator: '', pretIncludeTVA: false, autoMoneda: 'RON' });
        setAutoDocs({ civ: null, buletin_vanzator: null, buletin_cumparator: null, talon: null });
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
      {/* 📈 BARA TICKER DINAMICĂ LIVE */}
      <div className="w-full bg-[#12181D] border-b border-slate-800 text-[11px] text-slate-400 py-2 overflow-hidden whitespace-nowrap relative z-50 flex">
        <div className="animate-marquee font-mono flex gap-12 items-center shrink-0 min-w-full justify-around pr-6">
          <span>📈 <strong>EUR/RON:</strong> {cursBnr.eur} lei</span>
          <span>🇺🇸 <strong>USD/RON:</strong> {cursBnr.usd} lei</span>
          <span>📊 <strong>BET Index (BVB):</strong> {indiciBursa.bet.puncte} ({indiciBursa.bet.procent})</span>
          <span>📊 <strong>S&P 500 (US):</strong> {indiciBursa.sp500.puncte} ({indiciBursa.sp500.procent})</span>
        </div>
        <div className="animate-marquee font-mono flex gap-12 items-center shrink-0 min-w-full justify-around pr-6 select-none" aria-hidden="true">
          <span>📈 <strong>EUR/RON:</strong> {cursBnr.eur} lei</span>
          <span>🇺🇸 <strong>USD/RON:</strong> {cursBnr.usd} lei</span>
          <span>📊 <strong>BET Index (BVB):</strong> {indiciBursa.bet.puncte} ({indiciBursa.bet.procent})</span>
          <span>📊 <strong>S&P 500 (US):</strong> {indiciBursa.sp500.puncte} ({indiciBursa.sp500.procent})</span>
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#0B0F12]/90 border-b border-slate-800 py-4 px-6 shadow-md transition-all">
        <div className="flex justify-between items-center">
          <div className="w-[180px] h-[30px] flex items-center cursor-pointer" onClick={handleInapoiPrincipal}>
            <svg viewBox="0 0 240 40" className="w-full h-full">
              <g transform="translate(0, 2)">
                <path d="M24 6 C15 6, 8 13, 8 22 C8 31, 15 38, 24 38 C31 38, 37 33, 39 27" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round"/>
                <path d="M16 21 L21 26 L32 12" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <text x="48" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="20" fill="#FFFFFF" letterSpacing="-0.5">
                Contract<tspan fill="#8ba888">Smart</tspan>
              </text>
            </svg>
          </div>
          
          <button 
            className="md:hidden text-[#8ba888] text-2xl focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>

          <div className="hidden md:flex items-center space-x-5">
            <Link href="/modele-contracte" className="text-xs text-slate-400 hover:text-white transition">Modele Contracte Standard</Link>
            <span className="text-slate-800">|</span>
            <Link href="/baza-legala" className="text-xs text-slate-400 hover:text-white transition">Articole Validitate Juridică</Link>
            <span className="text-slate-800">|</span>
            <Link href="/termeni-si-conditii" className="text-xs text-slate-400 hover:text-white transition">Termeni și Condiții</Link>
            <span className="text-slate-800">|</span>
            <Link href="/contact" className="text-xs text-slate-400 hover:text-white transition">Contact</Link>
            <span className="text-slate-800">|</span>
            
            {!user ? (
              <button type="button" onClick={() => { setIsSignUp(false); setShowAuthModal(true); }} className="text-xs font-bold text-slate-300 hover:text-[#8ba888] transition">Autentificare / Cont Nou</button>
            ) : (
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-slate-400 flex items-center gap-2">
                  <span>Cont: <strong className="text-white font-mono font-normal">{user.email}</strong></span>
                  <span className="text-[10px] uppercase font-bold bg-[#16221A] text-[#8ba888] px-2 py-0.5 rounded border border-emerald-900/40">
                    {user.status}
                  </span>
                  {!isPremium && (
                    <span className="text-[10px] uppercase font-bold bg-amber-900/20 text-amber-500 px-2 py-0.5 rounded border border-amber-900/50">
                      {user.credits} CREDITE
                    </span>
                  )}
                </span>
                <button type="button" onClick={handleLogout} className="text-slate-300 hover:text-white font-bold hover:underline">Ieșire</button>
                <span className="text-slate-800">|</span>
                <button type="button" onClick={stergeCont} className="text-red-500 font-bold hover:underline">Șterge Cont</button>
              </div>
            )}
            <button onClick={() => { const el = document.getElementById('sectiune-preturi'); el?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-[#8ba888] hover:opacity-90 text-[#0B0F12] font-black text-xs px-4 py-2 rounded-md transition shadow-md shadow-[#8ba888]/10">Vezi Oferte</button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden flex flex-col space-y-4 pt-4 mt-4 border-t border-slate-800 animate-fadeIn">
            <Link href="/modele-contracte" className="text-sm text-slate-300 hover:text-white">Modele Contracte Standard</Link>
            <Link href="/baza-legala" className="text-sm text-slate-300 hover:text-white">Articole Validitate Juridică</Link>
            <Link href="/termeni-si-conditii" className="text-sm text-slate-300 hover:text-white">Termeni și Condiții</Link>
            <Link href="/contact" className="text-sm text-slate-300 hover:text-white">Contact</Link>
            
            {!user ? (
              <button type="button" onClick={() => { setIsMobileMenuOpen(false); setIsSignUp(false); setShowAuthModal(true); }} className="text-sm font-bold text-[#8ba888] text-left">Autentificare / Cont Nou</button>
            ) : (
              <div className="flex flex-col space-y-2 border-t border-slate-800/50 pt-2">
                <span className="text-xs text-slate-400">Logat ca: {user.email}</span>
                <div className="flex space-x-4 pt-1">
                  <button type="button" onClick={handleLogout} className="text-slate-300 text-sm font-bold text-left hover:text-white">Ieșire</button>
                  <button type="button" onClick={stergeCont} className="text-red-500 text-sm font-bold text-left hover:underline">Șterge Cont</button>
                </div>
              </div>
            )}
            <button onClick={() => { setIsMobileMenuOpen(false); const el = document.getElementById('sectiune-preturi'); el?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-[#8ba888] text-[#0B0F12] font-black text-sm px-4 py-3 rounded-md text-center">Vezi Oferte</button>
          </div>
        )}
      </nav>

      {/* AMBIENT BLOBS */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-clip">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#8ba888]/5 blur-[100px] transform-gpu" style={{ top: 'calc(10% + (var(--scroll-y) * 0.3))', left: '15%' }} />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-slate-700/5 blur-[120px] transform-gpu" style={{ top: 'calc(50% - (var(--scroll-y) * 0.2))', right: '10%' }} />
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
              <h3 className="text-xl font-black text-white mb-1">{isSignUp ? 'Creează un Cont Nou' : 'Autentificare Portabilitate'}</h3>
              <p className="text-xs text-slate-500 mb-6">Securizează documentele în serverele Supabase.</p>
              
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Adresă de Email</label>
                  <input type="email" required placeholder="nume@companie.ro" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full p-3 bg-[#0B0F12] border border-slate-700 rounded-md text-xs text-white outline-none focus:border-[#8ba888]" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Parolă Validă</label>
                  <input type="password" required placeholder="••••••••" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full p-3 bg-[#0B0F12] border border-slate-700 rounded-md text-xs text-white outline-none focus:border-[#8ba888]" />
                </div>
                {isSignUp && (
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Confirmă Parola</label>
                    <input type="password" required placeholder="••••••••" value={authConfirmPassword} onChange={e => setAuthConfirmPassword(e.target.value)} className="w-full p-3 bg-[#0B0F12] border border-slate-700 rounded-md text-xs text-white outline-none focus:border-[#8ba888]" />
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

        {/* STEP 1: DASHBOARD / HOME */}
        {step === 1 && (
          <div className="w-full">
            <div className="max-w-4xl mx-auto text-center py-16 px-4">
              <span className="hidden md:inline-block bg-[#16221A] text-[#8ba888] border border-[#8ba888]/20 text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase">
                Infrastructură Electronică de Securizare Comercială
              </span>
              <div className="flex md:hidden flex-wrap justify-center gap-2">
                <span className="bg-[#16221A] text-[#8ba888] border border-[#8ba888]/20 text-[10px] sm:text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase">
                  Infrastructură Electronică
                </span>
                <span className="bg-[#16221A] text-[#8ba888] border border-[#8ba888]/20 text-[10px] sm:text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase">
                  de Securizare Comercială
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white mt-6 leading-tight tracking-tighter">Asigurarea Încasărilor <br/><span className="text-[#8ba888]">Privitor La Management de Clauze</span></h1>
              
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto px-4">
                <button type="button" onClick={() => { setFormData(prev => ({ ...prev, tipContract: 'prestari' })); setStep(2); }} className="bg-[#8ba888] text-[#0B0F12] font-black px-4 py-4 rounded-lg shadow-md shadow-[#8ba888]/5 transition text-xs tracking-tight flex items-center justify-center gap-2">
                    Generator Contracte B2B / Servicii
                </button>
                <button type="button" onClick={() => { setFormData(prev => ({ ...prev, tipContract: 'auto' })); setStep(2); }} className="bg-[#12181D] border border-slate-700 text-white font-bold px-4 py-4 rounded-lg hover:border-[#8ba888]/50 transition text-xs tracking-tight flex items-center justify-center gap-2">
                    Generator Pachet Acte Auto
                </button>
              </div>
            </div>

            {/* BENTO GRID: CALCULATOR FISCAL + QR CODE STUDIO */}
            <div className="max-w-6xl mx-auto px-6 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* COLOANA 1: CALCULATOR FISCAL */}
              <div className="bg-[#12181D] p-5 rounded-xl border border-slate-800 shadow-lg flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Calculator Fiscal Inteligent (Plafoane CASS)</span>
                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-slate-400 text-xs">Valoare Factură:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={fiscal.venitLunar === 0 ? '' : fiscal.venitLunar}
                            onChange={e => setFiscal({...fiscal, venitLunar: Number(e.target.value)})}
                            className="bg-[#0B0F12] border border-slate-700 rounded px-2 py-1 text-white font-mono font-bold text-xs w-24 text-right outline-none focus:border-[#8ba888] transition-colors"
                            placeholder="0"
                          />
                          <span className="text-slate-400 font-mono text-xs">RON</span>
                        </div>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="50000" 
                        step="1" 
                        value={fiscal.venitLunar} 
                        onChange={e => setFiscal({...fiscal, venitLunar: Number(e.target.value)})} 
                        className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#8ba888]" 
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <label className="text-slate-400 block mb-1">Formă de Organizare</label>
                        <select value={fiscal.formaJuridica} onChange={e => setFiscal({...fiscal, formaJuridica: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700 rounded p-2 text-white outline-none text-xs appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.2em_1.2em] bg-[right_0.7rem_center] bg-no-repeat pr-10">
                          <option value="SRL">SRL (Microîntreprindere)</option>
                          <option value="PFA_SISTEM_REAL">PFA (Sistem Real)</option>
                        </select>
                      </div>
                    </div>
                    {fiscal.formaJuridica !== 'PFA_SISTEM_REAL' && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <label className="flex items-center p-2 bg-[#0B0F12] rounded border border-slate-800 cursor-pointer">
                          <input type="checkbox" checked={fiscal.areAngajati} onChange={e => setFiscal({...fiscal, areAngajati: e.target.checked})} className="mr-2 accent-[#8ba888]" />
                          Are Angajați
                        </label>
                        <label className="flex items-center p-2 bg-[#0B0F12] rounded border border-slate-800/60 cursor-pointer">
                          <input type="checkbox" checked={fiscal.platitorTva} onChange={e => setFiscal({...fiscal, platitorTva: e.target.checked})} className="mr-2 accent-[#8ba888]" />
                          Plătitor TVA
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="w-full space-y-3 mt-4">
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 font-mono text-[11px]">
                    <div className="bg-[#0B0F12] p-2 rounded-md border border-slate-800/40">
                      <span className="text-slate-500 block">Impozit micro/venit:</span>
                      <span className="text-slate-300 font-bold">{rezultateFiscale.defalcare.impozit} RON</span>
                    </div>
                    <div className="bg-[#0B0F12] p-2 rounded-md border border-slate-800/40">
                      <span className="text-slate-500 block">Contribuții (CAS/CASS):</span>
                      <span className="text-slate-300 font-bold">{rezultateFiscale.defalcare.sociale} RON</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    {fiscal.formaJuridica === 'SRL' && (
                      <div className="bg-[#0B0F12] p-2 rounded-md border border-slate-800/40">
                        <span className="text-slate-500 block">Impozit Dividende (10%):</span>
                        <span className="text-slate-300 font-bold">{rezultateFiscale.defalcare.dividende} RON</span>
                      </div>
                    )}
                    
                    {fiscal.platitorTva && (
                       <div className="bg-[#0B0F12] p-2 rounded-md border border-slate-800/40">
                         <span className="text-slate-500 block">TVA Colectat (21%):</span>
                         <span className="text-slate-300 font-bold">{rezultateFiscale.tvaLunar} RON</span>
                       </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 bg-[#0B0F12] p-3 rounded-md border border-slate-800/60 flex justify-between items-center text-xs">
                    <div><span className="text-slate-400 block">Dări Stat (Total): <strong className="text-red-400 font-mono">{rezultateFiscale.taxeLunare} RON</strong></span></div>
                    <div className="text-right"><span className="text-slate-400 block">Profit Curat Net Lunar: <strong className="text-[#8ba888] font-mono text-sm">{rezultateFiscale.netLunar} RON</strong></span></div>
                  </div>
                </div>
              </div>

              {/* COLOANA 2: MEGA-QR CODE GENERATOR PRO */}
              <div className="bg-[#0B0F12] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-lg flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">ContractSmart QR ProStudio</span>
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">Generează, personalizează și urmărește codurile tale QR.</p>
                  </div>
                  <span className={`hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    profil?.subscription_tier === 'founder' ? 'bg-purple-900/30 text-purple-400 border border-purple-500/20' : 
                    isPremium ? 'bg-blue-900/30 text-blue-400 border border-blue-500/20' : 
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {profil?.subscription_tier || 'Free'} Plan
                  </span>
                </div>

                <div className="flex-1 flex flex-col space-y-6">
                  
                  {/* 1. SELECTOR FUNCȚIE QR */}
                  <div>
                    <label className="text-white font-semibold block mb-3 text-sm">1. Funcție Cod QR</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button onClick={() => setQrType('url')} className={`p-2 rounded border text-[11px] font-bold transition-all ${qrType === 'url' ? 'bg-[#8ba888]/10 border-[#8ba888] text-[#8ba888]' : 'bg-[#16221A]/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}>🌐 URL</button>
                      <button onClick={() => setQrType('wifi')} className={`p-2 rounded border text-[11px] font-bold transition-all ${qrType === 'wifi' ? 'bg-[#8ba888]/10 border-[#8ba888] text-[#8ba888]' : 'bg-[#16221A]/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}>📶 Wi-Fi</button>
                      <button onClick={() => setQrType('whatsapp')} className={`p-2 rounded border text-[11px] font-bold transition-all ${qrType === 'whatsapp' ? 'bg-[#8ba888]/10 border-[#8ba888] text-[#8ba888]' : 'bg-[#16221A]/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}>💬 WhatsApp</button>
                      
                      <button onClick={() => { if(!isPremium && !profil?.has_qr_vcard) handleCheckout('qr_vcard'); else setQrType('vcard'); }} className={`relative p-2 rounded border text-[11px] font-bold transition-all ${qrType === 'vcard' ? 'bg-[#8ba888]/10 border-[#8ba888] text-[#8ba888]' : 'bg-[#16221A]/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                        📇 vCard {(!isPremium && !profil?.has_qr_vcard) && <span className="absolute -top-2 -right-2 text-[9px] bg-amber-500 text-black px-1.5 rounded-full shadow-md">69 RON</span>}
                      </button>

                      <button onClick={() => { if(!isPremium && !profil?.has_qr_pdf) handleCheckout('qr_dynamic'); else setQrType('dynamic'); }} className={`relative p-2 rounded border text-[11px] font-bold transition-all ${qrType === 'dynamic' ? 'bg-purple-900/30 border-purple-500 text-purple-400' : 'bg-[#16221A]/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                        📄 Dinamic {(!isPremium && !profil?.has_qr_pdf) && <span className="absolute -top-2 -right-2 text-[9px] bg-purple-500 text-white px-1.5 rounded-full shadow-md">39 RON</span>}
                      </button>

                      <button onClick={() => { if(!isPremium) handleCheckout('pro'); else setQrType('smart'); }} className={`relative p-2 rounded border text-[11px] font-bold transition-all ${qrType === 'smart' ? 'bg-blue-900/30 border-blue-500 text-blue-400' : 'bg-[#16221A]/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                        📱 Smart OS {(!isPremium) && <span className="absolute -top-2 -right-2 text-[9px] bg-blue-500 text-white px-1.5 rounded-full shadow-md">PRO</span>}
                      </button>
                      
                      <button onClick={() => { if(!isPremium) handleCheckout('pro'); else setQrType('geo'); }} className={`relative p-2 rounded border text-[11px] font-bold transition-all ${qrType === 'geo' ? 'bg-blue-900/30 border-blue-500 text-blue-400' : 'bg-[#16221A]/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                        🌍 Geo-Target {(!isPremium) && <span className="absolute -top-2 -right-2 text-[9px] bg-blue-500 text-white px-1.5 rounded-full shadow-md">PRO</span>}
                      </button>
                      
                      <button onClick={() => { if(!isPremium) handleCheckout('pro'); else setQrType('landing'); }} className={`relative p-2 rounded border text-[11px] font-bold transition-all ${qrType === 'landing' ? 'bg-blue-900/30 border-blue-500 text-blue-400' : 'bg-[#16221A]/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                        🔗 Landing {(!isPremium) && <span className="absolute -top-2 -right-2 text-[9px] bg-blue-500 text-white px-1.5 rounded-full shadow-md">PRO</span>}
                      </button>
                    </div>
                  </div>

                  {/* 2. FORMULARE DINAMICE */}
                  <div>
                    <label className="text-white font-semibold block mb-3 text-sm">2. Configurare Conținut</label>
                    
                    {qrType === 'url' && (
                      <input type="text" placeholder="https://site-ul-tau.ro" value={qrUrl} onChange={(e) => setQrUrl(e.target.value)} className="w-full bg-[#12181D] border border-slate-700 rounded p-2.5 text-white text-sm focus:border-[#8ba888] outline-none" />
                    )}

                    {qrType === 'wifi' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" placeholder="Nume Rețea (SSID)" value={wifiData.ssid} onChange={(e) => setWifiData({...wifiData, ssid: e.target.value})} className="bg-[#12181D] border border-slate-700 rounded p-2.5 text-white text-sm focus:border-[#8ba888] outline-none" />
                        <input type="text" placeholder="Parolă Rețea" value={wifiData.password} onChange={(e) => setWifiData({...wifiData, password: e.target.value})} className="bg-[#12181D] border border-slate-700 rounded p-2.5 text-white text-sm focus:border-[#8ba888] outline-none" />
                        <select value={wifiData.type} onChange={e => setWifiData({...wifiData, type: e.target.value})} className="bg-[#12181D] border border-slate-700 rounded p-2.5 text-white text-sm outline-none sm:col-span-2">
                          <option value="WPA">Securitate WPA/WPA2</option>
                          <option value="WEP">Securitate WEP</option>
                          <option value="nopass">Fără parolă (Liber)</option>
                        </select>
                      </div>
                    )}

                    {qrType === 'whatsapp' && (
                      <div className="grid grid-cols-1 gap-3">
                        <input type="text" placeholder="Număr telefon (ex: 40712345678)" value={waData.phone} onChange={(e) => setWaData({...waData, phone: e.target.value})} className="bg-[#12181D] border border-slate-700 rounded p-2.5 text-white text-sm focus:border-[#8ba888] outline-none" />
                        <textarea placeholder="Mesaj predefinit (opțional)" value={waData.message} onChange={(e) => setWaData({...waData, message: e.target.value})} className="bg-[#12181D] border border-slate-700 rounded p-2.5 text-white text-sm focus:border-[#8ba888] outline-none resize-none h-16"></textarea>
                      </div>
                    )}

                    {qrType === 'vcard' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" placeholder="Nume Complet" value={qrData.nume} onChange={(e) => setQrData({...qrData, nume: e.target.value})} className="bg-[#12181D] border border-slate-700 rounded p-2.5 text-white text-sm focus:border-[#8ba888] outline-none sm:col-span-2" />
                        <input type="text" placeholder="Funcție / Titlu (ex: Manager)" value={qrData.functie} onChange={(e) => setQrData({...qrData, functie: e.target.value})} className="bg-[#12181D] border border-slate-700 rounded p-2.5 text-white text-sm focus:border-[#8ba888] outline-none sm:col-span-2" />
                        <input type="text" placeholder="Telefon" value={qrData.telefon} onChange={(e) => setQrData({...qrData, telefon: e.target.value})} className="bg-[#12181D] border border-slate-700 rounded p-2.5 text-white text-sm focus:border-[#8ba888] outline-none" />
                        <input type="email" placeholder="Email" value={qrData.email} onChange={(e) => setQrData({...qrData, email: e.target.value})} className="bg-[#12181D] border border-slate-700 rounded p-2.5 text-white text-sm focus:border-[#8ba888] outline-none" />
                      </div>
                    )}

                    {qrType === 'dynamic' && (
                      <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded space-y-4">
                        <div>
                          <label className="text-[10px] text-purple-300 uppercase font-bold block mb-1">A. Redirecționare Link Simplu</label>
                          <input type="text" placeholder="https://site-ul-tau.ro/oferta" value={dynamicDestUrl} onChange={e => setDynamicDestUrl(e.target.value)} className="w-full bg-[#12181D] border border-purple-500/50 rounded p-2 text-white text-sm outline-none" />
                        </div>
                        <div className="border-t border-purple-500/20 pt-3">
                          <label className="text-[10px] text-purple-300 uppercase font-bold block mb-1">B. Sau Încărcare Meniu/Catalog PDF</label>
                          <input type="file" accept="application/pdf" onChange={(e) => handleUploadGeneric(e, setUploadedPdfUrl, 'qr_pdfs', setIsUploadingPdf)} className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-purple-600 file:text-white cursor-pointer" />
                          {isUploadingPdf && <span className="text-xs text-purple-400 mt-1 block animate-pulse">Se încarcă PDF-ul în Cloud...</span>}
                          {uploadedPdfUrl && <span className="text-[10px] text-emerald-400 mt-1 block">✅ PDF Găzduit. Va fi folosit ca destinație.</span>}
                        </div>
                        
                        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                          <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} onSuccess={setCaptchaToken} options={{ theme: 'dark', size: 'invisible' }} />
                        )}
                        <button type="button" onClick={handleGenerateDynamicQr} disabled={isGeneratingShortlink} className="w-full bg-purple-600 text-white font-bold py-2 rounded text-xs hover:bg-purple-500 transition">
                          {isGeneratingShortlink ? 'Se securizează...' : '🔗 Activează Cod Dinamic'}
                        </button>
                      </div>
                    )}

                    {qrType === 'smart' && (
                      <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded">
                        <p className="text-blue-300 text-[11px] mb-3 leading-tight">Același QR trimite automat la magazinul corect în funcție de OS.</p>
                        <div className="flex flex-col gap-3">
                          <input type="url" placeholder="🍏 Link App Store (iOS)" value={iosUrl} onChange={(e) => setIosUrl(e.target.value)} className="w-full bg-[#12181D] border border-slate-700 rounded p-2.5 text-white text-sm focus:border-blue-500 outline-none" />
                          <input type="url" placeholder="🤖 Link Google Play (Android)" value={androidUrl} onChange={(e) => setAndroidUrl(e.target.value)} className="w-full bg-[#12181D] border border-slate-700 rounded p-2.5 text-white text-sm focus:border-blue-500 outline-none" />
                          
                          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                            <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} onSuccess={setCaptchaToken} options={{ theme: 'dark', size: 'invisible' }} />
                          )}
                          <button type="button" onClick={handleGenerateDynamicQr} disabled={isGeneratingShortlink} className="w-full bg-blue-600 text-white font-bold py-2 rounded text-xs hover:bg-blue-500 transition">Activează Smart Routing</button>
                        </div>
                      </div>
                    )}

                    {qrType === 'geo' && (
                      <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded space-y-3">
                        <p className="text-blue-300 text-[11px] leading-tight">Redirecționează utilizatorii în funcție de țara în care se află fizic (ex. meniuri multi-limbă).</p>
                        {geoRules.map((rule, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input type="text" placeholder="Cod Țară (RO, DE, UK)" value={rule.country} onChange={(e) => { const newRules = [...geoRules]; newRules[idx].country = e.target.value.toUpperCase(); setGeoRules(newRules); }} className="w-24 bg-[#12181D] border border-slate-700 rounded p-2 text-white text-xs text-center font-bold outline-none" disabled={rule.country === 'DEFAULT'} />
                            <input type="url" placeholder="URL Destinație" value={rule.url} onChange={(e) => { const newRules = [...geoRules]; newRules[idx].url = e.target.value; setGeoRules(newRules); }} className="flex-1 bg-[#12181D] border border-slate-700 rounded p-2 text-white text-xs outline-none" />
                          </div>
                        ))}
                        <button type="button" onClick={() => setGeoRules([...geoRules.slice(0, -1), { country: '', url: '' }, geoRules[geoRules.length-1]])} className="text-[10px] text-blue-400 font-bold underline block">+ Adaugă regulă țară</button>
                        
                        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                          <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} onSuccess={setCaptchaToken} options={{ theme: 'dark', size: 'invisible' }} />
                        )}
                        <button type="button" onClick={handleGenerateDynamicQr} disabled={isGeneratingShortlink} className="w-full bg-blue-600 text-white font-bold py-2 rounded text-xs hover:bg-blue-500 transition">Activează Geo-Routing</button>
                      </div>
                    )}

                    {qrType === 'landing' && (
                      <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input type="text" placeholder="Titlu (ex: Restaurantul Meu)" value={landingData.title} onChange={(e) => setLandingData({...landingData, title: e.target.value})} className="bg-[#12181D] border border-slate-700 rounded p-2 text-white text-sm outline-none sm:col-span-2" />
                          <textarea placeholder="Scurtă descriere..." value={landingData.desc} onChange={(e) => setLandingData({...landingData, desc: e.target.value})} className="bg-[#12181D] border border-slate-700 rounded p-2 text-white text-sm outline-none sm:col-span-2 h-16"></textarea>
                        </div>
                        <div className="border-t border-blue-500/20 pt-3">
                          <label className="text-[10px] text-blue-300 uppercase font-bold block mb-1">Încarcă Poză Profil (Avatar)</label>
                          <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleUploadGeneric(e, (url) => setLandingData({...landingData, avatarUrl: url}), 'landing_images', setIsUploadingPdf)} className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-blue-600 file:text-white cursor-pointer" />
                        </div>
                        <div className="border-t border-blue-500/20 pt-3 space-y-2">
                          <label className="text-[10px] text-blue-300 uppercase font-bold block">Link-uri (Meniu, Social Media, etc)</label>
                          {landingData.links.map((link, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input type="text" placeholder="Nume Buton" value={link.label} onChange={(e) => { const newLinks = [...landingData.links]; newLinks[idx].label = e.target.value; setLandingData({...landingData, links: newLinks}); }} className="w-1/3 bg-[#12181D] border border-slate-700 rounded p-2 text-white text-xs outline-none" />
                              <input type="url" placeholder="https://..." value={link.url} onChange={(e) => { const newLinks = [...landingData.links]; newLinks[idx].url = e.target.value; setLandingData({...landingData, links: newLinks}); }} className="flex-1 bg-[#12181D] border border-slate-700 rounded p-2 text-white text-xs outline-none" />
                            </div>
                          ))}
                          <button type="button" onClick={() => setLandingData({...landingData, links: [...landingData.links, { label: '', url: '' }]})} className="text-[10px] text-blue-400 font-bold underline block">+ Adaugă Link</button>
                        </div>
                        
                        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                          <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} onSuccess={setCaptchaToken} options={{ theme: 'dark', size: 'invisible' }} />
                        )}
                        <button type="button" onClick={handleGenerateDynamicQr} disabled={isGeneratingShortlink} className="w-full bg-blue-600 text-white font-bold py-2 rounded text-xs hover:bg-blue-500 transition">Generează Micro-Landing</button>
                      </div>
                    )}
                  </div>

                  {/* 3. BRANDING & PREVIEW ROW */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mt-auto">
                    
                    {/* Left: Branding */}
                    <div className="w-full">
                      <label className="text-white font-semibold block mb-3 flex items-center justify-between text-sm">
                        <span>3. Branding Visual</span>
                        {(!isPremium && !profil?.has_qr_branding) && (
                          <button onClick={() => handleCheckout('qr_branding')} className="text-[10px] font-bold text-amber-500 hover:underline">Deblochează (49 RON)</button>
                        )}
                      </label>
                      <div className={`space-y-4 ${(!isPremium && !profil?.has_qr_branding) ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div>
                          <label className="text-slate-400 text-[10px] mb-1.5 block uppercase tracking-wider font-bold">Culoare QR</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={qrColor} onChange={(e) => setQrColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer shrink-0 bg-transparent border-0 p-0" />
                            <input type="text" maxLength={7} value={qrColor} onChange={(e) => setQrColor(e.target.value)} placeholder="#000000" className="w-20 text-center bg-[#12181D] border border-slate-700 rounded p-1.5 text-white text-xs font-mono outline-none focus:border-[#8ba888] transition-colors shrink-0" />
                          </div>
                        </div>
                        <div>
                          <label className="text-slate-400 text-[10px] mb-1.5 block uppercase tracking-wider font-bold">Încarcă Logo Center</label>
                          <input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleQrLogoUpload} className="block w-full text-[11px] text-slate-400 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:bg-[#8ba888]/10 file:text-[#8ba888] hover:file:bg-[#8ba888]/20 cursor-pointer truncate" />
                          {qrLogo && <button type="button" onClick={() => { setQrLogo(null); setQrLogoRatio(1); }} className="text-[10px] text-red-400 mt-2 hover:underline block font-bold">Șterge Logo ❌</button>}
                        </div>
                      </div>
                    </div>

                    {/* Right: Preview & Download */}
                    <div className="bg-[#16221A] rounded p-4 flex flex-col items-center justify-center border border-slate-800 w-full">
                      <div className="bg-white p-2 rounded shadow-md mb-4 relative flex justify-center items-center overflow-hidden">
                        {/* 1. QR-ul Vizibil în Interfață */}
                        <QRCodeCanvas 
                          id="contract-qr"
                          value={getQrValue()} 
                          size={130} 
                          level={"H"}
                          fgColor={qrColor}
                          bgColor="#FFFFFF"
                          imageSettings={qrLogo ? { 
                            src: qrLogo, 
                            height: qrLogoRatio > 1 ? 45 / qrLogoRatio : 45, 
                            width: qrLogoRatio > 1 ? 45 : 45 * qrLogoRatio, 
                            excavate: true 
                          } : undefined}
                        />

                        {/* 2. QR-ul Ascuns (Randat nativ la 1000px HD) */}
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
                              height: qrLogoRatio > 1 ? 320 / qrLogoRatio : 320, 
                              width: qrLogoRatio > 1 ? 320 : 320 * qrLogoRatio, 
                              excavate: true 
                            } : undefined}
                          />
                        </div>

                        {['dynamic', 'smart', 'geo', 'landing'].includes(qrType) && (
                          <div className="absolute -bottom-2 -right-2 bg-purple-600 p-1.5 rounded-full shadow-md">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={handleDownloadQR}
                        className="w-full py-2.5 bg-[#8ba888] hover:bg-[#7a9677] text-[#0B0F12] font-black rounded transition-colors flex justify-center items-center gap-2 text-xs uppercase tracking-wide"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Descarcă QR
                      </button>
                      
                      {(['dynamic', 'smart', 'geo', 'landing'].includes(qrType) && (isPremium || profil?.has_qr_dynamic)) && (
                        <button onClick={fetchStats} className="w-full mt-2 py-2 border border-purple-500 text-purple-400 hover:bg-purple-500/10 font-bold rounded text-xs transition-colors uppercase tracking-wide">
                          📊 Statistici
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: MULTI-FORMULAR SECREȚIONAT STRUCTURAL */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto py-6 px-4">
            <div className="mb-4 flex items-center justify-between bg-[#12181D] border border-slate-800/80 px-5 py-3 rounded shadow-md">
              <button type="button" onClick={handleInapoiPrincipal} className="text-xs font-bold text-[#8ba888] hover:text-white flex items-center gap-1.5 transition">
                &larr; Înapoi la Panoul Principal
              </button>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Configurare Securizată v2.0</span>
            </div>

            <div className="bg-[#12181D] p-8 rounded-lg border border-slate-800 shadow-lg">
              
              {formData.tipContract !== 'auto' ? (
                <form onSubmit={handleLansareContract} className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Configurator Document Comercial Electronic</h2>
                  <div className="bg-[#0B0F12] p-4 rounded border border-slate-800">
                    <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Tipul Documentului Generat</label>
                    <select 
                      value={formData.tipContract} 
                      onChange={e => setFormData({...formData, tipContract: e.target.value})} 
                      className="w-full bg-[#12181D] border border-slate-700 rounded p-2.5 text-xs text-white outline-none focus:border-[#8ba888] appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.2em_1.2em] bg-[right_0.7rem_center] bg-no-repeat pr-10"
                    >
                      <option value="prestari">Contract de Prestări Servicii (General)</option>
                      <option value="colaborare_b2b">Contract Colaborare Comercială (Freelanceri)</option>
                      <option value="design_arhitectura">Contract Antrepriză Design / Arhitectură</option>
                      <option value="evenimente">Contract Servicii Evenimente (Foto/Video/Trupă)</option>
                      <option value="nda">Acord de Confidențialitate (NDA)</option>
                      <option value="cda">Contract de Drepturi de Autor (CDA)</option>
                      <option value="inchiriere_imobil">Contract de Închiriere Spațiu</option>
                      <option value="promisiune_vanzare">Promisiune (Antecontract) Vânzare Imobil</option>
                    </select>
                  </div>

                  <div className="bg-[#0B0F12] p-4 rounded border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase block">Calitatea ta în acest Contract (Rol Semnatar)</label>
                    <div className="flex gap-4 text-xs">
                      <label className="flex items-center text-white cursor-pointer select-none">
                        <input type="radio" name="initiatorRol" value="prestator" checked={formData.initiatorRol === 'prestator'} onChange={e => setFormData({...formData, initiatorRol: e.target.value})} className="mr-2 accent-[#8ba888]" />
                        Eu sunt PRESTATORUL / LOCATORUL
                      </label>
                      <label className="flex items-center text-white cursor-pointer select-none">
                        <input type="radio" name="initiatorRol" value="client" checked={formData.initiatorRol === 'client'} onChange={e => setFormData({...formData, initiatorRol: e.target.value})} className="mr-2 accent-[#8ba888]" />
                        Eu sunt BENEFICIARUL / LOCATARUL
                      </label>
                    </div>
                  </div>

                  <div className="bg-[#0B0F12] p-5 rounded border border-slate-800 space-y-4 mb-6">
                    <span className="text-xs font-bold text-[#8ba888] uppercase block tracking-wider">Identitate Vizuală (Branding Prestator)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">CUI / CNP Prestator</label>
                        <input type="text" placeholder="CUI / CNP Prestator" autoComplete="new-password" value={formData.prestatorCui} onChange={e => setFormData({...formData, prestatorCui: e.target.value})} className="w-full p-2.5 bg-[#12181D] border border-slate-700 rounded text-xs text-white outline-none focus:border-[#8ba888]" />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Denumire Furnizor / Nume</label>
                        <input type="text" placeholder="Denumire Firma / Nume Complet" autoComplete="new-password" value={formData.prestatorNume} onChange={e => setFormData({...formData, prestatorNume: e.target.value})} className="p-2.5 bg-[#12181D] border border-slate-700 rounded text-xs text-white outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Link Siglă (.png)</label>
                        <input type="text" placeholder="Link Siglă (.png)" value={formData.prestatorLogo} onChange={e => setFormData({...formData, prestatorLogo: e.target.value})} className="p-2.5 bg-[#12181D] border border-slate-700 rounded text-xs text-white outline-none" />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[10px] text-slate-400 font-bold mb-1 uppercase">Culoare Elements Portal</label>
                        <input type="color" value={formData.prestatorCuloare} onChange={e => setFormData({...formData, prestatorCuloare: e.target.value})} className="w-full h-9 bg-transparent cursor-pointer rounded" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-800/80 mt-6 block clear-both">
                    <span className="text-xs font-bold text-slate-400 uppercase block tracking-wider">Identificare Beneficiar Contract</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input type="text" placeholder="CUI / CNP Client" autoComplete="new-password" value={formData.clientCui} onChange={e => setFormData({...formData, clientCui: e.target.value})} className="w-full p-2.5 bg-[#0B0F12] border border-slate-700 rounded text-xs text-white outline-none focus:border-[#8ba888]" />
                      <input type="text" placeholder="Companie Client / Nume" autoComplete="new-password" value={formData.clientNume} onChange={e => setFormData({...formData, clientNume: e.target.value})} className="p-2.5 bg-[#0B0F12] border border-slate-700 rounded text-xs text-white" />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <input type="email" placeholder="Email Client" autoComplete="new-password" value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} className="w-full p-2.5 bg-[#0B0F12] border border-slate-700 rounded text-xs text-white focus:border-[#8ba888] outline-none" required />
                      
                      <label className="flex items-center p-2.5 bg-[#0B0F12] rounded border border-slate-800/60 cursor-pointer select-none text-xs text-slate-300 h-full">
                        <input 
                          type="checkbox" 
                          checked={formData.adaugaProcesVerbal || false} 
                          onChange={e => setFormData({...formData, adaugaProcesVerbal: e.target.checked})} 
                          className="mr-3 accent-[#8ba888]" 
                        />
                        <div>
                          <span className="font-bold block text-white">Atașează Proces Verbal</span>
                          <span className="text-[10px] text-slate-500 block">Generează automat PV anexă.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <span className="text-xs font-bold text-slate-400 uppercase block">Obiectul Serviciilor / Tranzacției și Remunerație</span>
                    <textarea placeholder="Descrierea explicită a sarcinilor, termenelor și obiectivelor..." value={formData.obiect} onChange={e => setFormData({...formData, obiect: e.target.value})} className="w-full p-3 bg-[#0B0F12] border border-slate-700 rounded text-xs h-16 text-white resize-none" required></textarea>
                    {formData.tipContract !== 'nda' && (
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex w-full sm:w-1/2 gap-3">
                          <input type="number" placeholder="Valoare Contractuală" autoComplete="new-password" value={formData.valoare} onChange={e => setFormData({...formData, valoare: e.target.value})} className="flex-1 p-2.5 bg-[#0B0F12] border border-slate-700 rounded text-xs text-white" required />
                          <select value={formData.moneda} onChange={e => setFormData({...formData, moneda: e.target.value})} className="w-24 bg-[#0B0F12] border border-slate-700 rounded p-2.5 text-xs text-white outline-none focus:border-[#8ba888] appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.2em_1.2em] bg-[right_0.7rem_center] bg-no-repeat pr-10">
                            <option value="RON">RON</option>
                            <option value="EUR">EUR (€)</option>
                          </select>
                        </div>
                        <label className="flex items-center w-full sm:w-1/2 text-xs text-slate-400 cursor-pointer select-none p-2.5 bg-[#0B0F12] border border-slate-800 rounded">
                          <input type="checkbox" checked={formData.estePlatitorTVA} onChange={e => setFormData({...formData, estePlatitorTVA: e.target.checked})} className="mr-3 accent-[#8ba888]" />
                          <span className="truncate">Firma e plătitoare de TVA (+21%)</span>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-amber-400 uppercase block">Activare Clauze Specifice de Asigurare Plată</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-4 border-b border-slate-800/80 pb-4">
                      <label className="flex items-start p-3 bg-amber-900/10 border border-amber-900/30 rounded cursor-pointer">
                        <input type="checkbox" checked={!!formData.clauzaLimitareRaspundere} onChange={e => setFormData({...formData, clauzaLimitareRaspundere: e.target.checked})} className="mt-0.5 mr-3 accent-amber-500" />
                        <div>
                          <span className="font-bold text-amber-500 block">Limitare Răspundere Comercială</span>
                          <span className="text-[10px] text-slate-500 block">Nu vei plăti niciodată daune mai mari decât factura încasată.</span>
                        </div>
                      </label>

                      <label className="flex items-start p-3 bg-amber-900/10 border border-amber-900/30 rounded cursor-pointer">
                        <input type="checkbox" checked={!!formData.clauzaInflatie} onChange={e => setFormData({...formData, clauzaInflatie: e.target.checked})} className="mt-0.5 mr-3 accent-amber-500" />
                        <div>
                          <span className="font-bold text-amber-500 block">Indexare Anti-Inflație (BNR)</span>
                          <span className="text-[10px] text-slate-500 block">Actualizează automat suma dacă BNR crește cursul EUR.</span>
                        </div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {(nomenclatorClauze[formData.tipContract] || nomenclatorClauze.prestari).map((clauza) => (
                        <label key={clauza.id} className="flex items-start p-3 bg-[#0B0F12] border border-slate-800 rounded cursor-pointer">
                          <input type="checkbox" checked={!!formData[clauza.id]} onChange={e => setFormData({...formData, [clauza.id]: e.target.checked})} className="mt-0.5 mr-3 accent-[#8ba888]" />
                          <div>
                            <span className="font-bold text-white block">{clauza.titlu}</span>
                            <span className="text-[10px] text-slate-500 block">{clauza.detaliu}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* SISTEM AVANSAT DE SEMNĂTURI */}
                  <div className="bg-[#0B0F12] p-5 rounded-lg border border-slate-800 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase block tracking-wider">Aprobare și Semnare Document</span>
                      <div className="flex gap-2 bg-[#12181D] p-1 rounded border border-slate-700">
                        <button type="button" onClick={() => { setSignatureTab('draw'); curataCanvas(); }} className={`px-3 py-1 rounded text-[10px] font-bold transition-colors ${signatureTab === 'draw' ? 'bg-[#8ba888] text-black' : 'text-slate-400 hover:text-white'}`}>Desenează</button>
                        <button type="button" onClick={() => { setSignatureTab('upload'); curataCanvas(); }} className={`px-3 py-1 rounded text-[10px] font-bold transition-colors ${signatureTab === 'upload' ? 'bg-[#8ba888] text-black' : 'text-slate-400 hover:text-white'}`}>Încarcă (PNG/JPG)</button>
                      </div>
                    </div>

                    {signatureTab === 'draw' && (
                      <div className="space-y-3 relative">
                        <div className="relative border-2 border-dashed border-slate-700 rounded-lg bg-white overflow-hidden">
                          {!isDrawing && !canvasRef.current?.toDataURL().length > 100 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                              <span className="text-black text-2xl font-black italic">Semnează aici</span>
                            </div>
                          )}
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
                          <button type="button" onClick={curataCanvas} className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            Curăță / Resemnează
                          </button>
                        </div>
                      </div>
                    )}

                    {signatureTab === 'upload' && (
                      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-700 rounded-lg bg-[#12181D]">
                        {!uploadedSignature ? (
                          <>
                            <svg className="w-8 h-8 text-slate-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                            <label className="cursor-pointer bg-[#8ba888] text-black px-4 py-2 rounded text-xs font-bold hover:opacity-90 transition-opacity">
                              Alege Imaginea (Fără fundal ideal)
                              <input type="file" accept="image/png, image/jpeg" onChange={handleIncarcareSemnatura} className="hidden" />
                            </label>
                            <span className="text-[10px] text-slate-500 mt-3">Sistemul o va decupa și o va aplica direct în contract.</span>
                          </>
                        ) : (
                          <div className="flex flex-col items-center w-full">
                            <div className="bg-white p-4 rounded mb-4 w-full flex justify-center border border-slate-700">
                              <img src={uploadedSignature} alt="Semnatura Incarcata" className="max-h-24 object-contain" />
                            </div>
                            <button type="button" onClick={() => setUploadedSignature(null)} className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              Elimină Imaginea
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                    <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} onSuccess={setCaptchaToken} options={{ theme: 'dark', size: 'invisible' }} />
                  )}

                  <div className="flex justify-between items-center pt-6 border-t border-slate-800">
                    <button type="button" onClick={handleInapoiPrincipal} className="text-xs text-slate-400 underline">Înapoi</button>
                    <button type="submit" disabled={!!loadingText} className="bg-[#8ba888] text-[#0B0F12] font-black px-8 py-4 rounded text-sm transition hover:opacity-90">
                      {loadingText ? 'Se înregistrează...' : 'Descărcare PDF directă'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleGenereazaPachetAuto} className="space-y-6" autoComplete="off">
                  <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-2xl font-black text-white">Asistent Automatizat de Vânzare Auto</h2>
                    <p className="text-xs text-slate-400">Generare Contracte (5 exemplare) și Fișă Înmatriculare DITL</p>
                  </div>

                  {autoStep === 'upload' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-[#0B0F12] border border-slate-800 rounded space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-xs font-bold text-[#8ba888] uppercase tracking-wide">1. Identitate Persoană Vânzător</span>
                          <div className="flex gap-2 bg-[#12181D] p-1 rounded border border-slate-800">
                            <button type="button" onClick={() => setAutoData({...autoData, vanzatorTip: 'PF'})} className={`px-2 py-0.5 rounded text-[10px] font-bold ${autoData.vanzatorTip === 'PF' ? 'bg-[#8ba888] text-black' : 'text-slate-400'}`}>Fizică (PF)</button>
                            <button type="button" onClick={() => setAutoData({...autoData, vanzatorTip: 'PJ'})} className={`px-2 py-0.5 rounded text-[10px] font-bold ${autoData.vanzatorTip === 'PJ' ? 'bg-[#8ba888] text-black' : 'text-slate-400'}`}>Firmă/PFA (PJ)</button>
                          </div>
                        </div>
                        {autoData.vanzatorTip === 'PF' ? (
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="Nume Complet Vânzător" autoComplete="new-password" value={autoData.vanzatorNume} onChange={e => setAutoData({...autoData, vanzatorNume: e.target.value})} className="bg-[#12181D] border border-slate-700 p-2 rounded text-xs text-white outline-none" />
                            <input type="text" placeholder="CNP Vânzător" autoComplete="new-password" value={autoData.vanzatorCnp} onChange={e => setAutoData({...autoData, vanzatorCnp: e.target.value})} className="bg-[#12181D] border border-slate-700 p-2 rounded text-xs text-white font-mono outline-none" />
                            <input type="text" placeholder="Adresă Domiciliu Vânzător (din buletin)" autoComplete="new-password" value={autoData.autoAdresaVanzator} onChange={e => setAutoData({...autoData, autoAdresaVanzator: e.target.value})} className="bg-[#12181D] border border-slate-700 p-2 rounded text-xs text-white col-span-2 outline-none" />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="Denumire Companie / PFA" autoComplete="new-password" value={autoData.vanzatorNume} onChange={e => setAutoData({...autoData, vanzatorNume: e.target.value})} className="bg-[#12181D] border border-slate-700 p-2 rounded text-xs text-white outline-none" />
                            <input type="text" placeholder="CUI / CIF Fiscal" autoComplete="new-password" value={autoData.vanzatorCui} onChange={e => setAutoData({...autoData, vanzatorCui: e.target.value})} className="bg-[#12181D] border border-slate-700 rounded text-xs text-white font-mono outline-none" />
                            <input type="text" placeholder="Nr. Înmatriculare Reg. Com." autoComplete="new-password" value={autoData.vanzatorRegCom} onChange={e => setAutoData({...autoData, vanzatorRegCom: e.target.value})} className="bg-[#12181D] border border-slate-700 rounded text-xs text-white outline-none" />
                            <input type="text" placeholder="Sediu Social Companie" autoComplete="new-password" value={autoData.vanzatorSediu} onChange={e => setAutoData({...autoData, vanzatorSediu: e.target.value})} className="bg-[#12181D] border border-slate-700 rounded text-xs text-white outline-none" />
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-[#0B0F12] border border-slate-800 rounded space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-xs font-bold text-[#8ba888] uppercase tracking-wide">2. Identitate Persoană Cumpărător</span>
                          <div className="flex gap-2 bg-[#12181D] p-1 rounded border border-slate-800">
                            <button type="button" onClick={() => { setAutoData({...autoData, cumparatorTip: 'PF'}) }} className={`px-2 py-0.5 rounded text-[10px] font-bold ${autoData.cumparatorTip === 'PF' ? 'bg-[#8ba888] text-black' : 'text-slate-400'}`}>Fizică (PF)</button>
                            <button type="button" onClick={() => { setAutoData({...autoData, cumparatorTip: 'PJ'}) }} className={`px-2 py-0.5 rounded text-[10px] font-bold ${autoData.cumparatorTip === 'PJ' ? 'bg-[#8ba888] text-black' : 'text-slate-400'}`}>Firmă/PFA (PJ)</button>
                          </div>
                        </div>
                        {autoData.cumparatorTip === 'PF' ? (
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="Nume Complet Cumpărător" autoComplete="new-password" value={autoData.cumparatorNume} onChange={e => setAutoData({...autoData, cumparatorNume: e.target.value})} className="bg-[#12181D] border border-slate-700 p-2 rounded text-xs text-white outline-none" />
                            <input type="text" placeholder="CNP Cumpărător" autoComplete="new-password" value={autoData.cumparatorCnp} onChange={e => setAutoData({...autoData, cumparatorCnp: e.target.value})} className="bg-[#12181D] border border-slate-700 p-2 rounded text-xs text-white font-mono outline-none" />
                            <input type="text" placeholder="Adresă Domiciliu Cumpărător" autoComplete="new-password" value={autoData.autoAdresaCumparator} onChange={e => setAutoData({...autoData, autoAdresaCumparator: e.target.value})} className="bg-[#12181D] border border-slate-700 p-2 rounded text-xs text-white col-span-2 outline-none" />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="Denumire Companie / PFA Cumpărător" autoComplete="new-password" value={autoData.cumparatorNume} onChange={e => setAutoData({...autoData, cumparatorNume: e.target.value})} className="bg-[#12181D] border border-slate-700 p-2 rounded text-xs text-white outline-none" />
                            <input type="text" placeholder="CUI / CIF Fiscal" autoComplete="new-password" value={autoData.cumparatorCui} onChange={e => setAutoData({...autoData, cumparatorCui: e.target.value})} className="bg-[#12181D] border border-slate-700 rounded text-xs text-white font-mono outline-none" />
                          </div>
                        )}
                      </div>

                      <span className="text-xs font-bold text-[#8ba888] uppercase block pt-2">Pasul 3: Încărcare Acte pentru Citire Optică OCR [ Acest pas este optional ]</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        
                        <div className="bg-[#0B0F12] p-4 border border-slate-800 rounded text-center flex flex-col justify-between min-h-[140px]">
                          <label className="text-xs text-slate-300 block mb-2 font-bold">Carte Identitate Vehicul (CIV)</label>
                          {!autoDocs.civ ? (
                            <input type="file" id="file-input-civ" accept="image/*,application/pdf" disabled={isUploading} onChange={(e) => handleAutoFileUpload(e, 'civ')} className="text-xs block w-full text-slate-500 file:bg-[#16221A] file:text-[#8ba888]" />
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-[10px] text-emerald-400 bg-[#16221A] px-2 py-1 rounded truncate w-full">✓ CIV Încărcat</span>
                              <button type="button" onClick={() => handleEliminaDocument('civ')} className="text-[10px] text-red-400 font-bold hover:underline">Elimină ❌</button>
                            </div>
                          )}
                        </div>

                        <div className="bg-[#0B0F12] p-4 border border-slate-800 rounded text-center flex flex-col justify-between min-h-[140px]">
                          <label className="text-xs text-slate-300 block mb-2 font-bold">Certificat Înmatriculare (Talon)</label>
                          {!autoDocs.talon ? (
                            <input type="file" id="file-input-talon" accept="image/*,application/pdf" disabled={isUploading} onChange={(e) => handleAutoFileUpload(e, 'talon')} className="text-xs block w-full text-slate-500 file:bg-[#16221A] file:text-[#8ba888]" />
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-[10px] text-emerald-400 bg-[#16221A] px-2 py-1 rounded truncate w-full">✓ Talon Încărcat</span>
                              <button type="button" onClick={() => handleEliminaDocument('talon')} className="text-[10px] text-red-400 font-bold hover:underline">Elimină ❌</button>
                            </div>
                          )}
                        </div>

                        <div className="bg-[#0B0F12] p-4 border border-slate-800 rounded text-center flex flex-col justify-between min-h-[140px]">
                          <label className="text-xs text-slate-300 block mb-2 font-bold">Act Identitate Vânzător</label>
                          {!autoDocs.buletin_vanzator ? (
                            <input type="file" id="file-input-buletin_vanzator" accept="image/*,application/pdf" disabled={isUploading} onChange={(e) => handleAutoFileUpload(e, 'buletin_vanzator')} className="text-xs block w-full text-slate-500 file:bg-[#16221A] file:text-[#8ba888]" />
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-[10px] text-emerald-400 bg-[#16221A] px-2 py-1 rounded truncate w-full">✓ Buletin Vânzător</span>
                              <button type="button" onClick={() => handleEliminaDocument('buletin_vanzator')} className="text-[10px] text-red-400 font-bold hover:underline">Elimină ❌</button>
                            </div>
                          )}
                        </div>

                        <div className="bg-[#0B0F12] p-4 border border-slate-800 rounded text-center flex flex-col justify-between min-h-[140px]">
                          <label className="text-xs text-slate-300 block mb-2 font-bold">Act Identitate Cumpărător</label>
                          {!autoDocs.buletin_cumparator ? (
                            <input type="file" id="file-input-buletin_cumparator" accept="image/*,application/pdf" disabled={isUploading} onChange={(e) => handleAutoFileUpload(e, 'buletin_cumparator')} className="text-xs block w-full text-slate-500 file:bg-[#16221A] file:text-[#8ba888]" />
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-[10px] text-emerald-400 bg-[#16221A] px-2 py-1 rounded truncate w-full">✓ Buletin Cumpărător</span>
                              <button type="button" onClick={() => handleEliminaDocument('buletin_cumparator')} className="text-[10px] text-red-400 font-bold hover:underline">Elimină ❌</button>
                            </div>
                          )}
                        </div>

                      </div>

                      <div className="space-y-3 pt-2">
                        <span className="text-xs font-bold text-slate-400 uppercase block">Date Vehicul Extrase:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <input type="text" placeholder="Serie Șasiu / VIN" autoComplete="new-password" required value={autoData.autoVin} onChange={e => setAutoData({...autoData, autoVin: e.target.value.toUpperCase()})} className="p-2.5 bg-[#0B0F12] border border-slate-700 rounded text-xs text-white uppercase font-mono outline-none sm:col-span-1" />
                          <input type="text" placeholder="Număr Înmatriculare" autoComplete="new-password" value={autoData.autoNumarInmatriculare} onChange={e => setAutoData({...autoData, autoNumarInmatriculare: e.target.value.toUpperCase()})} className="p-2.5 bg-[#0B0F12] border border-slate-700 rounded text-xs text-white uppercase font-mono outline-none sm:col-span-1" />
                          <input type="text" placeholder="Marcă și Model" autoComplete="new-password" value={autoData.autoMarcaModel} onChange={e => setAutoData({...autoData, autoMarcaModel: e.target.value})} className="p-2.5 bg-[#0B0F12] border border-slate-700 rounded text-xs text-white outline-none sm:col-span-1" />
                          <div className="flex gap-1 sm:col-span-1">
                            <input type="number" placeholder="Preț" autoComplete="new-password" value={autoData.autoPret} onChange={e => setAutoData({...autoData, autoPret: e.target.value})} className="p-2.5 bg-[#0B0F12] border border-slate-700 rounded text-xs text-white outline-none w-full" />
                            <select value={autoData.autoMoneda} onChange={e => setAutoData({...autoData, autoMoneda: e.target.value})} className="bg-[#0B0F12] border border-slate-700 rounded p-1.5 text-xs text-white outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.2em_1.2em] bg-[right_0.4rem_center] bg-no-repeat pr-6">
                              <option value="RON">RON</option>
                              <option value="EUR">EUR</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                           <input type="email" placeholder="Email Contracte Finalizate" autoComplete="new-password" required value={autoData.clientEmail} onChange={e => setAutoData({...autoData, clientEmail: e.target.value})} className="p-2.5 bg-[#0B0F12] border border-slate-700 rounded text-xs text-white outline-none" />
                           <label className="flex items-center text-xs text-slate-400 cursor-pointer select-none border border-slate-800 rounded p-2.5 bg-[#0B0F12]">
                             <input type="checkbox" checked={autoData.pretIncludeTVA} onChange={e => setAutoData({...autoData, pretIncludeTVA: e.target.checked})} className="mr-2 accent-[#8ba888]" />
                             <span>Prețul include TVA (Dacă Vânzătorul e PJ plătitor)</span>
                           </label>
                        </div>
                        
                        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                          <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} onSuccess={setCaptchaToken} options={{ theme: 'dark', size: 'invisible' }} />
                        )}
                        <div className="flex justify-between items-center pt-2">
                          <button type="button" onClick={handleInapoiPrincipal} className="text-xs text-slate-400 underline">Înapoi la panou</button>
                          <button type="submit" disabled={isUploading || !!loadingText} className="bg-[#8ba888] text-black font-black px-6 py-2.5 rounded text-xs tracking-tight transition hover:opacity-90">
                            {loadingText ? 'Se procesează...' : `Generează Pachet Securizat Auto .ZIP (${autoData.autoMoneda === 'EUR' ? `${Math.round(99 / cursBnr.eur)} EUR` : '19.99 €'})`}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {autoStep === 'success' && (
                    <div className="bg-[#0B0F12] border border-slate-800 p-5 rounded-lg text-center space-y-4">
                      <div className="w-12 h-12 bg-emerald-900/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Pachetul Auto a fost descărcat!</h4>
                        <p className="text-xs text-slate-400 mt-1">Arhiva conține cele 5 exemplare oficiale DITL, procesul-verbal avocațial cu km garantați și ghidul procedural post-vânzare.</p>
                      </div>
                      <div className="flex justify-center mt-4">
                        <button type="button" onClick={() => { setAutoStep('upload'); setStep(1); }} className="text-xs font-bold text-[#8ba888] hover:text-white flex items-center gap-1.5 transition underline">
                          &larr; Înapoi la Panoul Principal
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}
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

        {/* SECȚIUNE PREȚURI PERFECTĂ */}
        <div id="sectiune-preturi" className="max-w-7xl mx-auto px-6 mt-16 scroll-mt-20">
          
          {/* Partea 1: Servicii Complete / Abonamente */}
          <div className="border-b border-slate-800 pb-4 mb-8 text-center">
            <span className="text-[#8ba888] text-xs font-black uppercase tracking-widest block mb-1">Ecosistem ContractSmart</span>
            <h2 className="text-3xl font-black text-white tracking-tight">Planuri de Business & Tranzacții</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto mb-10">
            {/* Onetime Contract B2B */}
            <div className="bg-[#12181D] border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-500 font-bold block uppercase">Plată Unică</span>
                <h4 className="text-sm font-bold text-white mt-1">1x Contract B2B</h4>
                <div className="text-lg font-black text-[#8ba888] mt-2 mb-1">19 RON <span className="text-[10px] text-slate-500 font-normal">(~3.99 €)</span></div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">Plătești strict pe contractul de servicii descărcat.</p>
              </div>
              <button type="button" onClick={() => handleCumparaPremium('one_time_contract')} className="w-full mt-4 bg-[#0B0F12] border border-slate-700 hover:bg-slate-900 text-white font-bold py-2 rounded text-xs transition">Cumpără 3.99 €</button>
            </div>

            {/* Onetime Auto */}
            <div className="bg-[#12181D] border border-slate-800 rounded-lg p-4 flex flex-col justify-between relative ring-1 ring-blue-500/30">
              <span className="absolute -top-2 right-4 bg-blue-600 text-white text-[8px] uppercase font-black px-2 py-0.5 rounded">Auto</span>
              <div>
                <span className="text-[10px] font-mono text-blue-400 font-bold block uppercase">Plată Unică</span>
                <h4 className="text-sm font-bold text-white mt-1">Pachet Acte Auto</h4>
                <div className="text-lg font-black text-white mt-2 mb-3">99 RON <span className="text-[10px] text-slate-500 font-normal">(~19.99 €)</span></div>
                <p className="text-[11px] text-slate-300 leading-relaxed">Generare pachet complet vânzare auto (contracte, DITL, PV).</p>
              </div>
              <button type="button" onClick={() => handleCumparaPremium('contract_auto')} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-xs transition">Cumpără 19.99 €</button>
            </div>

            {/* PRO */}
            <div className="bg-[#12181D] border border-slate-800 rounded-lg p-4 flex flex-col justify-between relative ring-2 ring-[#8ba888]/20">
              <span className="absolute -top-2 right-4 bg-[#8ba888] text-[#0B0F12] text-[8px] uppercase font-black px-2 py-0.5 rounded">Popular</span>
              <div>
                <span className="text-[10px] font-mono text-[#8ba888] block uppercase">Abonament</span>
                <h4 className="text-sm font-bold text-white mt-1">Abonament PRO</h4>
                <div className="text-lg font-black text-white mt-2 mb-3">99 RON <span className="text-[10px] text-slate-500 font-normal">/ lună (~19.99 €)</span></div>
                <p className="text-[11px] text-slate-300 leading-relaxed">Contracte B2B nelimitate + Mega-QR Studio (Smart, Geo, PDF, Landing).</p>
              </div>
              <button type="button" onClick={() => handleCumparaPremium('pro')} className="w-full mt-4 bg-[#8ba888] text-[#0B0F12] font-black py-2 rounded text-xs transition hover:opacity-90">Abonează-te</button>
            </div>
          </div>
          
          <div className="max-w-5xl mx-auto mb-12">
            {/* FOUNDER LIFETIME */}
            <div className="bg-[#16221A] border border-[#8ba888]/50 rounded-lg p-6 flex flex-col sm:flex-row justify-between items-center relative shadow-md shadow-[#8ba888]/10 text-center sm:text-left">
              <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-200 to-yellow-500 text-black text-[10px] uppercase font-black px-3 py-1 rounded shadow-md">Oferta Limitata</span>
              <div className="w-full sm:w-2/3 pt-2">
                <span className="text-[10px] font-mono text-amber-500 font-bold block uppercase">VIP Acces pe Viață</span>
                <h4 className="text-xl font-black text-white mt-1">Membru Fondator - Lifetime</h4>
                <p className="text-xs text-slate-300 leading-relaxed mt-2 max-w-lg">Cumperi o singură dată și ai acces nelimitat pe viață la absolut toate funcțiile platformei curente și viitoare: contracte, pachet auto, module QR, hosting, totul.</p>
              </div>
              <div className="w-full sm:w-1/3 flex flex-col items-center sm:items-end mt-4 sm:mt-0">
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 mb-1">999 RON</div>
                <div className="text-xs text-slate-400 mb-3">(~199.99 €)</div>
                <button type="button" onClick={() => handleCumparaPremium('founder')} className="bg-gradient-to-r from-amber-200 to-yellow-500 hover:opacity-90 text-black font-black py-3 px-8 rounded text-sm transition">Devino Fondator</button>
              </div>
            </div>
          </div>

          {/* Partea 2: Șabloane & QR Individual */}
          <div className="border-t border-slate-800 pt-8 pb-4 mb-4 text-center">
            <h3 className="text-2xl font-black text-white tracking-tight">Șabloane & Extensii QR (Plată Unică)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            
            <div className="bg-[#12181D] border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white mt-1">Șablon Tipizat Legal</h4>
                <p className="text-[10px] text-slate-400 mt-1">Contracte PDF gata redactate.</p>
                <div className="text-lg font-black text-white mt-2 mb-3">49 RON <span className="text-[10px] text-slate-500 font-normal">(~9.99 €)</span></div>
              </div>
              <button onClick={() => handleCumparaPremium('sablon_tipizat')} className="w-full bg-[#0B0F12] border border-slate-700 text-white font-bold py-2 rounded text-xs hover:bg-slate-900">Cumpără 9.99 €</button>
            </div>

            <div className="bg-[#12181D] border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white mt-1">Pachet QR Branding</h4>
                <p className="text-[10px] text-slate-400 mt-1">Adaugă logo-ul tău pe centru.</p>
                <div className="text-lg font-black text-white mt-2 mb-3">49 RON <span className="text-[10px] text-slate-500 font-normal">(~9.99 €)</span></div>
              </div>
              <button onClick={() => handleCumparaPremium('qr_branding')} className="w-full bg-[#0B0F12] border border-slate-700 text-white font-bold py-2 rounded text-xs hover:bg-slate-900">Cumpără 9.99 €</button>
            </div>

            <div className="bg-[#12181D] border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white mt-1">Pachet QR Dynamic</h4>
                <p className="text-[10px] text-slate-400 mt-1">Schimbă destinația + Găzduire PDF.</p>
                <div className="text-lg font-black text-white mt-2 mb-3">39 RON <span className="text-[10px] text-slate-500 font-normal">(~7.99 €)</span></div>
              </div>
              <button onClick={() => handleCumparaPremium('qr_dynamic')} className="w-full bg-[#0B0F12] border border-slate-700 text-white font-bold py-2 rounded text-xs hover:bg-slate-900">Cumpără 7.99 €</button>
            </div>

            <div className="bg-[#12181D] border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white mt-1">Pachet QR vCard Pro</h4>
                <p className="text-[10px] text-slate-400 mt-1">Carte de vizită cu salvare în agendă.</p>
                <div className="text-lg font-black text-white mt-2 mb-3">69 RON <span className="text-[10px] text-slate-500 font-normal">(~13.99 €)</span></div>
              </div>
              <button onClick={() => handleCumparaPremium('qr_vcard')} className="w-full bg-[#0B0F12] border border-slate-700 text-white font-bold py-2 rounded text-xs hover:bg-slate-900">Cumpără 13.99 €</button>
            </div>
          </div>
        </div>

        {/* ȘTIRI LIVE - GLOBALE CU THUMBNAILS UI/UX */}
        <div className="max-w-7xl mx-auto px-6 mt-12 mb-12">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">Flux Monitorizare Mediativă Legală Real-Time</span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stiriLive.slice(0, 6).map((stire, i) => (
              <a href={stire.link} target="_blank" rel="noreferrer" key={i} className="group flex flex-col bg-[#12181D] border border-slate-800 rounded-lg overflow-hidden hover:border-[#8ba888]/50 hover:shadow-[0_0_15px_rgba(139,168,136,0.1)] transition-all h-full">
                {stire.imagine ? (
                  <div className="w-full h-32 overflow-hidden border-b border-slate-800">
                    <img src={stire.imagine} alt="News thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="w-full h-2 bg-[#16221A]"></div>
                )}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[10px] font-bold text-[#8ba888] bg-[#16221A] px-2 py-0.5 rounded border border-emerald-900/50 uppercase inline-block mb-3">{stire.sursa || "Presă Economică"}</span>
                    <h3 className="text-sm font-bold text-white leading-snug group-hover:text-[#8ba888] transition-colors">{stire.titlu || stire.title}</h3>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">Actualizat Live</span>
                    <span className="text-xs font-bold text-[#8ba888] group-hover:underline">Citește mai mult &rarr;</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* FOOTER GENERAL CENTRAT */}
        <footer className="relative z-10 border-t border-slate-800 bg-[#0B0F12] pt-12 pb-8 mt-16 text-center">
          <div className="max-w-5xl mx-auto px-6 space-y-6">
            <div className="flex justify-center">
              <div className="w-[180px] h-[30px] cursor-pointer" onClick={handleInapoiPrincipal}>
                <svg viewBox="0 0 240 40" className="w-full h-full mx-auto">
                  <g transform="translate(0, 2)">
                    <path d="M24 6 C15 6, 8 13, 8 22 C8 31, 15 38, 24 38 C31 38, 37 33, 39 27" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round"/>
                    <path d="M16 21 L21 26 L32 12" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <text x="48" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="20" fill="#FFFFFF" letterSpacing="-0.5">
                    Contract<tspan fill="#8ba888">Smart</tspan>
                  </text>
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Infrastructură electronică avansată dedicată optimizării micro-sistemelor, înmatriculării rapide a entităților comerciale și auditului de clauze pe Codul Civil român.
            </p>
            <div className="flex justify-center space-x-6 text-xs text-slate-400 font-medium">
              <span onClick={() => { setStep(1); const el = document.getElementById('sectiune-preturi'); el?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-[#8ba888] cursor-pointer transition">Planuri & Tarife</span>
              <span>•</span>
              <Link href="/modele-contracte" className="hover:text-[#8ba888] transition">Modele Predefinite</Link>
              <span>•</span>
              <Link href="/baza-legala" className="hover:text-[#8ba888] transition">Articole Validitate Juridică & Cod Civil</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-[#8ba888] transition">Contact</Link>
            </div>
            <div className="pt-6 border-t border-slate-800/40 flex flex-col items-center gap-4">
              <p className="text-[10px] text-slate-500 font-mono max-w-3xl text-center leading-relaxed px-4">
                <strong className="text-slate-400">Disclaimer Legal:</strong> ContractSmart este o platformă de software. Nu suntem o casă de avocatură și nu oferim consultanță juridică. Utilizarea platformei reprezintă acceptarea faptului că modelele generate necesită revizuirea de către un specialist.
              </p>
              <p className="text-[11px] text-slate-500 font-mono">© 2026 ContractSmart. Powered by ZenSoftware. Toate drepturile rezervate legal.</p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}