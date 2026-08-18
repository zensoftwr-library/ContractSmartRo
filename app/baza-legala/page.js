'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { bibliotecaLegala } from './bazaLegalaData';

export default function BazaLegalaIndex() {
  const [articoleAfisate, setArticoleAfisate] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const shuffled = [...bibliotecaLegala].sort(() => 0.5 - Math.random());
    setArticoleAfisate(shuffled.slice(0, 16));
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#0B0F12]"></div>;
  }

  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-300 font-sans py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Link href="/" className="text-xs font-bold text-[#8ba888] hover:text-white transition flex items-center gap-2 mb-4">
              &larr; Înapoi la Panoul Principal
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              Baza Legală ContractSmart
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Selecție dinamică a normelor juridice oficiale care fundamentează infrastructura platformei.
            </p>
          </div>
          <div className="bg-[#16221A] text-[#8ba888] border border-emerald-900/40 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider h-fit">
            Actualizat Live
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {articoleAfisate.map((articol) => (
            <Link 
              key={articol.slug} 
              href={`/baza-legala/${articol.slug}`}
              className="bg-[#12181D] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all cursor-pointer shadow-lg group"
            >
              <div>
                <span className="text-[9px] font-bold text-[#8ba888] bg-[#16221A] px-2 py-0.5 rounded border border-emerald-900/50 uppercase">
                  {articol.sursa}
                </span>
                <h2 className="text-sm font-bold text-white mt-3 mb-2 leading-snug group-hover:text-[#8ba888] transition-colors">
                  {articol.titlu}
                </h2>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {articol.descriere}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-between items-center">
                <span className="text-[10px] text-slate-600 font-mono">{articol.categorie}</span>
                <span className="text-xs font-bold text-[#8ba888] group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}