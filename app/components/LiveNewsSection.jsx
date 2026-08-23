'use client';
import { useState } from 'react';

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
          <NewsCard key={i} stire={stire} />
        ))}
      </div>
    </div>
  );
}

function NewsCard({ stire }) {
  const [imageError, setImageError] = useState(false);
  const showImage = stire.imagine && !imageError;

  return (
    <a href={stire.link} target="_blank" rel="noreferrer" className="group flex flex-col bg-[#0B0F12] border border-slate-800/80 rounded-2xl overflow-hidden hover:border-[#8ba888]/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_-15px_rgba(139,168,136,0.3)] transition-all duration-300 h-full relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#8ba888]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      
      {/* Container Imagine / Fallback */}
      <div className="w-full h-44 overflow-hidden relative border-b border-slate-800/60 bg-gradient-to-br from-[#16221A]/50 to-[#0B0F12] flex items-center justify-center">
        {showImage ? (
          <>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
            <img 
              src={stire.imagine} 
              alt="News thumbnail" 
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out absolute inset-0 z-0" 
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center relative z-0 opacity-50 group-hover:opacity-80 transition-opacity">
            <svg className="w-8 h-8 text-[#8ba888] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">ContractSmart Legal Monitor</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 z-20">
          <span className="text-[9px] font-black text-black bg-[#8ba888] px-2.5 py-1 rounded-md shadow-lg uppercase tracking-wider">{stire.sursa || "Presă Economică"}</span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col justify-between flex-1 relative z-10">
        <div>
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
  );
}