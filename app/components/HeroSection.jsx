'use client';

export default function HeroSection({ onStartB2B, onStartAuto, onStartAudit }) {
  return (
    <div className="max-w-4xl mx-auto pt-12 pb-0 px-4 text-center">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tighter mb-2 md:mb-4">
          Contracte <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ba888] to-emerald-400">Inteligente</span>
        </h1>
        <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight tracking-tighter mb-5">
          Prin Management <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ba888] to-emerald-400">De Clauze</span>
        </h1>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto px-4">
        <button type="button" onClick={onStartB2B} className="bg-[#8ba888] text-[#0B0F12] font-black px-4 py-5 rounded-xl shadow-[0_0_20px_rgba(139,168,136,0.15)] transition-all hover:scale-105 text-xs uppercase tracking-wide flex items-center justify-center gap-2">
          Generează B2B
        </button>
        <button type="button" onClick={onStartAuto} className="bg-[#12181D] border border-slate-700 text-white font-bold px-4 py-5 rounded-xl hover:border-[#8ba888]/80 transition-all hover:scale-105 text-xs uppercase tracking-wide flex items-center justify-center gap-2">
          Pachet Acte Auto
        </button>
        <button type="button" onClick={onStartAudit} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black px-4 py-5 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all hover:scale-105 text-xs uppercase tracking-wide flex items-center justify-center gap-2 border border-purple-400/30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          Auditează Contract (AI)
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-12 mb-0 text-center animate-fadeIn">
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
    </div>
  );
}