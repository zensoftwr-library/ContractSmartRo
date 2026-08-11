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

  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-200 py-12 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* BUTON INAPOI */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors group"
          >
            <span className="transform group-hover:-translate-x-0.5 transition-transform">←</span> 
            Înapoi la panou
          </Link>
        </div>
        
        {/* HEADER */}
        <div className="text-center mb-12">
          <span className="bg-[#16221A] text-[#8ba888] border border-[#8ba888]/20 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
            Librărie Documente Juridice 2026
          </span>
          <h1 className="text-4xl font-black text-white mt-4 tracking-tight">
            Șabloane Tipizate <span className="text-[#8ba888]">Academice</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Descarcă modele oficiale în format protejat PDF, structurate rigid de avocați cu articole din Codul Civil, gata de completat de mână.
          </p>
        </div>

        {/* GRID ȘABLOANE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sabloane.map((sablon) => {
            const deblocat = areAccesLaSablon(sablon);
            return (
              <div key={sablon.id} className="bg-[#12181D] border border-slate-800 rounded-lg p-6 flex flex-col justify-between hover:border-slate-700 transition shadow-lg">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded border ${
                      !sablon.premium
                        ? 'bg-[#16221A] text-[#8ba888] border-emerald-900/40'
                        : deblocat
                          ? 'bg-[#16221A] text-emerald-400 border-emerald-900/40'
                          : 'bg-[#221F16] text-amber-400 border-amber-900/40'
                    }`}>
                      {deblocat && sablon.premium ? '📥 Model Deblocat (Membru)' : sablon.tip}
                    </span>
                    <span className="text-slate-600 text-xs font-mono">Format .PDF (În Alb)</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 leading-snug">{sablon.nume}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{sablon.descriere}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => handleDescarcaSauCumpara(sablon)}
                    disabled={loadingTemplate !== null}
                    className={`w-full font-bold text-xs py-3 rounded transition flex items-center justify-center gap-2 ${
                      deblocat
                        ? 'bg-[#8ba888] text-[#0B0F12] font-black hover:opacity-90 shadow-md'
                        : 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 text-amber-300 hover:from-amber-500/30'
                    }`}
                  >
                    {loadingTemplate === sablon.id 
                      ? 'Se randează PDF...' 
                      : deblocat ? '📥 Descarcă Model Tipizat (.PDF)' : '🔓 Cumpără Șablon Legal'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}