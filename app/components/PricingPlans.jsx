'use client';

export default function PricingPlans({ handleCumparaPremium }) {
  return (
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
}