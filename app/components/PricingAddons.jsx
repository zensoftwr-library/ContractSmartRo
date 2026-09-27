'use client';
import { useState } from 'react';

export default function PricingAddons({ user, setShowAuthModal, setIsSignUp, onUnlockSuccess }) {
  const isUnlocked = ['founder', 'business'].includes(user?.status);
  const [loadingAddon, setLoadingAddon] = useState(null);

  const handleUnlock = async (addonType, creditCost, addonName) => {
    // 1. Dacă utilizatorul nu este logat, deschidem modalul de înregistrare/autentificare
    if (!user) {
      setIsSignUp?.(true);
      setShowAuthModal?.(true);
      return;
    }

    // 2. Verificăm dacă are destule credite (doar informativ pe client, backend-ul validează oricum)
    if ((user.credits || 0) < creditCost && !isUnlocked) {
      alert(`Sold insuficient! Ai nevoie de ${creditCost} credite pentru ${addonName}. Te rugăm să reîncarci portofelul.`);
      const el = document.getElementById('sectiune-preturi');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (isUnlocked) {
      alert(`Funcționalitatea ${addonName} este deja inclusă Gratuit în abonamentul tău VIP/Business!`);
      return;
    }

    // 3. Apelăm API-ul de deblocare
    try {
      setLoadingAddon(addonType);
      const res = await fetch('/api/unlock-addon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, addonType, creditCost })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Eroare la deblocare');
      }

      alert(`Felicitări! Ai deblocat cu succes ${addonName}. S-au scăzut ${creditCost} credite din portofel.`);
      if (onUnlockSuccess) onUnlockSuccess(data.newCredits);
      window.location.reload(); // Sincronizăm soldul în Navbar

    } catch (err) {
      alert(`Eroare: ${err.message}`);
    } finally {
      setLoadingAddon(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 mb-20 mt-4">
      <div className="pb-4 mb-6 text-center">
        <h3 className="text-xl font-black text-white [.matcha-light-theme_&]:!text-slate-900 tracking-tight">Șabloane & Extensii QR <span className="text-[#8ba888] [.matcha-light-theme_&]:!text-emerald-700 font-bold">(Deblocare Rapidă din Portofel)</span></h3>
      </div>
      
      {/* Primele 4 carduri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        
        {/* Sablon */}
        <div className="bg-[#12181D]/60 [.matcha-light-theme_&]:!bg-white border border-slate-800/80 [.matcha-light-theme_&]:!border-slate-200 rounded-xl p-4 flex flex-col justify-between transition-colors text-center shadow-sm">
          <div>
            <span className="text-[9px] font-bold text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded">Document Legal</span>
            <h4 className="text-sm font-bold text-white [.matcha-light-theme_&]:!text-slate-900 mt-2">Șablon Tipizat</h4>
            <div className="text-xl font-black text-white [.matcha-light-theme_&]:!text-slate-900 mt-1 mb-2">15 <span className="text-xs text-[#8ba888] font-bold">Credite</span></div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Contracte PDF standard verificate juridic.</p>
          </div>
          {isUnlocked ? (
            <div className="w-full text-center py-2 text-emerald-400 font-black text-[9px] uppercase bg-emerald-500/10 rounded-lg">Inclus VIP</div>
          ) : (
            <button disabled={loadingAddon === 'sabloane'} onClick={() => handleUnlock('sabloane', 15, 'Șablon Tipizat')} className="w-full bg-[#0B0F12] [.matcha-light-theme_&]:!bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm">
              {loadingAddon === 'sabloane' ? 'Se procesază...' : (!user ? 'Autentifică-te & Folosește' : 'Folosește 15 Credite')}
            </button>
          )}
        </div>

        {/* QR Branding */}
        <div className="bg-[#12181D]/60 [.matcha-light-theme_&]:!bg-white border border-slate-800/80 [.matcha-light-theme_&]:!border-slate-200 rounded-xl p-4 flex flex-col justify-between transition-colors text-center shadow-sm">
          <div>
            <span className="text-[9px] font-bold text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded">Design QR</span>
            <h4 className="text-sm font-bold text-white [.matcha-light-theme_&]:!text-slate-900 mt-2">Pachet Branding</h4>
            <div className="text-xl font-black text-white [.matcha-light-theme_&]:!text-slate-900 mt-1 mb-2">15 <span className="text-xs text-[#8ba888] font-bold">Credite</span></div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Adaugă logo-ul în centrul codului QR.</p>
          </div>
          {isUnlocked ? (
            <div className="w-full text-center py-2 text-emerald-400 font-black text-[9px] uppercase bg-emerald-500/10 rounded-lg">Inclus VIP</div>
          ) : (
            <button disabled={loadingAddon === 'qr_branding'} onClick={() => handleUnlock('qr_branding', 15, 'Pachet Branding')} className="w-full bg-[#0B0F12] [.matcha-light-theme_&]:!bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm">
              {loadingAddon === 'qr_branding' ? 'Se procesază...' : (!user ? 'Autentifică-te & Folosește' : 'Folosește 15 Credite')}
            </button>
          )}
        </div>

        {/* QR Dynamic */}
        <div className="bg-[#12181D]/60 [.matcha-light-theme_&]:!bg-white border border-slate-800/80 [.matcha-light-theme_&]:!border-slate-200 rounded-xl p-4 flex flex-col justify-between transition-colors text-center shadow-sm">
          <div>
            <span className="text-[9px] font-bold text-[#8ba888] bg-[#8ba888]/10 px-2 py-0.5 rounded">Sistem QR</span>
            <h4 className="text-sm font-bold text-white [.matcha-light-theme_&]:!text-slate-900 mt-2">QR Dinamic + PDF</h4>
            <div className="text-xl font-black text-[#8ba888] mt-1 mb-2">19 <span className="text-xs font-bold">Credite</span></div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Schimbă link-ul oricând + Găzduire PDF.</p>
          </div>
          {isUnlocked ? (
            <div className="w-full text-center py-2 text-emerald-400 font-black text-[9px] uppercase bg-emerald-500/10 rounded-lg">Inclus VIP</div>
          ) : (
            <button disabled={loadingAddon === 'qr_dinamic'} onClick={() => handleUnlock('qr_dinamic', 19, 'QR Dinamic + PDF')} className="w-full bg-[#0B0F12] [.matcha-light-theme_&]:!bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm">
              {loadingAddon === 'qr_dinamic' ? 'Se procesază...' : (!user ? 'Autentifică-te & Folosește' : 'Folosește 19 Credite')}
            </button>
          )}
        </div>

        {/* QR vCard */}
        <div className="bg-[#12181D]/60 [.matcha-light-theme_&]:!bg-white border border-slate-800/80 [.matcha-light-theme_&]:!border-slate-200 rounded-xl p-4 flex flex-col justify-between transition-colors text-center shadow-sm">
          <div>
            <span className="text-[9px] font-bold text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded">Premium QR</span>
            <h4 className="text-sm font-bold text-white [.matcha-light-theme_&]:!text-slate-900 mt-2">vCard Pro</h4>
            <div className="text-xl font-black text-white [.matcha-light-theme_&]:!text-slate-900 mt-1 mb-2">25 <span className="text-xs text-blue-400 font-bold">Credite</span></div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Carte de vizită digitală cu salvare în agendă.</p>
          </div>
          {isUnlocked ? (
            <div className="w-full text-center py-2 text-emerald-400 font-black text-[9px] uppercase bg-emerald-500/10 rounded-lg">Inclus VIP</div>
          ) : (
            <button disabled={loadingAddon === 'vcard'} onClick={() => handleUnlock('vcard', 25, 'vCard Pro')} className="w-full bg-[#0B0F12] [.matcha-light-theme_&]:!bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm">
              {loadingAddon === 'vcard' ? 'Se procesază...' : (!user ? 'Autentifică-te & Folosește' : 'Folosește 25 Credite')}
            </button>
          )}
        </div>

      </div>

      {/* Banner AI */}
      <div className="bg-[#12181D]/90 [.matcha-light-theme_&]:!bg-white border border-purple-500/40 p-4 md:p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl mt-8">
        <div className="flex items-center gap-4 text-left">
          <div className="w-10 h-10 rounded-xl bg-purple-900/30 flex items-center justify-center text-purple-400 shrink-0">✨</div>
          <div>
            <span className="bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded text-[8px] font-black uppercase">AI Legal Suite</span>
            <h4 className="text-sm font-black text-white [.matcha-light-theme_&]:!text-slate-900 tracking-tight mt-1">Pachet 5 Audituri AI & Somații Art. 1522</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">Verifică contractele și generează somații de plată instant.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
          <div className="text-left md:text-right">
            <span className="text-lg font-black text-white [.matcha-light-theme_&]:!text-slate-900 block">25 Credite</span>
            <span className="text-[9px] text-purple-400 uppercase font-bold block">Din Portofel</span>
          </div>
          {isUnlocked ? (
            <div className="text-center py-2 px-4 text-emerald-400 font-black text-[10px] uppercase bg-emerald-500/10 rounded-lg">Inclus în VIP</div>
          ) : (
            <button 
              disabled={loadingAddon === 'ai_audit'}
              onClick={() => handleUnlock('ai_audit', 25, 'Pachet Audituri AI')}
              className="bg-purple-600 hover:bg-purple-500 text-white font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg"
            >
              {loadingAddon === 'ai_audit' ? 'Se procesază...' : (!user ? 'Autentifică-te' : 'Deblochează (25 Credite)')}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}