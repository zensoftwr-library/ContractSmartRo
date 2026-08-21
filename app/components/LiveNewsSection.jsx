'use client';

export default function LiveNewsSection({ stiriLive }) {
  if (!stiriLive || stiriLive.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 mt-16 pt-12 mb-12 border-t border-slate-800/80 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#8ba888]/30 to-transparent"></div>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#12181D] flex items-center justify-center border border-slate-700/60 shadow-inner">
          <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span></span>
        </div>
        <div>
          <span className="text-sm font-black text-white uppercase tracking-widest block">Flux Monitorizare Legală Real-Time</span>
          <span className="text-[10px] text-slate-400">Actualizări automate din surse oficiale și presă economică</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stiriLive.slice(0, 6).map((stire, i) => (
          <a href={stire.link} target="_blank" rel="noreferrer" key={i} className="group flex flex-col bg-[#0B0F12] border border-slate-800/80 rounded-2xl overflow-hidden hover:border-[#8ba888]/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_-15px_rgba(139,168,136,0.3)] transition-all duration-300 h-full relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#8ba888]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            
            {stire.imagine ? (
              <div className="w-full h-44 overflow-hidden relative border-b border-slate-800/60 bg-gradient-to-br from-[#12181D] to-[#16221A]">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                <img 
                  src={stire.imagine} 
                  alt="News thumbnail" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out absolute inset-0 z-0" 
                />
                <div className="absolute bottom-3 left-3 z-20">
                  <span className="text-[9px] font-black text-black bg-[#8ba888] px-2.5 py-1 rounded-md shadow-lg uppercase tracking-wider">{stire.sursa || "Presă Economică"}</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-1.5 bg-gradient-to-r from-slate-800 to-[#8ba888]/30"></div>
            )}
            
            <div className="p-6 flex flex-col justify-between flex-1 relative z-10">
              <div>
                {!stire.imagine && (
                  <span className="text-[9px] font-bold text-[#8ba888] bg-[#12181D] px-2 py-1 rounded border border-[#8ba888]/20 uppercase inline-block mb-4">{stire.sursa || "Presă Economică"}</span>
                )}
                <h3 className="text-sm font-bold text-slate-200 leading-relaxed group-hover:text-white transition-colors line-clamp-3">{stire.titlu || stire.title}</h3>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 flex items-center gap-1.5">
                  <span className="block w-1.5 h-1.5 rounded-full bg-[#8ba888]"></span>
                  Astăzi
                </span>
                <span className="text-[10px] font-bold text-[#8ba888] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Citește Articol <span className="text-lg leading-none mb-0.5">›</span>
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}