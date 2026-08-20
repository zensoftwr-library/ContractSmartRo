'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// LINK GUMROAD PENTRU ȘABLOANE LEGALE
const GUMROAD_SABLON_LINK = 'https://zensoftware.gumroad.com/l/sablon-tipizat-legal';

export default function ModeleContracte() {
  const [loadingTemplate, setLoadingTemplate] = useState(null);
  const [user, setUser] = useState(null);
  const [userTier, setUserTier] = useState('free'); 
  const [achizitiiIndividuale, setAchizitiiIndividuale] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function getSesiuneSiProfil() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_status, is_pro')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUserTier(profile.subscription_tier || (profile.is_pro ? 'pro' : 'free'));
        }

        const { data: purchases } = await supabase
          .from('user_purchases')
          .select('product_id')
          .eq('user_id', session.user.id);

        if (purchases) {
          setAchizitiiIndividuale(purchases.map(p => p.product_id));
        }
      }
    }
    getSesiuneSiProfil();
  }, []);

  // Resetare stare loading la întoarcerea în pagină (Back)
  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted) {
        setLoadingTemplate(null);
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);
  
  const sabloane = [
    { 
      id: 'prestari_gratuit', 
      nume: '1. Contract de Prestări Servicii (Model ITA)', 
      descriere: 'Temei juridic Art. 1851-1857 Cod Civil (Antrepriză). Structură fluidă completă cu anexe tehnice adaptabile pentru definirea sarcinilor, receptie calitativă, onorarii fixe/orare și management penalizator.', 
      tip: 'Gratuit', 
      premium: false 
    },
    { 
      id: 'nda_premium', 
      nume: '2. Acord de Confidențialitate (NDA Academic)', 
      descriere: 'Temei structural Art. 1184 și Art. 1200 Cod Civil. Clauze corporative rigide privitoare la secrete de afaceri, know-how, cod sursă și baze de date, cu evaluare predefinită automată a daunelor interese.', 
      tip: 'Premium (49 lei)', 
      premium: true, 
      variantType: 'sabloane' 
    },
    { 
      id: 'cda_premium', 
      nume: '3. Contract de Cesiune Drepturi de Autor (CDA)', 
      descriere: 'Aliniat legii nr. 8/1996. Transfer patrimonial condiționat expres și absolut de stingerea decontului bancar. Separare totală a drepturilor de reproducere, adaptare și comunicare publică multimedia.', 
      tip: 'Premium (49 lei)', 
      premium: true, 
      variantType: 'sabloane' 
    },
    { 
      id: 'inchiriere_imobil_premium', 
      nume: '4. Contract de Închiriere Spațiu / Bunuri (Locațiune)', 
      descriere: 'Temei juridic Art. 1777-1835 Cod Civil. Clauze imperative de investire directă cu valoare de TITLU EXECUTORIU pentru recuperarea debitelor și evacuare rapidă, plus constituire fond de garanție utilități.', 
      tip: 'Premium (49 lei)', 
      premium: true, 
      variantType: 'sabloane' 
    },
    { 
      id: 'promisiune_vanzare_premium', 
      nume: '5. Antecontract / Promisiune Bilaterală de Vânzare', 
      descriere: 'Guvernat de Art. 1279 și Art. 1669 Cod Civil. Regim penalizator avansat bazat pe executarea silită a obligației de a contracta și returnarea dublului arvunei confirmatorii la Notar Public.', 
      tip: 'Premium (49 lei)', 
      premium: true, 
      variantType: 'sabloane' 
    },
    { 
      id: 'inchiriere_auto_premium', 
      nume: '6. Contract de Locațiune Vehicule și Echipamente', 
      descriere: 'Cadru legal rigid pentru bunuri mobile. Clauze de repartizare a riscurilor, polize de asigurări CASCO/RCA, exonerări la amenzi contravenționale rutiere radar și reținere depozit daune.', 
      tip: 'Premium (49 lei)', 
      premium: true, 
      variantType: 'sabloane' 
    },
    { 
      id: 'management_premium', 
      nume: '7. Contract de Management & Consultanță strategică', 
      descriere: 'Format corporatist de elită conform Legii 31/1990. Dedicat administratorilor comerciali, directorilor externi sau acordurilor B2B executive. Reglementează KPI, indicatori de performanță și neconcurență.', 
      tip: 'Premium (49 lei)', 
      premium: true, 
      variantType: 'sabloane' 
    },
    { 
      id: 'sponsorizare_premium', 
      nume: '8. Contract de Sponsorizare și Creditare Fiscală', 
      descriere: 'Cadru legal adaptat Legii nr. 32/1994 și Codului Fiscal. Optimizat pentru deductibilitate directă din impozitul pe profit/microîntreprindere, cu clauze ferme de verificare a scopului nonprofit.', 
      tip: 'Premium (49 lei)', 
      premium: true, 
      variantType: 'sabloane' 
    },
    { 
      id: 'asociere_premium', 
      nume: '9. Contract de Asociere în Participațiune B2B', 
      descriere: 'Temei legal Art. 2511 Cod Civil. Reglementează derularea de proiecte economice comune între două sau mai multe firme fără crearea unei noi entități la ONRC, stabilind algoritmi preciși de profit/pierderi.', 
      tip: 'Premium (49 lei)', 
      premium: true, 
      variantType: 'sabloane' 
    },
    { 
      id: 'comodat_premium', 
      nume: '10. Contract de Comodat Spațiu imobiliar (Sediul Social)', 
      descriere: 'Temei juridic Art. 2146 Cod Civil. Împrumut de folosință gratuită cerut imperativ la MyONRC pentru stabilirea sediului profesional, cu delimitare spațială strictă și asumare cheltuieli regie.', 
      tip: 'Premium (49 lei)', 
      premium: true, 
      variantType: 'sabloane' 
    },
    { 
      id: 'influencer_premium', 
      nume: '11. Contract de Parteneriat & Influencer Marketing', 
      descriere: 'Reglementează livrarea de campanii pe social media, drepturi de utilizare a imaginii (Usage Rights), clauze de exclusivitate temporară și penalizări stricte pentru neprezentarea livrabilelor.', 
      tip: 'Premium (49 lei)', 
      premium: true, 
      variantType: 'sabloane' 
    },
    { 
      id: 'it_sla_premium', 
      nume: '12. Contract de Prestări Servicii IT / Software (Agile & SLA)', 
      descriere: 'Contract dedicat agențiilor IT. Include SLA (Service Level Agreement), faze de livrare (Milestones), clauze Escrow pentru cod sursă și transfer de IP condiționat de decont.', 
      tip: 'Premium (49 lei)', 
      premium: true, 
      variantType: 'sabloane' 
    },
    { 
      id: 'constructii_premium', 
      nume: '13. Contract de Execuție Lucrări & Construcții (Deviz)', 
      descriere: 'Adaptat Legii 10/1995. Include tabele pentru deviz separat (materiale/manoperă), grafice de execuție, recepție parțială pe faze determinante și reținere fond de garanție.', 
      tip: 'Premium (49 lei)', 
      premium: true, 
      variantType: 'sabloane' 
    }
  ];

  const areAccesLaSablon = (sablon) => {
    if (!sablon.premium) return true;
    if (userTier === 'founder' || userTier === 'pro') return true;
    if (achizitiiIndividuale.includes(sablon.id)) return true;
    return false;
  };

  const handleDescarcaSauCumpara = async (sablon) => {
    if (!user) {
      alert('Trebuie să fii autentificat pentru a descărca șabloane de contracte. Te rugăm să te întorci pe pagina principală și să creezi un cont gratuit.');
      return;
    }

    if (areAccesLaSablon(sablon)) {
      setLoadingTemplate(sablon.id);
      try {
        const res = await fetch('/api/generate-template', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateId: sablon.id, userId: user?.id || null })
        });

        if (res.ok) {
          const blob = await res.blob();
          const urlDownload = window.URL.createObjectURL(blob);
          const elementA = document.createElement('a');
          elementA.href = urlDownload;
          elementA.download = `model_${sablon.id}_tipizat.pdf`;
          document.body.appendChild(elementA);
          elementA.click();
          document.body.removeChild(elementA);
          window.URL.revokeObjectURL(urlDownload);
        } else {
          const errData = await res.json();
          alert(errData.message || 'Eroare la generarea fișierului binar tipizat.');
        }
      } catch {
        alert('Eroare de comunicare cu serverul de randare PDF.');
      } finally {
        setLoadingTemplate(null);
      }
      return;
    }

    // REDIRECȚIONARE GUMROAD CU PRE-FILL USER ID
    setLoadingTemplate(sablon.id);
    try {
      const urlObj = new URL(GUMROAD_SABLON_LINK);
      urlObj.searchParams.set('user_id', user.id);
      urlObj.searchParams.set('email', user.email);
      window.location.href = urlObj.toString();
    } catch {
      alert('Eroare la redirecționarea către Gumroad.');
      setLoadingTemplate(null);
    }
  };

  // FUNCȚIE PENTRU CUMPĂRARE PACHETE PRINCIPALE
  const handleCumparaPremium = (tip) => {
    if (!user) {
      alert('Trebuie să fii autentificat pentru a face o achiziție. Te rugăm să te întorci pe pagina principală pentru a te loga.');
      return;
    }
    
    let linkGumroad = '';
    if (tip === 'one_time_contract') linkGumroad = 'https://zensoftware.gumroad.com/l/link-onetime';
    else if (tip === 'contract_auto') linkGumroad = 'https://zensoftware.gumroad.com/l/link-auto';
    else if (tip === 'pro') linkGumroad = 'https://zensoftware.gumroad.com/l/link-pro';
    else if (tip === 'founder') linkGumroad = 'https://zensoftware.gumroad.com/l/link-founder';

    if (linkGumroad) {
      try {
        const urlObj = new URL(linkGumroad);
        urlObj.searchParams.set('user_id', user.id);
        urlObj.searchParams.set('email', user.email);
        window.location.href = urlObj.toString();
      } catch (err) {
        window.location.href = linkGumroad;
      }
    } else {
      alert('Link-ul de plată nu este configurat pentru acest pachet.');
    }
  };

  // FUNCȚIE PENTRU RANDAREA CARDURILOR DE PREȚURI (Centrate)
  const renderCarduriPreturi = () => (
    <div id="sectiune-preturi" className="max-w-6xl mx-auto px-4 mt-20 mb-12 scroll-mt-20">
      <div className="text-center border-b border-slate-800/80 pb-8 mb-10">
        <span className="text-[#8ba888] text-[10px] font-black uppercase tracking-widest block mb-2">Ecosistem ContractSmart</span>
        <h2 className="text-3xl font-black text-white tracking-tight">Planuri de Business & Tranzacții</h2>
      </div>

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

  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-200 font-sans selection:bg-[#8ba888]/30 selection:text-[#8ba888]">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0F12]/80 border-b border-slate-800/80 py-4 px-6 shadow-sm transition-all">
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
          <Link href="/" className="w-[180px] h-[30px] flex items-center cursor-pointer hover:opacity-90 transition-opacity">
            <svg viewBox="0 0 240 40" className="w-full h-full">
              <g transform="translate(0, 2)">
                <path d="M24 6 C15 6, 8 13, 8 22 C8 31, 15 38, 24 38 C31 38, 37 33, 39 27" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round"/>
                <path d="M16 21 L21 26 L32 12" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <text x="48" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="20" fill="#FFFFFF" letterSpacing="-0.5">
                Contract<tspan fill="#8ba888">Smart</tspan>
              </text>
            </svg>
          </Link>
          
          <button className="md:hidden text-[#8ba888] text-2xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>

          <div className="hidden md:flex items-center space-x-5">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition">Acasă</Link>
            <span className="text-slate-800">|</span>
            <Link href="/modele-contracte" className="text-xs text-[#8ba888] font-bold transition drop-shadow-[0_0_8px_rgba(139,168,136,0.3)]">Modele Contracte</Link>
            <span className="text-slate-800">|</span>
            <Link href="/termeni-si-conditii" className="text-xs text-slate-400 hover:text-white transition">Termeni și Condiții</Link>
            <span className="text-slate-800">|</span>
            <Link href="/contact" className="text-xs text-slate-400 hover:text-white transition">Contact</Link>
          </div>
        </div>
        
        {isMobileMenuOpen && (
          <div className="md:hidden flex flex-col space-y-4 pt-4 mt-4 border-t border-slate-800/80 animate-fadeIn px-4 pb-2">
            <Link href="/" className="text-sm text-slate-300 hover:text-white">Acasă</Link>
            <Link href="/modele-contracte" className="text-sm text-[#8ba888] font-bold">Modele Contracte</Link>
            <Link href="/termeni-si-conditii" className="text-sm text-slate-300 hover:text-white">Termeni și Condiții</Link>
            <Link href="/contact" className="text-sm text-slate-300 hover:text-white">Contact</Link>
          </div>
        )}
      </nav>

      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[5%] left-[50%] transform -translate-x-1/2 w-[90vw] h-[90vw] min-w-[800px] min-h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139, 168, 136, 0.05) 0%, rgba(11, 15, 18, 0) 60%)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 md:py-16">
        
        {/* BUTON INAPOI RAPID */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-[#12181D]/60 border border-slate-800/80 px-4 py-2 rounded-lg hover:border-[#8ba888]/50 shadow-sm backdrop-blur-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Înapoi la aplicație
          </Link>
        </div>
        
        {/* HEADER */}
        <div className="text-center mb-16 border-b border-slate-800/80 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16221A] border border-[#8ba888]/20 text-[#8ba888] text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>
            Librărie Documente Juridice 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter mb-5">
            Șabloane Tipizate <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ba888] to-emerald-400">Academice</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Descarcă modele oficiale în format protejat PDF, structurate rigid de experți juridici respectând prevederile Codului Civil, gata de imprimat și completat.
          </p>
        </div>

        {/* GRID ȘABLOANE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {sabloane.map((sablon) => {
            const deblocat = areAccesLaSablon(sablon);
            return (
              <div key={sablon.id} className="bg-[#12181D]/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:border-[#8ba888]/40 transition-colors shadow-lg relative overflow-hidden group">
                {/* Accent Hover Blob */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8ba888]/5 blur-2xl rounded-full group-hover:bg-[#8ba888]/10 transition-colors pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-5">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md border shadow-sm flex items-center gap-1.5 ${
                      !sablon.premium
                        ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500/30'
                        : deblocat
                          ? 'bg-blue-900/20 text-blue-400 border-blue-500/30'
                          : 'bg-amber-900/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {!sablon.premium && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>}
                      {deblocat && sablon.premium && <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>}
                      {!deblocat && sablon.premium && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>}
                      {deblocat && sablon.premium ? 'Model Deblocat (Membru)' : sablon.tip}
                    </span>
                    <span className="text-slate-500 text-[10px] font-mono border border-slate-700/50 bg-[#0B0F12] px-2 py-0.5 rounded">.PDF</span>
                  </div>
                  <h3 className="text-lg font-black text-white mb-3 leading-snug group-hover:text-[#8ba888] transition-colors">{sablon.nume}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{sablon.descriere}</p>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-800/60 relative z-10">
                  <button
                    type="button"
                    onClick={() => handleDescarcaSauCumpara(sablon)}
                    disabled={loadingTemplate !== null}
                    className={`w-full font-black text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm ${
                      deblocat
                        ? 'bg-gradient-to-r from-[#8ba888] to-[#6d8a6a] text-[#0B0F12] hover:shadow-[0_0_20px_rgba(139,168,136,0.3)] hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                    }`}
                  >
                    {loadingTemplate === sablon.id ? (
                      <>
                        <svg className={`animate-spin h-4 w-4 ${deblocat ? 'text-black' : 'text-amber-400'}`} viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Se Randează PDF...
                      </>
                    ) : deblocat ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Descarcă Model Tipizat (.PDF)
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        Deblochează Șablon Legal
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {renderCarduriPreturi()}

      {/* FOOTER STANDARD PLATFORMA */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#0B0F12] pt-12 pb-8 mt-16 text-center">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          <div className="flex justify-center">
            <Link href="/" className="w-[180px] h-[30px] cursor-pointer block hover:opacity-90 transition-opacity">
              <svg viewBox="0 0 240 40" className="w-full h-full mx-auto">
                <g transform="translate(0, 2)">
                  <path d="M24 6 C15 6, 8 13, 8 22 C8 31, 15 38, 24 38 C31 38, 37 33, 39 27" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round"/>
                  <path d="M16 21 L21 26 L32 12" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <text x="48" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="20" fill="#FFFFFF" letterSpacing="-0.5">
                  Contract<tspan fill="#8ba888">Smart</tspan>
                </text>
              </svg>
            </Link>
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
              <strong className="text-red-500/80">Disclaimer Legal!</strong> <strong className="text-[#8ba888]">ContractSmart</strong> este o platformă de software. <strong className="text-red-500/80">NU</strong> suntem o casă de avocatură și nu oferim consultanță juridică.
            </p>
            <p className="text-[11px] text-slate-500 font-mono tracking-wide">© 2026 <strong className="text-[#8ba888]">ContractSmart</strong>. Powered by <strong className="text-[#8ba888]">ZenSoftWare</strong>.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}