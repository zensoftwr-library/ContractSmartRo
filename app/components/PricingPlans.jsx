'use client';

export default function PricingPlans({ handleCumparaPremium, user }) {
  const isFounder = user?.status === 'founder';
  const isBusiness = user?.status === 'business';
  const isPro = user?.status === 'pro';

  return (
    <div id="sectiune-preturi" className="max-w-6xl mx-auto px-4 mt-20 mb-20 scroll-mt-20">
      <div className="max-w-6xl mx-auto border-t border-slate-800/80 pt-12 mt-8"></div>
        
      {/* Antet Centrat */}
      <div className="text-center border-b border-slate-800/80 pb-8 mb-10">
        <span className="text-[#8ba888] text-[10px] font-black uppercase tracking-widest block mb-2">Ecosistem ContractSmart</span>
        <h2 className="text-3xl font-black text-white tracking-tight">Planuri de Business & Tranzacții</h2>
      </div>

      {/* --- SECȚIUNEA 1: PREȚURI SERVICII INDIVIDUALE (ONETIME) --- */}
      <div className="mb-12">
        <h3 className="text-lg font-black text-white tracking-tight mb-4 text-center">Tranzacții la Cerere (Pay-As-You-Go)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto gap-4 text-center">
          
          {/* Contract B2B */}
          <div className="bg-[#12181D]/60 border border-slate-800/80 hover:border-slate-600 rounded-xl p-5 flex items-center justify-between transition-colors">
            <div className="text-left">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Document Oficial</span>
              <h4 className="text-sm font-bold text-white">Generare Contract B2B</h4>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-[#8ba888]">19 RON <span className="text-[10px] text-slate-500 font-normal">(~3.99 €)</span></div>
              <div className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mt-0.5">Se consumă 19 Credite</div>
            </div>
          </div>

          {/* Pachet Auto */}
          <div className="bg-[#12181D]/60 border border-slate-800/80 hover:border-blue-500/50 rounded-xl p-5 flex items-center justify-between transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full -z-10 transition-transform"></div>
            <div className="text-left relative z-10">
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider block mb-1">Dosar DITL / DRPCIV</span>
              <h4 className="text-sm font-bold text-white">Pachet Vânzare Auto</h4>
            </div>
            <div className="text-right relative z-10">
              <div className="text-lg font-black text-white">99 RON <span className="text-[10px] text-slate-500 font-normal">(~19.99 €)</span></div>
              <div className="text-[9px] uppercase font-bold text-blue-400 tracking-widest mt-0.5">Se consumă 99 Credite</div>
            </div>
          </div>
          
        </div>
      </div>

      {/* --- SECȚIUNEA 2: ABONAMENTE RECURENTE (TIERS) --- */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-black text-white tracking-tight mb-2">Abonamente Lunare</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-12">
        
        {/* FREE PLAN */}
        <div className="bg-[#12181D]/60 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex justify-center items-center mb-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800/50 px-2 py-0.5 rounded">Utilizator Ocazional</span>
            </div>
            <h4 className="text-lg font-bold text-white">Cont Gratuit</h4>
            <div className="text-3xl font-black text-white mt-1 mb-2">0 RON <span className="text-[10px] text-slate-500 font-normal">/lună</span></div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">Plătești strict pentru documentele generate, încărcând portofelul digital cu Credite când ai nevoie.</p>
          </div>
          <div className="w-full text-center py-2.5 text-slate-400 font-black text-[10px] uppercase tracking-wider bg-slate-800/20 border border-slate-700/50 rounded-lg">
            {!user ? 'Crează Cont Gratuit' : 'Planul tău actual'}
          </div>
        </div>

        {/* PRO PLAN */}
        <div className="bg-[#12181D] border border-[#8ba888]/40 hover:border-[#8ba888] rounded-xl p-6 flex flex-col justify-between transition-colors relative shadow-[0_0_15px_rgba(139,168,136,0.05)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#8ba888] to-transparent"></div>
          <div>
            <div className="flex justify-center items-center mb-3">
              <span className="text-[9px] font-bold text-[#0B0F12] uppercase tracking-wider bg-[#8ba888] px-2 py-0.5 rounded">Freelanceri</span>
            </div>
            <h4 className="text-lg font-bold text-white">Abonament PRO</h4>
            <div className="text-3xl font-black text-white mt-1 mb-2">49 RON <span className="text-[10px] text-slate-500 font-normal">/lună (~9.99 €)</span></div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">Include o cotă gratuită de contracte și rapoarte lunar. Acces deblocat la uneltele QR Standard.</p>
          </div>
          {(isFounder || isBusiness || isPro) ? (
            <div className="w-full text-center py-2.5 text-emerald-400 font-black text-[10px] uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 rounded-lg">Activ sau Inclus VIP</div>
          ) : (
            <button type="button" onClick={() => handleCumparaPremium('pro')} className="w-full bg-[#8ba888] text-[#0B0F12] hover:opacity-90 font-black py-3 rounded-lg text-xs transition-opacity shadow-sm uppercase tracking-wider">Abonează-te PRO</button>
          )}
        </div>

        {/* BUSINESS PLAN */}
        <div className="bg-gradient-to-b from-[#16221A] to-[#12181D] border-2 border-emerald-500/30 hover:border-emerald-500/60 rounded-xl p-6 flex flex-col justify-between transition-colors relative shadow-[0_0_20px_rgba(52,211,153,0.1)]">
          <div>
            <div className="flex justify-center items-center mb-3">
              <span className="text-[9px] font-black text-white uppercase tracking-wider bg-emerald-600 px-3 py-0.5 rounded shadow-sm">Nelimitat (No-Brainer)</span>
            </div>
            <h4 className="text-lg font-bold text-white">Abonament BUSINESS</h4>
            <div className="text-3xl font-black text-emerald-400 mt-1 mb-2">99 RON <span className="text-[10px] text-slate-400 font-normal">/lună (~19.99 €)</span></div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">Zero limite. Generări de contracte B2B, Pachete Auto și Rapoarte ANAF complet nelimitate. QR ProStudio deblocat.</p>
          </div>
          {(isFounder || isBusiness) ? (
            <div className="w-full text-center py-2.5 text-emerald-400 font-black text-[10px] uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 rounded-lg">Activ sau Inclus VIP</div>
          ) : (
            <button type="button" onClick={() => handleCumparaPremium('business')} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-lg text-xs transition-colors shadow-lg shadow-emerald-500/20 uppercase tracking-wider">Alege Business</button>
          )}
        </div>

      </div>

      {/* --- SECȚIUNEA 3: PORTOFELUL DIGITAL (PACHETE DE CREDITE) --- */}
      <div className="text-center border-t border-slate-800/80 pt-10 mb-8 mt-4">
        <h3 className="text-2xl font-black text-white tracking-tight mb-2">Reîncarcă Portofelul Digital</h3>
        <p className="text-xs text-slate-400 max-w-2xl mx-auto">Vrei să plătești doar când ai nevoie? Încarcă un pachet de credite în contul tău ContractSmart fără abonament lunar.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
        {/* Starter */}
        <div className="bg-[#12181D]/60 border border-slate-700/60 rounded-xl p-5 flex items-center justify-between transition-all hover:bg-slate-800/40">
          <div className="text-left">
            <h4 className="text-sm font-bold text-white">Pachet Starter</h4>
            <div className="text-lg font-black text-[#8ba888] flex items-baseline gap-2">
              50 Credite <span className="text-[10px] text-slate-500 font-normal">(50 RON / ~9.99 €)</span>
            </div>
          </div>
          <button onClick={() => handleCumparaPremium('credits_starter')} className="bg-[#0B0F12] border border-slate-700 hover:border-[#8ba888] text-white font-black py-2.5 px-6 rounded-lg text-xs transition-colors shadow-sm">
            Cumpără 50 RON
          </button>
        </div>

        {/* Smart */}
        <div className="bg-[#16221A]/50 border border-emerald-900/50 rounded-xl p-5 flex items-center justify-between transition-all hover:bg-[#16221A] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full -z-10"></div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Pachet Smart 
              <span className="bg-amber-500 text-black px-1.5 py-0.5 rounded text-[8px] font-black uppercase">+30 Bonus</span>
            </h4>
            <div className="text-lg font-black text-emerald-400 flex items-baseline gap-2">
              180 Credite <span className="text-[10px] text-slate-500 font-normal">(150 RON / ~29.99 €)</span>
            </div>
          </div>
          <button onClick={() => handleCumparaPremium('credits_smart')} className="bg-emerald-600 hover:bg-emerald-500 text-black font-black py-2.5 px-6 rounded-lg text-xs transition-colors shadow-[0_0_15px_rgba(52,211,153,0.2)]">
            Cumpără 150 RON
          </button>
        </div>
      </div>


      {/* --- FOUNDER LIFETIME --- */}
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
            <span className="text-[9px] text-amber-400 uppercase font-bold tracking-wider block">Unică / Pe Viață (~199.99 €)</span>
          </div>
          {isFounder ? (
            <div className="text-center py-2 px-4 text-emerald-400 font-black text-[10px] uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              Activ în contul tău
            </div>
          ) : (
            <button 
              type="button" 
              onClick={() => handleCumparaPremium('founder')} 
              className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-black hover:opacity-95 font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0 active:scale-95"
            >
              Devino Fondator VIP
            </button>
          )}
        </div>
      </div>

    </div>
  );
}