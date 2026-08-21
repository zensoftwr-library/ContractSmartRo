'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { bibliotecaLegala } from './bazaLegalaData';
import Navbar from '../components/Navbar';

export default function BazaLegalaIndex() {
  const [articoleAfisate, setArticoleAfisate] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const shuffled = [...bibliotecaLegala].sort(() => 0.5 - Math.random());
    setArticoleAfisate(shuffled.slice(0, 16));
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#0B0F12]"></div>;
  }

  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-300 font-sans selection:bg-[#8ba888]/30 selection:text-[#8ba888]">
      
<Navbar />

            {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[5%] left-[50%] transform -translate-x-1/2 w-[90vw] h-[90vw] min-w-[800px] min-h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139, 168, 136, 0.04) 0%, rgba(11, 15, 18, 0) 60%)' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 md:py-16">
        
        {/* BUTON INAPOI */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-[#12181D]/60 border border-slate-800/80 px-4 py-2 rounded-lg hover:border-[#8ba888]/50 shadow-sm backdrop-blur-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Înapoi la aplicație
          </Link>
        </div>

        {/* HEADER */}
        <div className="mb-12 border-b border-slate-800/80 pb-10 flex flex-col items-center text-center gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16221A] border border-[#8ba888]/20 text-[#8ba888] text-[10px] font-black uppercase tracking-widest shadow-sm">
            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>
            Actualizat Live din Monitorul Oficial
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Validitate Juridică & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ba888] to-emerald-400">Bază Legală</span>
          </h1>
          
          <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed mb-2">
            Selecție dinamică a normelor juridice oficiale care fundamentează infrastructura platformei ContractSmart, actualizate în timp real.
          </p>
          
          <button 
            onClick={() => setArticoleAfisate([...bibliotecaLegala].sort(() => 0.5 - Math.random()).slice(0, 16))}
            className="mt-2 flex items-center justify-center gap-2 bg-[#12181D] hover:bg-slate-800 border border-slate-700 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-sm group hover:border-[#8ba888]/50"
          >
            <svg className="w-4 h-4 text-[#8ba888] group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Reîncarcă Articole
          </button>
        </div>

        {/* GRID ARTICOLE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articoleAfisate.map((articol) => (
            <Link 
              key={articol.slug} 
              href={`/baza-legala/${articol.slug}`}
              className="bg-[#12181D]/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-[#8ba888]/40 transition-colors cursor-pointer shadow-lg relative overflow-hidden group"
            >
              {/* Accent Hover Blob */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#8ba888]/5 blur-2xl rounded-full group-hover:bg-[#8ba888]/15 transition-colors pointer-events-none"></div>

              <div className="relative z-10">
                <span className="text-[9px] font-black tracking-widest text-[#8ba888] bg-[#16221A] px-2.5 py-1 rounded-md border border-emerald-900/40 uppercase shadow-sm">
                  {articol.sursa}
                </span>
                <h2 className="text-base font-black text-white mt-4 mb-3 leading-snug group-hover:text-[#8ba888] transition-colors line-clamp-3">
                  {articol.titlu}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
                  {articol.descriere}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-between items-center relative z-10">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{articol.categorie}</span>
                <span className="w-8 h-8 rounded-full bg-[#16221A] border border-emerald-900/30 flex items-center justify-center text-[#8ba888] group-hover:bg-[#8ba888] group-hover:text-black transition-all shadow-sm">
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* TRUST BADGES ENTERPRISE */}
      <div className="max-w-6xl mx-auto px-6 my-16">
        <div className="bg-[#12181D]/40 border border-slate-800/80 backdrop-blur-xl p-6 rounded-2xl flex flex-col md:flex-row items-center justify-around gap-6 text-center shadow-lg">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20">✓</div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Validare Fiscală ANAF</h4>
              <p className="text-[10px] text-slate-400">Interogare directă în registre</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#8ba888]/10 text-[#8ba888] flex items-center justify-center font-bold border border-[#8ba888]/20">🛡️</div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Criptografie SHA-256</h4>
              <p className="text-[10px] text-slate-400">Amprentă imuabilă în Smart Vault</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold border border-blue-500/20">⚖️</div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Codul Civil Român</h4>
              <p className="text-[10px] text-slate-400">Conformitate Art. 1522 & 1538</p>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER STANDARD PLATFORMA */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#0B0F12] pt-12 pb-8 mt-16 text-center">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          <div className="flex justify-center">
            <Link href="/" className="w-[180px] h-[30px] cursor-pointer block hover:opacity-90 transition-opacity">
              <svg viewBox="0 0 240 40" className="w-full h-full mx-auto">
                <g transform="translate(0, 2)">
                  <path d="M24 6 C15 6, 8 13, 8 22 C8 31, 15 38, 24 38 C31 38, 37 33, 39 27" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round"/>
                  <path d="M16 21 L21 26 L32 12" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <text x="48" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="20" fill="#FFFFFF" letterSpacing="-0.5">
                  Contract<tspan fill="#8ba888">Smart</tspan>
                </text>
              </svg>
            </Link>
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Infrastructură electronică avansată dedicată optimizării micro-sistemelor, înmatriculării rapide a entităților comerciale și auditului de clauze pe Codul Civil român.
          </p>
          <div className="flex justify-center space-x-6 text-xs text-slate-400 font-medium">
            <Link href="/termeni-si-conditii" className="hover:text-[#8ba888] transition">Termeni și Condiții</Link>
            <span>•</span>
            <Link href="/politica-si-confidentialitate" className="hover:text-[#8ba888] transition">Confidențialitate</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-[#8ba888] transition">Contact</Link>
          </div>
          <div className="pt-6 border-t border-slate-800/40 flex flex-col items-center gap-4">
            <p className="text-[10px] text-slate-500 font-mono max-w-3xl text-center leading-relaxed px-4">
              <strong className="text-red-500/80">Disclaimer Legal!</strong> <strong className="text-[#8ba888]">ContractSmart</strong> este o platformă de software. <strong className="text-red-500/80">NU</strong> suntem o casă de avocatură și nu oferim consultanță juridică.
            </p>
            <p className="text-[11px] text-slate-500 font-mono tracking-wide">© 2026 <strong className="text-[#8ba888]">ContractSmart</strong>. Powered by <strong className="text-[#8ba888]">ZenSoftWare</strong>.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}