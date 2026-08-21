'use client';

export default function PricingAddons({ handleCumparaPremium }) {
  return (
    <div className="max-w-6xl mx-auto px-4 mb-20 mt-4">
      <div className="border-t border-slate-800/80 pt-8 pb-4 mb-6 text-center">
        <h3 className="text-xl font-black text-white tracking-tight">Șabloane & Extensii QR <span className="text-[#8ba888] font-bold">(Plată Unică)</span></h3>
      </div>
      
      {/* Primele 4 carduri pe un singur rând (4 coloane) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        
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

      {/* Banner Orizontal Compact pentru Pachetul AI & Somații la baza */}
      <div className="bg-[#12181D]/90 backdrop-blur-xl border border-purple-500/40 p-4 md:p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center gap-4 text-left">
          <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="bg-purple-900/30 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">AI Legal Suite</span>
              <h4 className="text-sm font-black text-white tracking-tight">Pachet 5 Audituri AI & Somații Art. 1522</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">Verifică contractele externe și generează somații oficiale de plată pe Codul Civil instant.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
          <div className="text-left md:text-right">
            <span className="text-lg font-black text-white block">49 RON</span>
            <span className="text-[9px] text-slate-500 uppercase block">Plată unică</span>
          </div>
          <button 
            onClick={() => handleCumparaPremium('ai_audit_pack')}
            className="bg-purple-600 hover:bg-purple-500 text-white font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] shrink-0"
          >
            Cumpără Pachetul AI
          </button>
        </div>
      </div>

    </div>
  );
}