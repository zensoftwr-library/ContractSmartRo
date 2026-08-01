'use client';
import './globals.css';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

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
  nda: [
    { id: 'clauzaPi', titlu: '1. Protecție Secrete Comerciale', detaliu: 'Interdicție absolută de utilizare, copiere sau multiplicare a informațiilor primite în scopuri exterioare negocierilor, sub sancțiunea legii privind combaterea concurenței neloiale.' },
    { id: 'clauzaPenalitati', titlu: '2. Daune Interese Predefinite', detaliu: 'Încălcarea obligației de confidențialitate atrage aplicarea unei clauze penale cu titlu de daune interese preevaluate, datorate instant fără obligația de a dovedi cuantumul prejudiciului.' },
    { id: 'clauzaRetentie', titlu: '3. Distrugere Obligatorie Date', detaliu: 'La încetarea discuțiilor, Partea Primitoare se obligă să returneze sau să distrugă definitiv toate documentele și copiile digitale primite, transmițând o confirmare scrisă în 48 de ore.' },
    { id: 'clauzaNdaDurata', titlu: '4. Ultraactivitatea Obligațiilor', detaliu: 'Obligațiile de confidențialitate și neutilizare a informațiilor supraviețuiesc încetării contractului cadru sau a negocierilor și rămân în vigoare pentru o durată de minimum 5 ani.' },
    { id: 'clauzaNdaPermis', titlu: '5. Dezvăluiri Permise prin Lege', detaliu: 'Divulgarea nu constituie o încălcare dacă este cerută de o autoritate judecătorească, cu condiția notificării imediate a celeilalte părți în scopul obținerii unei măsuri de protecție.' }
  ],
  cda: [
    { id: 'clauzaPi', titlu: '1. Transfer Condiționat de Drepturi', detaliu: 'Cesiunea drepturilor patrimoniale de autor se naște și produce efecte juridice exclusiv la data creditării contului Autorului cu valoarea integrală a prețului contractual.' },
    { id: 'clauzaPenalitati', titlu: '2. Penalități de Utilizare Neautorizată', detaliu: 'Utilizarea, difuzarea sau exploatarea operei înainte de achitarea integrală a prețului sau cu depășirea limitelor convenite atrage aplicarea unui tarif penalizator dublu per incidență.' },
    { id: 'clauzaMarketingTerti', titlu: '3. Drept de Creditare Paternitate', detaliu: 'Beneficiarul are obligația corelativă de a menționa numele Autorului pe toate materialele publicate, pe canalele de difuzare și suporturile media electronice sau fizice utilizate.' },
    { id: 'clauzaCdaMoral', titlu: '4. Inalienabilitatea Drepturilor Morale', detaliu: 'Drepturile morale de autor (paternitatea operei, dreptul de a se opune oricărei deformări sau modificări aduse operei) rămân atașate Autorului în mod perpetuu, inalienabil și imprescriptibil.' },
    { id: 'clauzaCdaTeritoriu', titlu: '5. Delimitare Teritorială și Canale', detaliu: 'Drepturile de exploatare comercială transmise sunt limitate strict la aria geografică și canalele media indicate în anexa tehnică, orice extindere necesitând un acord scris distinct.' }
  ],
  inchiriere_imobil: [
    { id: 'clauzaPi', titlu: '1. Pact Comisoriu / Titlu Executoriu', detaliu: 'În conformitate cu Art. 1798 Cod Civil, prezentul contract constituie titlu executoriu pentru plata chiriei și evacuare rapidă la expirarea termenului, fără necesitatea unei acțiuni în justiție.' },
    { id: 'clauzaPenalitati', titlu: '2. Penalități pentru Întârziere Chirie', detaliu: 'Neplata chiriei la termenul fixat atrage majorări zilnice penalizatoare. Depășirea scadenței cu mai mult de 15 zile activează de drept pactul comisoriu și rezilierea unilaterală.' },
    { id: 'clauzaRawFoto', titlu: '3. Reținere Garanție / Depozit Daune', detaliu: 'Fondul de garanție constituit este reținut de Locator la încetarea contractului pentru acoperirea eventualelor deteriorări aduse imobilului sau a restanțelor la utilități din culpa Locatarului.' },
    { id: 'clauzaAprobareTacita', titlu: '4. Drept de Inspecție Proprietar', detaliu: 'Locatorul își rezervă dreptul de a inspecta starea tehnică a imobilului o dată pe lună, în prezența Locatarului, în baza unei notificări scrise prealabile transmise cu minimum 24 de ore înainte.' },
    { id: 'clauzaTaxaAnulare', titlu: '5. Interdicție Subînchiriere Spațiu', detaliu: 'Locatarului îi este interzisă în mod absolut subînchirierea, cedarea folosinței sau darea în comodat a imobilului, total sau parțial, către terțe persoane fără acordul prealabil scris al Locatorului.' },
    { id: 'clauzaInchiriereRegie', titlu: '6. Dovada Plății Utilităților la Zi', detaliu: 'Locatarul are obligația de a transmite lunar către Locator dovezile de plată ale utilităților. Acumularea de restanțe pe mai mult de 45 de zile dă dreptul la rezilierea de drept a contractului.' },
    { id: 'clauzaInchiriereDest', titlu: '7. Schimbare Destinație Spațiu', detaliu: 'Imobilul va fi utilizat exclusiv conform destinației stabilite. Schimbarea destinației în spațiu comercial, sediu social sau desfășurarea de activități economice fără acord scris este strict interzisă.' }
  ],
  promisiune_vanzare: [
    { id: 'clauzaTaxaAnulare', titlu: '1. Arvună Confirmatorie (Pierdere Avans)', detaliu: 'În temeiul Art. 1544 Cod Civil, dacă Promitentul-Cumpărător renunță la tranzacție, avansul se pierde integral. Dacă Promitentul-Vânzător refuză perfectarea, va restitui dublul arvunei primite.' },
    { id: 'clauzaPenalitati', titlu: '2. Penalități Zi de Întârziere Act Notarial', detaliu: 'Refuzul nejustificat sau neprezentarea uneia dintre părți la biroul notarial la data fixată atrage o penalitate simetrică pe fiecare zi de întârziere, datorată cu titlu de daune interese moratorii.' },
    { id: 'clauzaAprobareTacita', titlu: '3. Rezoluțiune de Drept la Termenul Fixat', detaliu: 'Împlinirea termenului extinctiv fără perfectarea contractului de vânzare determină desființarea de drept a promisiunii prin efectul pactului comisoriu, fără punere în întârziere sau formalități.' },
    { id: 'clauzaPromisSarcini', titlu: '4. Garanție Evicțiune și Sarcini Imobil', detaliu: 'Promitentul-Vânzător garantează pe propria răspundere că imobilul este liber de orice sarcini, ipoteci, privileges, procese de revendicare sau litigii aflate pe rolul instanțelor judecătorești.' },
    { id: 'clauzaPromisCheltuieli', titlu: '5. Repartizare Taxe Notariale', detaliu: 'Cheltuielile ocazionate de autentificarea actelor, onorariile notariale, taxele de intabulare în Cartea Funciară (OCPI) și extrasul de autentificare vor fi suportate conform convenției părților.' }
  ]
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [autoStep, setAutoStep] = useState('upload');
  const [hydrated, setHydrated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [qrType, setQrType] = useState('url'); 
  const [qrData, setQrData] = useState({ nume: '', telefon: '', iban: '', suma: '', url: '', email: '', functie: '', banca: '' });
  const [qrGeneratedUrl, setQrGeneratedUrl] = useState('');

  const [cursBnr, setCursBnr] = useState({ eur: '4.9752', usd: '4.5820' });
  
  const [indiciBursa, setIndiciBursa] = useState({
    bet: { puncte: '17,420.50', procent: '+1.24%', vol: '45.2M', high: '17,450.00', low: '17,210.20', trend: [] },
    sp500: { puncte: '5,310.12', procent: '+0.68%', vol: '2.1B', high: '5,325.50', low: '5,280.10', trend: [] },
    nasdaq: { puncte: '18,650.45', procent: '-0.12%', vol: '1.8B', high: '18,720.00', low: '18,590.30', trend: [] }
  });
  const [stiriLive, setStiriLive] = useState([]);

  const [user, setUser] = useState(null); 
  const [userTier, setUserTier] = useState('free');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false); 
  
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const [widgetCompany, setWidgetCompany] = useState(null);
  const [widgetLoading, setWidgetLoading] = useState(false);

  const [anafCui, setAnafCui] = useState('');
  const [rarWidgetVin, setRarWidgetVin] = useState('');
  const [rarWidgetLoading, setRarWidgetLoading] = useState(false);
  const [rarWidgetReport, setRarWidgetReport] = useState(null);
  const [isAiOpen, setIsAiOpen] = useState(false);

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
    clientNume: '', clientCui: '', clientEmail: '', clientTelefon: '',
    obiect: '', valoare: '', moneda: 'RON', emiteFacturaAvans: false, trimitePeWhatsApp: false,
    estePlatitorTVA: false,
    clauzaPi: true, clauzaPenalitati: true, clauzaRevizii: false, tarifOrar: '150',
    clauzaRawFoto: false, clauzaMarketingTerti: false, clauzaAprobareTacita: false, clauzaTaxaAnulare: false,
    clauzaSplitPayment: false, clauzaRetentie: false
  });

  const [rarData, setRarData] = useState(null);
  const [autoDocs, setAutoDocs] = useState({ civ: null, buletin_vanzator: null, buletin_cumparator: null, talon: null });
  const [isUploading, setIsUploading] = useState(false);

  const [scrollPercent, setScrollPercent] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);

  const [aiChatMessages, setAiChatMessages] = useState([]);
  const [aiInputMessage, setAiInputMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const canvasRef = useRef(null);

  const [autoData, setAutoData] = useState({
    vanzatorTip: 'PF', 
    vanzatorNume: '', vanzatorCnp: '', vanzatorCui: '', vanzatorRegCom: '', vanzatorSediu: '',
    cumparatorTip: 'PF', 
    cumparatorNume: '', cumparatorCnp: '', cumparatorCui: '', cumparatorRegCom: '', cumparatorSediu: '',
    autoVin: '', autoMarcaModel: '', autoNumarInmatriculare: '', autoPret: '', clientEmail: '',
    autoAdresaVanzator: '', autoAdresaCumparator: '', pretIncludeTVA: false, autoMoneda: 'RON'
  });

  const genereazaValoareQR = () => {
    if (qrType === 'vcard') {
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${qrData.nume}\nTITLE:${qrData.functie}\nTEL:${qrData.telefon}\nEMAIL:${qrData.email}\nEND:VCARD`;
    }
    if (qrType === 'iban') {
      return `BCD\n002\n1\nSCT\n\n${qrData.nume}\n${qrData.iban}\n${qrData.suma}\n\n\n\n${qrData.banca}`;
    }
    return qrData.url || 'https://contractsmart.ro';
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
    const canvas = document.getElementById('contract-qr');
    if (canvas) {
      // Creăm un canvas temporar la o rezoluție mare (ex: 1000x1000 pixeli) pentru claritate maximă la descărcare
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 1000;
      tempCanvas.height = 1000;
      const ctx = tempCanvas.getContext('2d');
      
      // Umplem fundalul cu alb pentru contrast curat
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Desenăm QR-ul original la scara mare
      ctx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);

      const pngUrl = tempCanvas.toDataURL('image/png', 1.0);
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'ContractSmart-QR-Mare.png';
      downloadLink.click();
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
      impozitFirma = brutAnual * (fiscal.areAngajati ? 0.01 : 0.03);
      const profitRamas = brutAnual - impozitFirma;
      dividendTax = profitRamas * 0.08;
      
      if (profitRamas >= SALARIU_MINIM_2026 * 24) cass = SALARIU_MINIM_2026 * 24 * 0.10;
      else if (profitRamas >= SALARIU_MINIM_2026 * 12) cass = SALARIU_MINIM_2026 * 12 * 0.10;
      else if (profitRamas >= SALARIU_MINIM_2026 * 6) cass = SALARIU_MINIM_2026 * 6 * 0.10;
    } else if (fiscal.formaJuridica === 'PFA_SISTEM_REAL') {
      if (brutAnual >= SALARIU_MINIM_2026 * 24) cas = SALARIU_MINIM_2026 * 24 * 0.25;
      else if (brutAnual >= SALARIU_MINIM_2026 * 12) cas = SALARIU_MINIM_2026 * 12 * 0.25;
      
      const bazzCass = Math.max(SALARIU_MINIM_2026 * 6, Math.min(brutAnual, SALARIU_MINIM_2026 * 60));
      cass = bazzCass * 0.10;
      impozitFirma = Math.max(0, (brutAnual - cas) * 0.10);
    } else {
      const bazaCalcul = fiscal.normaRegiune;
      cas = bazaCalcul >= SALARIU_MINIM_2026 * 12 ? SALARIU_MINIM_2026 * 12 * 0.25 : 0;
      cass = bazaCalcul >= SALARIU_MINIM_2026 * 6 ? SALARIU_MINIM_2026 * 6 * 0.10 : SALARIU_MINIM_2026 * 6 * 0.10;
      impozitFirma = bazaCalcul * 0.10;
    }

    const totalTaxeAnuale = impozitFirma + cas + cass + dividendTax;
    return {
      taxeLunare: Math.round(totalTaxeAnuale / 12),
      netLunar: Math.round((brutAnual - totalTaxeAnuale) / 12),
      defalcare: {
        impozit: Math.round((impozitFirma + dividendTax) / 12),
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
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  };

  const opresteDesenul = () => setIsDrawing(false);
  const curataCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const fetchUserProfile = async (userId, email) => {
      try {
        const { data: profile } = await supabase.from('profiles').select('subscription_tier, credits_remaining').eq('id', userId).single();
        setUser({ 
          id: userId, 
          email: email, 
          status: profile?.subscription_tier || 'free', 
          credits: profile?.credits_remaining ?? 0 
        });
        setUserTier(profile?.subscription_tier || 'free');
      } catch (err) {
        setUser({ id: userId, email: email, status: 'free', credits: 0 });
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

  const handleQuickAnafFormSubmit = async (e) => {
    e.preventDefault();
    const cuiCurat = anafCui.replace(/[^0-9]/g, '');
    if (!cuiCurat) return alert('Introdu un CUI valid format doar din cifre.');
    
    setWidgetLoading(true);
    try {
      const res = await fetch('/api/company-info', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cui: cuiCurat, userId: user?.id }) 
      });
      const data = await res.json();
      if (data.success) {
        setWidgetCompany({
          ...data,
          necesita_plata: !data.detalii_premium
        });
      } else {
        alert(data.message || "CUI invalid sau inexistent.");
        setWidgetCompany(null);
      }
    } catch {
      alert('Eroare la procesarea interogării.');
    } finally {
      setWidgetLoading(false);
    }
  };

  const handleQuickRarWidgetSubmit = async (e) => {
    e.preventDefault();
    const vinCurat = rarWidgetVin.replace(/[^A-HJ-NPR-Z0-9]/gi, '').toUpperCase().trim();
    if (!vinCurat || vinCurat.length !== 17) return alert('Introdu o serie de șasiu (VIN) validă.');
    
    setRarWidgetLoading(true);
    setRarWidgetReport(null);
    try {
      const res = await fetch('/api/auto/rar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin: vinCurat, userId: user?.id || null })
      }).then(r => r.json());

      if (res.success && res.date) {
        setRarWidgetReport({
          ...res,
          date: {
            itpValid: res.date.itpValid,
            dataExpirareItp: res.date.dataExpirareItp
          }
        });
        
        if (res.rarReport?.kmNeconformi || res.rarReport?.odometruProbleme) {
          alert("⚠️ ATENȚIE: Raportul RAR indică suspiciuni de manipulare a odometrului (km dați înapoi) sau istoric de daune majore!");
        }
      } else {
        alert(res.error || 'Eroare la interogarea RAR.');
      }
    } catch {
      alert('Eroare de rețea la interogarea serverelor RAR.');
    } finally {
      setRarWidgetLoading(false);
    }
  };

  const handleInterogareRar = async (e) => {
    e.preventDefault();
    if (!autoData.autoVin) return alert('Introdu seria de șasiu (VIN)!');
    setAutoStep('rar_loading');

    try {
      const res = await fetch('/api/auto/rar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin: autoData.autoVin, userId: user?.id || null })
      });
      const data = await res.json();
      if (data.success) {
        setRarData(data.rarReport);
        setAutoStep('rar_result');
        
        if (data.rarReport?.kmNeconformi || data.rarReport?.odometruProbleme) {
          alert("⚠️ ALERTĂ SISTEM: Acest vehicul prezintă neconcordanțe tehnice în baza de date RAR (posibili kilometri dați înapoi). Verificați cu atenție clauza de km garantați din procesul-verbal!");
        }
      } else {
        alert(data.error || 'Nu s-au putut prelua datele de la RAR.');
        setAutoStep('upload');
      }
    } catch {
      alert('Eroare la comunicarea cu API-ul RAR.');
      setAutoStep('upload');
    }
  };

  const handleCumparaPremium = async (tipProdus = 'founder') => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user?.email || 'client@contractsmart.ro', tipProdus, userId: user?.id || null })
      });
      const data = await res.json();
      
      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert(data.message || 'Eroare la inițierea plății LemonSqueezy. Asigură-te că ai setat cheile API în backend.');
      }
    } catch (e) {
      alert('A apărut o problemă de conexiune cu procesatorul de plăți.');
    }
    setLoading(false);
  };

  const handleLansareContract = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Pentru a descărca documentul direct în format binar, creează un cont rapid în 10 secunde.');
      setIsSignUp(false);
      setAuthEmail('');
      setAuthPassword('');
      setAuthConfirmPassword('');
      setShowAuthModal(true);
      return;
    }

    let imagineSemnaturaText = '';
    if (canvasRef.current) {
      imagineSemnaturaText = canvasRef.current.toDataURL('image/png');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/generate-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, prestatorEmail: user.email, semnăturaBase64: imagineSemnaturaText, userId: user.id })
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
      setLoading(false);
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
    if (!user) {
      alert('Creează un cont rapid pentru a securiza și descărca documentele auto.');
      setIsSignUp(false);
      setAuthEmail('');
      setAuthPassword('');
      setAuthConfirmPassword('');
      setShowAuthModal(true);
      return;
    }
    setLoading(true);

    try {
      const binarFormData = new FormData();
      const secureAutoDataPayload = {
        ...autoData,
        clientEmail: user.email,
        userId: user.id, 
        pretIncludeTVA: autoData.pretIncludeTVA,
        rarReportBonus: rarData || null
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
      setLoading(false);
    }
  };

  const handleSendAiMessage = async (e) => {
    e.preventDefault();
    if (!aiInputMessage.trim()) return;
    const userMsg = { role: 'user', content: aiInputMessage };
    setAiChatMessages(prev => [...prev, userMsg]);
    setAiInputMessage('');
    setAiLoading(true);
    try {
      const res = await fetch('/api/consilier-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, history: aiChatMessages, userId: user?.id || null })
      });
      const data = await res.json();
      if (data.success) {
        setAiChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        alert(data.message || 'Eroare de la Asistentul AI.');
      }
    } catch {
      alert('Eroare de conexiune cu Asistentul Virtual.');
    } finally {
      setAiLoading(false);
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
    if (!authEmail || !authPassword) return alert('Introdu datele complete.');
    
    if (isSignUp && authPassword !== authConfirmPassword) {
      return alert('Eroare: Parolele introduse nu coincid!');
    }

    setLoading(true); 
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
      setLoading(false);
    }
  };

  const handleDynamicReportDownload = async (tip, cheieIdentificare) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/verify/download-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tip: tip, identificator: cheieIdentificare, userId: user?.id })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `raport_premium_${tip}_${cheieIdentificare}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Eroare la descărcarea raportului din backend. Te rugăm să reîncerci.');
      }
    } catch {
      alert('Eroare de rețea la descărcarea PDF-ului.');
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) {
    return <div className="min-h-screen bg-[#0B0F12]" />;
  }

  return (
    <div 
      className="min-h-screen bg-[#0B0F12] text-slate-200 font-sans pb-16 relative overflow-x-hidden"
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
      {/* NAVBAR OPTIMIZAT */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#0B0F12]/90 border-b border-slate-800 py-4 px-6 shadow-lg transition-all">
        <div className="flex justify-between items-center">
          <div className="w-[180px] h-[30px] flex items-center" onClick={() => setStep(1)}>
            <svg viewBox="0 0 240 40" className="w-full h-full cursor-pointer">
              <g transform="translate(0, 2)">
                <path d="M24 6 C15 6, 8 13, 8 22 C8 31, 15 38, 24 38 C31 38, 37 33, 39 27" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round"/>
                <path d="M16 21 L21 26 L32 12" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <text x="48" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="20" fill="#FFFFFF" letterSpacing="-0.5">
                Contract<tspan fill="#8ba888">Smart</tspan>
              </text>
            </svg>
          </div>
          
          {/* Buton Hamburger pentru Mobil */}
          <button 
            className="md:hidden text-[#8ba888] text-2xl focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>

          {/* Meniu Desktop */}
          <div className="hidden md:flex items-center space-x-5">
            <Link href="/modele-contracte" className="text-xs text-slate-400 hover:text-white transition">Modele Contracte</Link>
            <span className="text-slate-800">|</span>
            <Link href="/baza-legala" className="text-xs text-slate-400 hover:text-white transition">Validitate Juridică</Link>
            <span className="text-slate-800">|</span>
            <Link href="/termeni-si-conditii" className="text-xs text-slate-400 hover:text-white transition">Termeni și Condiții</Link>
            <span className="text-slate-800">|</span>
            
            {!user ? (
              <button type="button" onClick={() => { setIsSignUp(false); setShowAuthModal(true); }} className="text-xs font-bold text-slate-300 hover:text-[#8ba888] transition">Autentificare / Cont Nou</button>
            ) : (
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-slate-400">Cont: <strong className="text-white font-mono font-normal">{user.email}</strong> 
                  <span className="ml-1.5 text-[10px] uppercase font-bold bg-[#16221A] text-[#8ba888] px-2 py-0.5 rounded border border-emerald-900/40">
                    {user.status}
                  </span>
                </span>
                <button type="button" onClick={handleLogout} className="text-red-400 font-bold hover:underline">Ieșire</button>
              </div>
            )}
            <button onClick={() => { const el = document.getElementById('sectiune-preturi'); el?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-[#8ba888] hover:opacity-90 text-[#0B0F12] font-black text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-[#8ba888]/10">Vezi Oferte</button>
          </div>
        </div>

        {/* Meniu Mobil (Dropdown) */}
        {isMobileMenuOpen && (
          <div className="md:hidden flex flex-col space-y-4 pt-4 mt-4 border-t border-slate-800 animate-fadeIn">
            <Link href="/modele-contracte" className="text-sm text-slate-300 hover:text-white">Modele Contracte</Link>
            <Link href="/baza-legala" className="text-sm text-slate-300 hover:text-white">Validitate Juridică</Link>
            <Link href="/termeni-si-conditii" className="text-sm text-slate-300 hover:text-white">Termeni și Condiții</Link>
            
            {!user ? (
              <button type="button" onClick={() => { setIsMobileMenuOpen(false); setIsSignUp(false); setShowAuthModal(true); }} className="text-sm font-bold text-[#8ba888] text-left">Autentificare / Cont Nou</button>
            ) : (
              <div className="flex flex-col space-y-2 border-t border-slate-800/50 pt-2">
                <span className="text-xs text-slate-400">Logat ca: {user.email}</span>
                <button type="button" onClick={handleLogout} className="text-red-400 text-sm font-bold text-left">Ieșire din cont</button>
              </div>
            )}
            <button onClick={() => { setIsMobileMenuOpen(false); const el = document.getElementById('sectiune-preturi'); el?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-[#8ba888] text-[#0B0F12] font-black text-sm px-4 py-3 rounded-xl text-center">Vezi Oferte</button>
          </div>
        )}
      </nav>

      {/* AMBIENT BLOBS */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#8ba888]/5 blur-[120px]" style={{ top: 'calc(10% + (var(--scroll-y) * 0.3))', left: '15%' }} />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-slate-700/5 blur-[150px]" style={{ top: 'calc(50% - (var(--scroll-y) * 0.2))', right: '10%' }} />
      </div>

      {/* CONȚINUT EXCLUSIV */}
      <div className="relative z-10">

        {/* MODAL AUTH */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#12181D] border border-slate-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative">
              <button type="button" onClick={() => { setShowAuthModal(false); setIsSignUp(false); setAuthPassword(''); setAuthConfirmPassword(''); }} className="absolute top-4 right-4 text-slate-500 hover:text-white text-md font-bold transition">✕</button>
              <h3 className="text-xl font-black text-white mb-1">{isSignUp ? 'Creează un Cont Nou' : 'Autentificare Portabilitate'}</h3>
              <p className="text-xs text-slate-500 mb-6">Securizează documentele în serverele Supabase.</p>
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Adresă de Email</label>
                  <input type="email" required placeholder="nume@companie.ro" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full p-3 bg-[#0B0F12] border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-[#8ba888]" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Parolă Validă</label>
                  <input type="password" required placeholder="••••••••" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full p-3 bg-[#0B0F12] border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-[#8ba888]" />
                </div>
                {isSignUp && (
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Confirmă Parola</label>
                    <input type="password" required placeholder="••••••••" value={authConfirmPassword} onChange={e => setAuthConfirmPassword(e.target.value)} className="w-full p-3 bg-[#0B0F12] border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-[#8ba888]" />
                  </div>
                )}
                <button type="submit" disabled={loading} className="w-full bg-[#8ba888] text-[#0B0F12] font-black py-3 rounded-xl text-xs tracking-tight transition hover:opacity-90 mt-2">
                  {loading ? 'Se procesează...' : isSignUp ? 'Confirmă Înregistrarea' : 'Conectare Securizată'}
                </button>
              </form>
              <div className="text-center mt-5 pt-4 border-t border-slate-800/80">
                <button type="button" onClick={() => { setIsSignUp(!isSignUp); setAuthPassword(''); setAuthConfirmPassword(''); }} className="text-xs text-slate-400 hover:text-white underline">{isSignUp ? 'Ai deja cont? Conectează-te' : 'Nu ai cont? Creează unul acum'}</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PLĂȚI PER CONTRACT */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#12181D] border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl relative text-center">
              <button type="button" onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white text-md font-bold transition">✕</button>
              <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🔒</div>
              <h3 className="text-xl font-black text-white mb-2">Plafon Gratuit Atins</h3>
              <p className="text-sm text-slate-400 mb-6">Ai utilizat generarea gratuită din această lună. Deblochează documentul actual sau treci la Premium pentru generări nelimitate.</p>
              
              <div className="space-y-3">
                <button onClick={() => { setShowPaymentModal(false); handleCumparaPremium('one_time_contract'); }} className="w-full bg-[#0B0F12] hover:bg-slate-900 border border-slate-700 text-white font-bold py-3 rounded-xl text-sm transition flex justify-between items-center px-4">
                  <span>Cumpără 1 Contract Acum</span>
                  <span className="text-[#8ba888]">19 RON</span>
                </button>
                <button onClick={() => { setShowPaymentModal(false); handleCumparaPremium('pro'); }} className="w-full bg-[#8ba888] text-[#0B0F12] font-black py-3 rounded-xl text-sm transition hover:opacity-90 flex justify-between items-center px-4 shadow-lg shadow-[#8ba888]/10">
                  <span>Abonament Pro (Nelimitat)</span>
                  <span>69 RON / lună</span>
                </button>
              </div>
              <button onClick={() => { setShowPaymentModal(false); const el = document.getElementById('sectiune-preturi'); el?.scrollIntoView({ behavior: 'smooth' }); }} className="text-xs text-slate-500 hover:text-white mt-5 underline">Vezi toate beneficiile planurilor</button>
            </div>
          </div>
        )}

        {/* DASHBOARD STEP 1 */}
        {step === 1 && (
          <div className="w-full">
            <div className="max-w-4xl mx-auto text-center py-16 px-4">
              <span className="bg-[#16221A] text-[#8ba888] border border-[#8ba888]/20 text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase">Infrastructură Electronică de Securizare Comercială</span>
              <h1 className="text-5xl md:text-6xl font-black text-white mt-6 leading-tight tracking-tighter">Asigurarea Încasărilor <br/><span className="text-[#8ba888]">Privitor La Management de Clauze</span></h1>
              
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto px-4">
                <button type="button" onClick={() => { setFormData(prev => ({ ...prev, tipContract: 'prestari' })); setStep(2); }} className="bg-[#8ba888] hover:opacity-90 text-[#0B0F12] font-black px-4 py-4 rounded-xl shadow-xl shadow-[#8ba888]/5 transition text-xs tracking-tight flex items-center justify-center gap-2">
                    Generator Contracte Servicii & B2B
                </button>
                <button type="button" onClick={() => { setFormData(prev => ({ ...prev, tipContract: 'auto' })); setStep(2); }} className="bg-[#12181D] border border-slate-700 text-white font-bold px-4 py-4 rounded-xl hover:border-[#8ba888]/50 transition text-xs tracking-tight flex items-center justify-center gap-2">
                    Generator Pachet Acte Tranzacții Auto
                </button>
              </div>
            </div>

            {/* BENTO GRID ÎN 3 COLOANE */}
            <div className="max-w-6xl mx-auto px-6 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
  
  {/* COLOANA 1: CALCULATOR FISCAL */}
  <div className="bg-[#12181D] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
    <div>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Calculator Fiscal Inteligent (Plafoane CASS)</span>
      <div className="space-y-4 text-xs">
        <div>
          <label className="text-slate-400 block mb-1">
            Venit Brut Facturat Lunar: <span className="text-white font-mono font-bold">{fiscal.venitLunar.toLocaleString('ro-RO')} RON</span>
          </label>
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
            <select value={fiscal.formaJuridica} onChange={e => setFiscal({...fiscal, formaJuridica: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700 rounded-lg p-2 text-white outline-none text-xs">
              <option value="SRL">SRL (Microîntreprindere)</option>
              <option value="PFA_SISTEM_REAL">PFA (Sistem Real)</option>
            </select>
          </div>
        </div>
        {fiscal.formaJuridica !== 'PFA_SISTEM_REAL' && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <label className="flex items-center p-2 bg-[#0B0F12] rounded-lg border border-slate-800 cursor-pointer">
              <input type="checkbox" checked={fiscal.areAngajati} onChange={e => setFiscal({...fiscal, areAngajati: e.target.checked})} className="mr-2 accent-[#8ba888]" />
              Are Angajați
            </label>
            <label className="flex items-center p-2 bg-[#0B0F12] rounded-lg border border-slate-800/60 cursor-pointer">
              <input type="checkbox" checked={fiscal.platitorTva} onChange={e => setFiscal({...fiscal, platitorTva: e.target.checked})} className="mr-2 accent-[#8ba888]" />
              Plătitor TVA
            </label>
          </div>
        )}
      </div>
    </div>
    
    <div className="w-full space-y-3 mt-4">
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 font-mono text-[11px]">
        <div className="bg-[#0B0F12] p-2 rounded-xl border border-slate-800/40">
          <span className="text-slate-500 block">Impozit lunar estimat:</span>
          <span className="text-slate-300 font-bold">{rezultateFiscale.defalcare.impozit} RON</span>
        </div>
        <div className="bg-[#0B0F12] p-2 rounded-xl border border-slate-800/40">
          <span className="text-slate-500 block">Contribuții (CAS/CASS):</span>
          <span className="text-slate-300 font-bold">{rezultateFiscale.defalcare.sociale} RON</span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800 bg-[#0B0F12] p-3 rounded-xl border border-slate-800/60 flex justify-between items-center text-xs">
        <div><span className="text-slate-400 block">Dări Stat (Total): <strong className="text-red-400 font-mono">{rezultateFiscale.taxeLunare} RON</strong></span></div>
        <div className="text-right"><span className="text-slate-400 block">Profit Curat Net Lunar: <strong className="text-[#8ba888] font-mono text-sm">{rezultateFiscale.netLunar} RON</strong></span></div>
      </div>
    </div>
  </div>

  {/* COLOANA 2: WIDGET QR CODE COMPLEX */}
  <div className="bg-[#12181D] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
    <div className="space-y-4">
      <div>
        <span className="text-[#8ba888] text-xs font-bold uppercase tracking-wider block mb-1">Utilitar Rapid</span>
        <h3 className="text-white font-bold text-lg">Generator Coduri QR</h3>
        <p className="text-xs text-slate-400 mt-1">Transformă linkuri, cărți de vizită sau conturi IBAN în format scanabil.</p>
      </div>
      
      <div className="flex flex-col gap-3">
         <select value={qrType} onChange={(e) => setQrType(e.target.value)} className="bg-[#0B0F12] border border-slate-700 rounded-lg p-2 text-xs text-white outline-none w-full">
            <option value="url">Website URL</option>
            <option value="vcard">Carte de Vizită (vCard)</option>
            <option value="iban">Cont IBAN (Plată Rapidă)</option>
         </select>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {qrType === 'url' && (
              <input type="text" placeholder="https://..." value={qrData.url} onChange={(e) => setQrData({...qrData, url: e.target.value})} className="col-span-1 sm:col-span-2 bg-[#0B0F12] border border-slate-700 rounded-lg p-2 text-xs text-white outline-none" />
            )}
            {qrType === 'vcard' && (
              <>
                <input type="text" placeholder="Nume Complet" value={qrData.nume} onChange={(e) => setQrData({...qrData, nume: e.target.value})} className="bg-[#0B0F12] border border-slate-700 rounded-lg p-2 text-xs text-white outline-none" />
                <input type="text" placeholder="Funcție / Titlu" value={qrData.functie} onChange={(e) => setQrData({...qrData, functie: e.target.value})} className="bg-[#0B0F12] border border-slate-700 rounded-lg p-2 text-xs text-white outline-none" />
                <input type="tel" placeholder="Număr Telefon" value={qrData.telefon} onChange={(e) => setQrData({...qrData, telefon: e.target.value})} className="bg-[#0B0F12] border border-slate-700 rounded-lg p-2 text-xs text-white outline-none" />
                <input type="email" placeholder="Adresă Email" value={qrData.email} onChange={(e) => setQrData({...qrData, email: e.target.value})} className="bg-[#0B0F12] border border-slate-700 rounded-lg p-2 text-xs text-white outline-none" />
              </>
            )}
            {qrType === 'iban' && (
              <>
                <input type="text" placeholder="Nume Titular" value={qrData.nume} onChange={(e) => setQrData({...qrData, nume: e.target.value})} className="col-span-1 sm:col-span-2 bg-[#0B0F12] border border-slate-700 rounded-lg p-2 text-xs text-white outline-none" />
                <input type="text" placeholder="RO.. IBAN" value={qrData.iban} onChange={(e) => setQrData({...qrData, iban: e.target.value})} className="bg-[#0B0F12] border border-slate-700 rounded-lg p-2 text-xs text-white outline-none" />
                <input type="text" placeholder="Bancă" value={qrData.banca} onChange={(e) => setQrData({...qrData, banca: e.target.value})} className="bg-[#0B0F12] border border-slate-700 rounded-lg p-2 text-xs text-white outline-none" />
                <input type="number" placeholder="Suma RON" value={qrData.suma} onChange={(e) => setQrData({...qrData, suma: e.target.value})} className="col-span-1 sm:col-span-2 bg-[#0B0F12] border border-slate-700 rounded-lg p-2 text-xs text-white outline-none" />
              </>
            )}
         </div>
      </div>
    </div>

    <div className="flex items-center justify-between gap-4 pt-4 mt-4 border-t border-slate-800">
      <div className="bg-white p-2 rounded-xl shrink-0">
        <QRCodeCanvas 
            id="contract-qr"
            value={genereazaValoareQR()} 
            size={110} 
            fgColor="#8ba888" 
            level="H" 
            includeMargin={true}
        />
      </div>
      <button onClick={handleDownloadQR} className="w-full bg-[#8ba888] hover:bg-[#789575] text-white font-bold py-3 px-4 rounded-xl text-xs transition">
        Descărcare QR (PNG)
      </button>
    </div>
  </div>

</div>

          </div>
        )}

        {/* STEP 2: MULTI-FORMULAR SECREȚIONAT STRUCTURAL */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto py-6 px-4">
            <div className="mb-4 flex items-center justify-between bg-[#12181D] border border-slate-800/80 px-5 py-3 rounded-xl shadow-lg">
              <button type="button" onClick={() => { setStep(1); setAutoStep('upload'); }} className="text-xs font-bold text-[#8ba888] hover:text-white flex items-center gap-1.5 transition">
                &larr; Înapoi la Panoul Principal
              </button>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Configurare Securizată v2.0</span>
            </div>

            <div className="bg-[#12181D] p-8 rounded-2xl border border-slate-800 shadow-2xl">
              
              {formData.tipContract !== 'auto' ? (
                <form onSubmit={handleLansareContract} className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Configurator Document Comercial Electronic</h2>
                  <div className="bg-[#0B0F12] p-4 rounded-xl border border-slate-800">
                    <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Tipul Documentului Generat</label>
                    <select 
                      value={formData.tipContract} 
                      onChange={e => setFormData({...formData, tipContract: e.target.value})} 
                      className="w-full bg-[#12181D] border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#8ba888]"
                    >
                      <option value="prestari">Contract de Prestări Servicii (General)</option>
                      <option value="nda">Acord de Confidențialitate (NDA)</option>
                      <option value="cda">Contract de Drepturi de Autor (CDA)</option>
                      <option value="inchiriere_imobil">Contract de Închiriere Imobil (Locuință/Spațiu)</option>
                      <option value="promisiune_vanzare">Promisiune (Antecontract) Vânzare-Cumpărare Imobil</option>
                    </select>
                  </div>

                  <div className="bg-[#0B0F12] p-4 rounded-xl border border-slate-800 space-y-2">
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

                  <div className="bg-[#0B0F12] p-5 rounded-xl border border-slate-800 space-y-4 mb-6">
                    <span className="text-xs font-bold text-[#8ba888] uppercase block tracking-wider">Identitate Vizuală (Branding Prestator)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">CUI / CNP Prestator</label>
                        <input type="text" placeholder="CUI / CNP Prestator" autoComplete="new-password" value={formData.prestatorCui} onChange={e => setFormData({...formData, prestatorCui: e.target.value})} className="w-full p-2.5 bg-[#12181D] border border-slate-700 rounded-lg text-xs text-white outline-none focus:border-[#8ba888]" />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Denumire Furnizor / Nume</label>
                        <input type="text" placeholder="Denumire Firma / Nume Complet" autoComplete="new-password" value={formData.prestatorNume} onChange={e => setFormData({...formData, prestatorNume: e.target.value})} className="p-2.5 bg-[#12181D] border border-slate-700 rounded-lg text-xs text-white outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Link Siglă (.png)</label>
                        <input type="text" placeholder="Link Siglă (.png)" value={formData.prestatorLogo} onChange={e => setFormData({...formData, prestatorLogo: e.target.value})} className="p-2.5 bg-[#12181D] border border-slate-700 rounded-lg text-xs text-white outline-none" />
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
                      <input type="text" placeholder="CUI / CNP Client" autoComplete="new-password" value={formData.clientCui} onChange={e => setFormData({...formData, clientCui: e.target.value})} className="w-full p-2.5 bg-[#0B0F12] border border-slate-700 rounded-lg text-xs text-white outline-none focus:border-[#8ba888]" />
                      <input type="text" placeholder="Companie Client / Nume" autoComplete="new-password" value={formData.clientNume} onChange={e => setFormData({...formData, clientNume: e.target.value})} className="p-2.5 bg-[#0B0F12] border border-slate-700 rounded-lg text-xs text-white" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input type="email" placeholder="Email Client" autoComplete="new-password" value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} className="p-2.5 bg-[#0B0F12] border border-slate-700 rounded-lg text-xs text-white focus:border-[#8ba888]" required />
                      <input type="text" placeholder="WhatsApp Client" autoComplete="new-password" value={formData.clientTelefon} onChange={e => setFormData({...formData, clientTelefon: e.target.value})} className="p-2.5 bg-[#0B0F12] border border-slate-700 rounded-lg text-xs text-white focus:border-[#8ba888]" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <label className="flex items-center p-3 bg-[#0B0F12] rounded-xl border border-slate-800/60 cursor-pointer select-none text-xs text-slate-300">
                        <input 
                          type="checkbox" 
                          checked={formData.trimitePeWhatsApp || false} 
                          onChange={e => setFormData({...formData, trimitePeWhatsApp: e.target.checked})} 
                          className="mr-3 accent-[#8ba888]" 
                        />
                        <div>
                          <span className="font-bold block text-white">Replicare pe WhatsApp</span>
                          <span className="text-[10px] text-slate-500 block">Trimite automat un ping securizat clientului la semnare.</span>
                        </div>
                      </label>

                      <label className="flex items-center p-3 bg-[#0B0F12] rounded-xl border border-slate-800 cursor-pointer select-none text-xs text-slate-300">
                        <input 
                          type="checkbox" 
                          checked={formData.emiteFacturaAvans || false} 
                          onChange={e => setFormData({...formData, emiteFacturaAvans: e.target.checked})} 
                          className="mr-3 accent-[#8ba888]" 
                        />
                        <div>
                          <span className="font-bold block text-white">Facturare Automatizată Avans</span>
                          <span className="text-[10px] text-slate-500 block">Generează proformă corelată electronic prin e-Factura.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <span className="text-xs font-bold text-slate-400 uppercase block">Obiectul Serviciilor / Tranzacției și Remunerație</span>
                    <textarea placeholder="Descrierea explicită a sarcinilor, termenelor și obiectivelor..." value={formData.obiect} onChange={e => setFormData({...formData, obiect: e.target.value})} className="w-full p-3 bg-[#0B0F12] border border-slate-700 rounded-lg text-xs h-16 text-white resize-none" required></textarea>
                    {formData.tipContract !== 'nda' && (
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex w-full sm:w-1/2 gap-3">
                          <input type="number" placeholder="Valoare Contractuală" autoComplete="new-password" value={formData.valoare} onChange={e => setFormData({...formData, valoare: e.target.value})} className="flex-1 p-2.5 bg-[#0B0F12] border border-slate-700 rounded-lg text-xs text-white" required />
                          <select value={formData.moneda} onChange={e => setFormData({...formData, moneda: e.target.value})} className="w-24 bg-[#0B0F12] border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#8ba888]">
                            <option value="RON">RON</option>
                            <option value="EUR">EUR (€)</option>
                          </select>
                        </div>
                        <label className="flex items-center w-full sm:w-1/2 text-xs text-slate-400 cursor-pointer select-none p-2.5 bg-[#0B0F12] border border-slate-800 rounded-lg">
                          <input type="checkbox" checked={formData.estePlatitorTVA} onChange={e => setFormData({...formData, estePlatitorTVA: e.target.checked})} className="mr-3 accent-[#8ba888]" />
                          <span className="truncate">Firma e plătitoare de TVA (+21%)</span>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-amber-400 uppercase block">Activare Clauze Specifice de Asigurare Plată</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {(nomenclatorClauze[formData.tipContract] || nomenclatorClauze.prestari).map((clauza) => (
                        <label key={clauza.id} className="flex items-start p-3 bg-[#0B0F12] border border-slate-800 rounded-xl cursor-pointer">
                          <input type="checkbox" checked={!!formData[clauza.id]} onChange={e => setFormData({...formData, [clauza.id]: e.target.checked})} className="mt-0.5 mr-3 accent-[#8ba888]" />
                          <div>
                            <span className="font-bold text-white block">{clauza.titlu}</span>
                            <span className="text-[10px] text-slate-500 block">{clauza.detaliu}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#0B0F12] p-4 rounded-xl border border-slate-800 space-y-2">
                    <canvas ref={canvasRef} width={600} height={150} onTouchStart={pornesteDesenul} onTouchMove={deseneaza} onTouchEnd={opresteDesenul} onMouseDown={pornesteDesenul} onMouseMove={deseneaza} onMouseUp={opresteDesenul} onMouseLeave={opresteDesenul} className="w-full h-32 bg-white rounded-lg border border-slate-700 cursor-crosshair block touch-none" />
                    <button type="button" onClick={curataCanvas} className="text-[10px] text-red-400 hover:underline block text-right w-full">Șterge / Resemnează</button>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-slate-800">
                    <button type="button" onClick={() => { setStep(1); setAutoStep('upload'); }} className="text-xs text-slate-400 underline">Înapoi</button>
                    <button type="submit" disabled={loading} className="bg-[#8ba888] text-[#0B0F12] font-black px-8 py-4 rounded-xl text-sm transition hover:opacity-90">
                      {loading ? 'Se înregistrează...' : 'Descărcare PDF directă'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleGenereazaPachetAuto} className="space-y-6" autoComplete="off">
                  <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-2xl font-black text-white">Asistent Automatizat de Vânzare Auto & Verificare RAR</h2>
                    <p className="text-xs text-slate-400">Generare Contracte (5 exemplare), Fișă Înmatriculare și Verificare Cadru ITP/RAR</p>
                  </div>

                  {autoStep === 'upload' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-[#0B0F12] border border-slate-800 rounded-xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-xs font-bold text-[#8ba888] uppercase tracking-wide">1. Identitate Persoană Vânzător</span>
                          <div className="flex gap-2 bg-[#12181D] p-1 rounded-lg border border-slate-800">
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

                      <div className="p-4 bg-[#0B0F12] border border-slate-800 rounded-xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-xs font-bold text-[#8ba888] uppercase tracking-wide">2. Identitate Persoană Cumpărător</span>
                          <div className="flex gap-2 bg-[#12181D] p-1 rounded-lg border border-slate-800">
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
                        
                        <div className="bg-[#0B0F12] p-4 border border-slate-800 rounded-xl text-center flex flex-col justify-between min-h-[140px]">
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

                        <div className="bg-[#0B0F12] p-4 border border-slate-800 rounded-xl text-center flex flex-col justify-between min-h-[140px]">
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

                        <div className="bg-[#0B0F12] p-4 border border-slate-800 rounded-xl text-center flex flex-col justify-between min-h-[140px]">
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

                        <div className="bg-[#0B0F12] p-4 border border-slate-800 rounded-xl text-center flex flex-col justify-between min-h-[140px]">
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
                          <input type="text" placeholder="Serie Șasiu / VIN" autoComplete="new-password" required value={autoData.autoVin} onChange={e => setAutoData({...autoData, autoVin: e.target.value.toUpperCase()})} className="p-2.5 bg-[#0B0F12] border border-slate-700 rounded-lg text-xs text-white uppercase font-mono outline-none sm:col-span-1" />
                          <input type="text" placeholder="Număr Înmatriculare" autoComplete="new-password" value={autoData.autoNumarInmatriculare} onChange={e => setAutoData({...autoData, autoNumarInmatriculare: e.target.value.toUpperCase()})} className="p-2.5 bg-[#0B0F12] border border-slate-700 rounded-lg text-xs text-white uppercase font-mono outline-none sm:col-span-1" />
                          <input type="text" placeholder="Marcă și Model" autoComplete="new-password" value={autoData.autoMarcaModel} onChange={e => setAutoData({...autoData, autoMarcaModel: e.target.value})} className="p-2.5 bg-[#0B0F12] border border-slate-700 rounded-lg text-xs text-white outline-none sm:col-span-1" />
                          <div className="flex gap-1 sm:col-span-1">
                            <input type="number" placeholder="Preț" autoComplete="new-password" value={autoData.autoPret} onChange={e => setAutoData({...autoData, autoPret: e.target.value})} className="p-2.5 bg-[#0B0F12] border border-slate-700 rounded-lg text-xs text-white outline-none w-full" />
                            <select value={autoData.autoMoneda} onChange={e => setAutoData({...autoData, autoMoneda: e.target.value})} className="bg-[#0B0F12] border border-slate-700 rounded-lg p-1.5 text-xs text-white outline-none">
                              <option value="RON">RON</option>
                              <option value="EUR">EUR</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <button type="button" onClick={() => { setStep(1); setAutoStep('upload'); }} className="text-xs text-slate-400 underline">Înapoi</button>
                          <button type="button" onClick={handleInterogareRar} disabled={isUploading} className="bg-[#8ba888] text-black font-bold px-6 py-2.5 rounded-xl text-xs hover:opacity-90 transition">
                            {isUploading ? 'Se procesează...' : 'Verifică Status ITP & Istoric RAR'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {autoStep === 'rar_loading' && (
                    <div className="py-12 text-center space-y-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-b-[#8ba888] mx-auto"></div>
                      <p className="text-xs text-slate-400">Se apelează registrul tehnic pentru seria {autoData.autoVin}...</p>
                    </div>
                  )}

                  {autoStep === 'rar_result' && (
                    <div className="space-y-4">
                      <div className="bg-[#16221A] border border-[#8ba888]/30 p-4 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-[#8ba888] uppercase block">✓ Validare Cadru Tehnic de Bază RAR</span>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                          <div><span className="text-slate-400 block">Status ITP:</span> <span className="text-white">{rarData?.itpValid ? 'VALID' : 'EXPIRAT'}</span></div>
                          <div><span className="text-slate-400 block">Valabilitate ITP:</span> <span className="text-white">{rarData?.itpData || '-'}</span></div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2 bg-[#0B0F12] p-3 rounded-xl border border-slate-800">
                            <span className="text-[11px] font-bold text-slate-400 uppercase block">Date Vânzător Oglindite</span>
                            <input type="text" placeholder="Nume Vânzător" autoComplete="new-password" required value={autoData.vanzatorNume} onChange={e => setAutoData({...autoData, vanzatorNume: e.target.value})} className="w-full p-2 bg-[#12181D] border border-slate-700 rounded text-xs text-white outline-none" />
                            <input type="text" placeholder="CNP / CUI" autoComplete="new-password" required value={autoData.vanzatorCnp} onChange={e => setAutoData({...autoData, vanzatorCnp: e.target.value})} className="w-full p-2 bg-[#12181D] border border-slate-700 rounded text-xs text-white font-mono outline-none" />
                          </div>
                          <div className="space-y-2 bg-[#0B0F12] p-3 rounded-xl border border-slate-800">
                            <span className="text-[11px] font-bold text-slate-400 uppercase block">Date Cumpărător Oglindite</span>
                            <input type="text" placeholder="Nume Cumpărător" autoComplete="new-password" required value={autoData.cumparatorNume} onChange={e => setAutoData({...autoData, cumparatorNume: e.target.value})} className="w-full p-2 bg-[#12181D] border border-slate-700 rounded text-xs text-white outline-none" />
                            <input type="text" placeholder="CNP / CUI" autoComplete="new-password" required value={autoData.cumparatorCnp} onChange={e => setAutoData({...autoData, cumparatorCnp: e.target.value})} className="w-full p-2 bg-[#12181D] border border-slate-700 rounded text-xs text-white font-mono outline-none" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input type="number" placeholder="Preț Vânzare Vehicul" autoComplete="new-password" required value={autoData.autoPret} onChange={e => setAutoData({...autoData, autoPret: e.target.value})} className="flex-1 p-2.5 bg-[#0B0F12] border border-slate-700 rounded-lg text-xs text-white outline-none w-full" />
                            <select value={autoData.autoMoneda} onChange={e => setAutoData({...autoData, autoMoneda: e.target.value})} className="w-24 bg-[#0B0F12] border border-slate-700 rounded-lg p-2 text-xs text-white outline-none">
                              <option value="RON">RON</option>
                              <option value="EUR">EUR</option>
                            </select>
                          </div>
                          <input type="email" placeholder="Email Contracte Finalizate" autoComplete="new-password" required value={autoData.clientEmail} onChange={e => setAutoData({...autoData, clientEmail: e.target.value})} className="p-2.5 bg-[#0B0F12] border border-slate-700 rounded-lg text-xs text-white outline-none" />
                        </div>

                        <div className="bg-[#0B0F12] p-4 rounded-xl border border-slate-800 flex justify-between items-center mb-4">
                          <label className="flex items-center text-xs text-slate-400 cursor-pointer select-none">
                            <input type="checkbox" checked={autoData.pretIncludeTVA} onChange={e => setAutoData({...autoData, pretIncludeTVA: e.target.checked})} className="mr-2 accent-[#8ba888]" />
                            <span>Prețul include TVA (Tranzacție emisă de Persoană Juridică plătitoare)</span>
                          </label>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <button type="button" onClick={() => setAutoStep('upload')} className="text-xs text-slate-400 underline">Înapoi la acte</button>
                          <button type="submit" className="bg-[#8ba888] text-black font-black px-6 py-2.5 rounded-xl text-xs tracking-tight transition hover:opacity-90">
                            Generează Pachet Securizat Auto .ZIP ({autoData.autoMoneda === 'EUR' ? `${Math.round(99 / cursBnr.eur)} EUR` : '99 RON'})
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {autoStep === 'success' && (
                    <div className="bg-[#0B0F12] border border-slate-800 p-5 rounded-2xl text-center space-y-4">
                      <div className="w-12 h-12 bg-emerald-900/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Pachetul Auto a fost descărcat!</h4>
                        <p className="text-xs text-slate-400 mt-1">Arhiva conține cele 5 exemplare oficiale DITL, procesul-verbal avocațial cu km garantați și ghidul procedural post-vânzare.</p>
                      </div>
                      <button onClick={() => { setAutoStep('upload'); setStep(1); }} className="text-xs text-[#8ba888] underline pt-2 block mx-auto">Înapoi la panou</button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        )}

        {/* QR CODE REDIRECT STEP 2 */}
        {step === 2 && qrGeneratedUrl && qrGeneratedUrl.includes('/semneaza/') && (
          <div className="max-w-3xl mx-auto mt-6 p-6 bg-[#12181D] border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center shadow-xl">
            <h3 className="text-lg font-bold text-[#8ba888] mb-2">Contractul a fost publicat</h3>
            <p className="text-xs text-slate-400 mb-4">Scanează codul QR pentru a deschide direct fluxul electronic de semnare:</p>
            <div className="p-4 bg-white border rounded-xl shadow-lg">
              <QRCodeSVG value={qrGeneratedUrl} size={150} />
            </div>
            <p className="text-xs text-slate-500 mt-3 font-mono">URL Securizat: <a href={qrGeneratedUrl} target="_blank" rel="noreferrer" className="underline text-[#8ba888]">{qrGeneratedUrl}</a></p>
          </div>
        )}

        {/* SECȚIUNE PREȚURI - GLOBALĂ */}
        <div id="sectiune-preturi" className="max-w-7xl mx-auto px-6 mt-16 scroll-mt-20">
          <div className="border-b border-slate-800 pb-4 mb-8 text-center">
            <span className="text-[#8ba888] text-xs font-black uppercase tracking-widest block mb-1">Standard de Securitate Financiară</span>
            <h2 className="text-3xl font-black text-white tracking-tight">Planuri de Business, Pachete Auto & Micro-Tranzacții</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
               
            <div className="bg-[#12181D] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-500 font-bold block uppercase">Freemium</span>
                <h4 className="text-sm font-bold text-white mt-1">Document Comercial B2B</h4>
                <div className="text-lg font-black text-[#8ba888] mt-2 mb-1">1 Gratuit <span className="text-[10px] text-slate-500 font-normal">/ lună</span></div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">Ulterior <strong>19 RON</strong> / generare. Fără abonament, plătești strict pe contractul descărcat.</p>
              </div>
              <button type="button" onClick={() => handleCumparaPremium('one_time_contract')} className="w-full mt-4 bg-[#0B0F12] hover:bg-slate-900 border border-slate-700 text-white font-bold py-2 rounded-xl text-xs transition">Cumpără Extra (19 RON)</button>
            </div>

            <div className="bg-[#12181D] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative ring-2 ring-[#8ba888]/20">
              <span className="absolute -top-2 right-4 bg-[#8ba888] text-[#0B0F12] text-[8px] uppercase font-black px-2 py-0.5 rounded">Recomandat</span>
              <div>
                <span className="text-[10px] font-mono text-[#8ba888] block uppercase">Hero Product</span>
                <h4 className="text-sm font-bold text-white mt-1">Membru Pro Recurent</h4>
                <div className="text-lg font-black text-white mt-2 mb-3">69 RON <span className="text-[10px] text-slate-500 font-normal">/ lună</span></div>
                <p className="text-[11px] text-slate-300 leading-relaxed">Generare nelimitată contracte comerciale, acces complet la baza legală și audit de clauze automat incluși.</p>
              </div>
              <button type="button" onClick={() => handleCumparaPremium('pro')} className="w-full mt-4 bg-[#8ba888] text-[#0B0F12] font-black py-2 rounded-xl text-xs transition hover:opacity-90">Abonează-te Pro</button>
            </div>

            <div className="bg-[#16221A] border border-[#8ba888]/40 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#8ba888] block uppercase">Lansare Unică</span>
                <h4 className="text-sm font-bold text-white mt-1">Membru Fondator Lifetime</h4>
                <div className="text-lg font-black text-white mt-2 mb-3">999 RON <span className="text-[10px] text-slate-500 font-normal">/ pe viață</span></div>
                <p className="text-[11px] text-slate-300 leading-relaxed">Valabil exclusiv pentru primii 100 de clienți. Deblochează pe viață clauzele premium fără costuri recurente.</p>
              </div>
              <button type="button" onClick={() => handleCumparaPremium('founder')} className="w-full mt-4 bg-[#8ba888] text-[#0B0F12] font-black py-2 rounded-xl text-xs transition hover:opacity-90">Cumpără Lifetime</button>
            </div>

          </div>
        </div>

        {/* ȘTIRI LIVE - GLOBALE */}
        <div className="max-w-7xl mx-auto px-6 mt-12 mb-12">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">Flux Monitorizare Mediativă Legală Real-Time</span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stiriLive.slice(0, 6).map((stire, i) => (
              <div key={i} className="bg-[#12181D] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <span className="text-[10px] font-bold text-[#8ba888] bg-[#16221A] px-2 py-0.5 rounded border border-emerald-900/50 uppercase">{stire.sursa || "Presă Economică"}</span>
                  <h3 className="text-sm font-bold text-white mt-3 leading-snug">{stire.titlu || stire.title}</h3>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500">Actualizat Live</span>
                  <a href={stire.link} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#8ba888] hover:underline">Vezi mai mult</a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WIDGET CONSILIER AI */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {isAiOpen && (
            <div className="bg-[#12181D] border border-slate-800 shadow-2xl rounded-2xl w-[320px] sm:w-[380px] h-[500px] mb-4 flex flex-col overflow-hidden animate-fadeIn">
              <div className="bg-[#16221A] border-b border-[#8ba888]/20 p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-white font-bold text-sm">Consilier Smart AI</h3>
                  <span className="text-[10px] text-[#8ba888]">Asistent Juridic & Comercial</span>
                </div>
                <button onClick={() => setIsAiOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B0F12]">
                {aiChatMessages.length === 0 ? (
                  <div className="text-center text-slate-500 text-xs mt-10">
                    <span className="text-3xl block mb-2">⚖️</span>
                    Salut! Te pot ajuta cu redactarea clauzelor, explicații din Codul Civil sau proceduri auto. Cu ce începem?
                  </div>
                ) : (
                  aiChatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-xl text-xs ${msg.role === 'user' ? 'bg-[#8ba888] text-[#0B0F12]' : 'bg-[#12181D] border border-slate-800 text-slate-300'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#12181D] border border-slate-800 text-slate-400 p-3 rounded-xl text-xs flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-[#12181D] border-t border-slate-800">
                <form onSubmit={handleSendAiMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={aiInputMessage}
                    onChange={(e) => setAiInputMessage(e.target.value)}
                    placeholder="Scrie o întrebare..."
                    className="flex-1 bg-[#0B0F12] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#8ba888]"
                  />
                  <button type="submit" disabled={aiLoading || !aiInputMessage.trim()} className="bg-[#8ba888] text-black px-3 py-2 rounded-lg font-bold disabled:opacity-50 hover:opacity-90">
                    ➤
                  </button>
                </form>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => setIsAiOpen(!isAiOpen)} 
            className="w-14 h-14 bg-[#8ba888] rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform border-4 border-[#0B0F12]"
          >
            <span className="text-2xl">{isAiOpen ? '✕' : '💬'}</span>
          </button>
        </div>

        {/* FOOTER GENERAL CENTRAT */}
        <footer className="relative z-10 border-t border-slate-800 bg-[#0B0F12] pt-12 pb-8 mt-16 text-center">
          <div className="max-w-5xl mx-auto px-6 space-y-6">
            <div className="flex justify-center">
              <div className="w-[180px] h-[30px]">
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
              <Link href="/baza-legala" className="hover:text-[#8ba888] transition">Validitate Juridică & Cod Civil</Link>
            </div>
            <div className="pt-6 border-t border-slate-800/40 text-[11px] text-slate-500 font-mono">
              <p>© 2026 ContractSmart. Powered by ZenSoftware. Toate drepturile rezervate legal.</p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}