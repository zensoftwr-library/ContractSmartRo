'use client';
import { useState } from 'react';

export default function FiscalCalculator() {
  const [fiscal, setFiscal] = useState({
    venitLunar: 0,
    formaJuridica: 'SRL', 
    platitorTva: false,
    areAngajati: true,
    normaRegiune: 45000
  });

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

  return (
    <div className="w-full">
      <div className="bg-[#12181D]/60 backdrop-blur-xl rounded-3xl border border-slate-800/80 hover:border-emerald-500/30 transition-colors shadow-2xl p-6 md:p-8 flex flex-col justify-between h-full relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-emerald-900/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            </div>
            <div>
              <h4 className="text-[#8ba888] font-black text-sm uppercase tracking-wider mb-1">Calculator Fiscal 2026</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Simulează impactul taxelor, plafoanelor CASS și TVA-ului asupra contractului.</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-[#0B0F12] p-5 rounded-2xl border border-slate-700/60 shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Valoare Factură / Venit</label>
                <span className="bg-[#16221A] text-[#8ba888] border border-emerald-900/40 px-2 py-0.5 rounded font-mono text-xs font-bold">
                  {fiscal.venitLunar} {fiscal.moneda || 'RON'}
                </span>
              </div>
              <input type="range" min="0" max="50000" step="1" value={fiscal.venitLunar} onChange={e => setFiscal({...fiscal, venitLunar: Number(e.target.value)})} className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-[#8ba888]" />
              
              <div className="mt-4 flex items-center gap-3">
                <input 
                  type="number" 
                  min="0" 
                  max="50000" 
                  value={fiscal.venitLunar} 
                  onChange={e => setFiscal({...fiscal, venitLunar: Number(e.target.value)})} 
                  className="w-full p-3 bg-[#12181D] text-white rounded-xl border border-slate-700/80 outline-none focus:ring-1 focus:ring-[#8ba888]/50 focus:border-[#8ba888] text-sm font-mono transition-all" 
                  placeholder="Introdu suma exactă..." 
                />
                <select 
                  value={fiscal.moneda || 'RON'} 
                  onChange={e => setFiscal({...fiscal, moneda: e.target.value})} 
                  className="w-24 bg-[#12181D] border border-slate-700/80 rounded-xl p-3 text-xs text-white outline-none appearance-none cursor-pointer focus:border-[#8ba888] focus:ring-1 focus:ring-[#8ba888]/50 font-bold uppercase tracking-wide transition-all shadow-inner bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.2em_1.2em] bg-[right_0.5rem_center] bg-no-repeat pr-7"
                >
                  <option value="RON">RON</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1.5 block">Formă Juridică</label>
                <select value={fiscal.formaJuridica} onChange={e => setFiscal({...fiscal, formaJuridica: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700/60 rounded-xl py-3 px-4 text-slate-200 outline-none focus:border-[#8ba888] text-xs font-bold transition-all shadow-inner appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_0.8rem_center] bg-no-repeat pr-8">
                  <option value="SRL">SRL (Micro)</option>
                  <option value="PFA_SISTEM_REAL">PFA (Real)</option>
                </select>
              </div>
              {fiscal.formaJuridica !== 'PFA_SISTEM_REAL' && (
                <div>
                  <label className="text-transparent select-none text-[10px] font-black uppercase mb-1.5 block hidden sm:block">-</label>
                  <div className="flex gap-2 h-[42px]">
                    <label className="flex-1 flex items-center justify-center bg-[#0B0F12] rounded-xl border border-slate-700/60 cursor-pointer text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:border-[#8ba888]/50 transition-colors shadow-inner">
                      <input type="checkbox" checked={fiscal.areAngajati} onChange={e => setFiscal({...fiscal, areAngajati: e.target.checked})} className="mr-2 accent-[#8ba888]" /> Angajați
                    </label>
                    <label className="flex-1 flex items-center justify-center bg-[#0B0F12] rounded-xl border border-slate-700/60 cursor-pointer text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:border-[#8ba888]/50 transition-colors shadow-inner">
                      <input type="checkbox" checked={fiscal.platitorTva} onChange={e => setFiscal({...fiscal, platitorTva: e.target.checked})} className="mr-2 accent-[#8ba888]" /> TVA
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 relative z-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="bg-[#0B0F12] p-3.5 rounded-xl border border-slate-800/60 flex flex-col justify-center shadow-inner">
                <span className="text-slate-500 text-[9px] uppercase font-bold tracking-widest block mb-1">Impozit micro</span>
                <span className="text-white font-mono font-bold text-sm">{rezultateFiscale.defalcare.impozit} <span className="text-[10px] text-slate-500">RON</span></span>
              </div>
              <div className="bg-[#0B0F12] p-3.5 rounded-xl border border-slate-800/60 flex flex-col justify-center shadow-inner">
                <span className="text-slate-500 text-[9px] uppercase font-bold tracking-widest block mb-1">CAS/CASS</span>
                <span className="text-white font-mono font-bold text-sm">{rezultateFiscale.defalcare.sociale} <span className="text-[10px] text-slate-500">RON</span></span>
              </div>
              {fiscal.formaJuridica === 'SRL' && (
                <div className="bg-[#0B0F12] p-3.5 rounded-xl border border-slate-800/60 flex flex-col justify-center shadow-inner">
                  <span className="text-slate-500 text-[9px] uppercase font-bold tracking-widest block mb-1">Div(10%)</span>
                  <span className="text-white font-mono font-bold text-sm">{rezultateFiscale.defalcare.dividende} <span className="text-[10px] text-slate-500">RON</span></span>
                </div>
              )}
              {fiscal.platitorTva && (
                <div className="bg-[#0B0F12] p-3.5 rounded-xl border border-slate-800/60 flex flex-col justify-center shadow-inner">
                  <span className="text-slate-500 text-[9px] uppercase font-bold tracking-widest block mb-1">TVA (21%)</span>
                  <span className="text-white font-mono font-bold text-sm">{rezultateFiscale.tvaLunar} <span className="text-[10px] text-slate-500">RON</span></span>
                </div>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-[#16221A] to-[#0B0F12] border border-[#8ba888]/30 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 shadow-lg">
              <div className="text-center sm:text-left">
                <span className="text-slate-400 block text-[9px] uppercase font-black tracking-widest mb-1">Dări Stat (Total)</span>
                <strong className="text-red-400 font-mono text-base">{rezultateFiscale.taxeLunare} RON</strong>
              </div>
              <div className="h-8 w-[1px] bg-slate-700/50 hidden sm:block"></div>
              <div className="text-center sm:text-right">
                <span className="text-[#8ba888] block text-[9px] uppercase font-black tracking-widest mb-1">Profit Curat Net</span>
                <strong className="text-white text-2xl font-mono tracking-tight">{rezultateFiscale.netLunar} <span className="text-sm text-[#8ba888]">RON</span></strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}