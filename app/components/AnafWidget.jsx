'use client';

export default function AnafWidget({ 
  cuiSearch, setCuiSearch, isSearchingCui, handleCautareCuiWidget, 
  cuiDataResult 
}) {
  return (
    <div className="w-full">
      <div className="bg-[#12181D]/60 backdrop-blur-xl rounded-3xl border border-slate-800/80 hover:border-blue-500/30 transition-colors shadow-2xl p-6 md:p-8 flex flex-col h-full relative overflow-hidden group">
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>
        
        <div className="relative z-10 mb-8 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-900/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">Scanner Date ANAF</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Interoghează rapid starea juridică a oricărei firme direct din bazele statului.</p>
          </div>
        </div>
        
        <div className="w-full relative z-10 flex flex-col flex-1">
          <form onSubmit={handleCautareCuiWidget} className="flex flex-col sm:flex-row gap-3 w-full mb-6">
            <input 
              type="text" 
              placeholder="Introdu CUI (ex: 123456)" 
              value={cuiSearch} 
              onChange={e => setCuiSearch(e.target.value)} 
              className="w-full sm:w-2/3 bg-[#0B0F12] border border-slate-700/60 rounded-xl p-4 text-sm text-white font-mono outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner placeholder:text-slate-600" 
              required 
            />
            <button 
              type="submit" 
              disabled={isSearchingCui} 
              className="w-full sm:w-1/3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black px-4 py-4 rounded-xl text-xs uppercase tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(59,130,246,0.2)] disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isSearchingCui ? (
                <><svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Se caută...</>
              ) : 'Caută CUI'}
            </button>
          </form>

          {!cuiDataResult ? (
            <div className="w-full py-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-700/50 rounded-2xl bg-[#0B0F12]/50 text-slate-500 mt-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-md border border-slate-700">Așteaptă Căutarea</span>
            </div>
          ) : (
            <div className="w-full bg-[#0B0F12] border border-slate-700/80 rounded-2xl p-6 animate-fadeIn text-left shadow-inner mt-auto">
              <div className="flex justify-between items-start mb-4 gap-4">
                <div>
                  <h4 className="text-sm font-black text-white uppercase leading-snug">{cuiDataResult.denumire}</h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                    <span className="text-xs text-slate-500 font-mono bg-[#12181D] px-2 py-1 rounded border border-slate-800">CUI: <strong className="text-white">{cuiDataResult.cui}</strong></span>
                    {(cuiDataResult.nrRegCom || cuiDataResult.numar_reg_com || cuiDataResult.reg_com) && (
                      <span className="text-xs text-slate-500 font-mono bg-[#12181D] px-2 py-1 rounded border border-slate-800">
                        Reg: <strong className="text-white">{cuiDataResult.nrRegCom || cuiDataResult.numar_reg_com || cuiDataResult.reg_com}</strong>
                      </span>
                    )}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase shrink-0 mt-0.5 shadow-sm border ${cuiDataResult.stare?.toLowerCase().includes('inactiv') || cuiDataResult.stare?.toLowerCase().includes('radiat') ? 'bg-red-900/20 text-red-400 border-red-500/30' : 'bg-emerald-900/20 text-emerald-400 border-emerald-500/30'}`}>
                  {cuiDataResult.stare || 'Necunoscut'}
                </span>
              </div>
              
              {cuiDataResult.adresa && (
                <div className="mt-5 text-[11px] text-slate-400 bg-[#12181D] p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                  <strong className="text-slate-500 uppercase text-[9px] font-black tracking-widest block mb-1">Sediu Social Declarat:</strong>
                  {cuiDataResult.adresa}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}