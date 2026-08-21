'use client';

export default function PricingPlans({ handleCumparaPremium }) {
  return (
    <div id="sectiune-preturi" className="max-w-6xl mx-auto px-4 mt-20 mb-20 scroll-mt-20">
      {/* Antet Centrat */}
      <div className="text-center border-b border-slate-800/80 pb-8 mb-10">
        <span className="text-[#8ba888] text-[10px] font-black uppercase tracking-widest block mb-2">Ecosistem ContractSmart</span>
        <h2 className="text-3xl font-black text-white tracking-tight">Planuri de Business & Tranzacții</h2>
      </div>

      {/* Grid Principal - 3 Coloane pentru B2B, Auto, PRO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-6">
        
        {/* Onetime Contract B2B */}
        <div className="bg-[#12181D]/60 border border-slate-800/80 hover:border-slate-600 rounded-xl p-5 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex justify-center items-center mb-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800/50 px-2 py-0.5 rounded">Plată Unică</span>
            </div>
            <h4 className="text-sm font-bold text-white">1x Contract B2B</h4>
            <div className="text-xl font-black text-[#8ba888] mt-1 mb-2">19 RON <span className="text-[9px] text-slate-500 font-normal">(~3.99 €)</span></div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Plătești strict pentru documentul generat. Ideal pentru nevoi punctuale.</p>
          </div>
          <button type="button" onClick={() => handleCumparaPremium('one_time_contract')} className="w-full bg-[#0B0F12] border border-slate-700 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs transition-colors shadow-sm">Cumpără 3.99 €</button>
        </div>

        {/* Onetime Auto */}
        <div className="bg-[#12181D]/60 border border-slate-800/80 hover:border-blue-500/50 rounded-xl p-5 flex flex-col justify-between transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div>
            <div className="flex justify-center items-center mb-3">
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider bg-blue-900/20 border border-blue-500/20 px-2 py-0.5 rounded">Pachet Auto</span>
            </div>
            <h4 className="text-sm font-bold text-white">Vânzare Auto</h4>
            <div className="text-xl font-black text-white mt-1 mb-2">99 RON <span className="text-[9px] text-slate-500 font-normal">(~19.99 €)</span></div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">5 exemplare DITL, PV + ghid complet automatizat post-vânzare.</p>
          </div>
          <button type="button" onClick={() => handleCumparaPremium('contract_auto')} className="w-full bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600 hover:text-white text-blue-400 font-bold py-2.5 rounded-lg text-xs transition-colors shadow-sm">Cumpără 19.99 €</button>
        </div>

        {/* PRO */}
        <div className="bg-[#12181D] border border-[#8ba888]/40 hover:border-[#8ba888] rounded-xl p-5 flex flex-col justify-between transition-colors relative shadow-[0_0_15px_rgba(139,168,136,0.05)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#8ba888] to-transparent"></div>
          <div>
            <div className="flex justify-center items-center mb-3">
              <span className="text-[9px] font-bold text-[#0B0F12] uppercase tracking-wider bg-[#8ba888] px-2 py-0.5 rounded">Popular</span>
            </div>
            <h4 className="text-sm font-bold text-white">Abonament PRO</h4>
            <div className="text-xl font-black text-white mt-1 mb-2">99 RON <span className="text-[9px] text-slate-500 font-normal">/lună (~19.99 €)</span></div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Contracte B2B nelimitate + Mega-QR Studio (Smart, Geo, Landing).</p>
          </div>
          <button type="button" onClick={() => handleCumparaPremium('pro')} className="w-full bg-[#8ba888] text-[#0B0F12] hover:opacity-90 font-black py-2.5 rounded-lg text-xs transition-opacity shadow-sm">Abonează-te</button>
        </div>

      </div>

      {/* FOUNDER LIFETIME - Card Mare / Banner Orizontal Sublim Dedicat Sub Celelalte */}
      <div className="bg-gradient-to-r from-[#16221A] via-[#12181D] to-[#0B0F12] border-2 border-amber-500/40 hover:border-amber-500/80 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden group">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full group-hover:bg-amber-500/20 transition-colors pointer-events-none"></div>
        
        <div className="flex items-start md:items-center gap-5 text-left relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black text-black uppercase tracking-widest bg-gradient-to-r from-amber-200 to-yellow-500 px-2.5 py-0.5 rounded shadow-sm">VIP Lifetime Access</span>
              <h4 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400 tracking-tight">Membru Fondator (Enterprise Lifetime)</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Plătești o singură dată. Deblochezi accesul nelimitat pe viață la absolut toate modulele Enterprise, audituri AI, Smart Vault și interogări ANAF fără nicio limită sau abonament lunar.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-800 relative z-10">
          <div className="text-left md:text-right">
            <span className="text-2xl font-black text-white block">999 RON</span>
            <span className="text-[9px] text-amber-400 uppercase font-bold tracking-wider block">Unică / Pe Viață</span>
          </div>
          <button 
            type="button" 
            onClick={() => handleCumparaPremium('founder')} 
            className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-black hover:opacity-95 font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0 active:scale-95"
          >
            Devino Fondator VIP
          </button>
        </div>
      </div>

    </div>
  );
}