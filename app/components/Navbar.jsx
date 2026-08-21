'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar({ 
  user, 
  isPremium, 
  handleLogout, 
  stergeCont, 
  setShowAuthModal, 
  setIsSignUp,
  handleInapoiPrincipal 
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Funcție inteligentă pentru scroll sau redirect către prețuri
  const mergiLaPreturi = () => {
    setIsMobileMenuOpen(false);
    const el = document.getElementById('sectiune-preturi');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#sectiune-preturi';
    }
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0F12]/85 border-b border-slate-800/80 py-4 shadow-sm transition-all w-full">
      <div className="flex justify-between items-center w-full px-4 sm:px-8">
        
        {/* LOGO & BADGE ENTERPRISE */}
        <div className="flex items-center">
          <Link 
            href="/" 
            onClick={(e) => { 
              if (handleInapoiPrincipal) {
                e.preventDefault(); 
                handleInapoiPrincipal(); 
              }
            }} 
            className="w-[180px] h-[30px] flex items-center cursor-pointer hover:opacity-90 transition-opacity shrink-0"
          >
            <svg viewBox="0 0 240 52" className="w-full h-full">
              <g transform="translate(0, 6)">
                <path d="M24 6 C15 6, 8 13, 8 22 C8 31, 15 38, 24 38 C31 38, 37 33, 39 27" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round"/>
                <path d="M16 21 L21 26 L32 12" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <text x="48" y="34" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="22" fill="#FFFFFF" letterSpacing="-0.5">
                Contract<tspan fill="#8ba888">Smart</tspan>
              </text>
            </svg>
          </Link>
          
          {/* BADGE DE SECURITATE ENTERPRISE (PASUL 1) */}
          <div className="hidden md:flex items-center gap-2 bg-[#12181D]/80 border border-slate-800 px-3 py-1 rounded-full ml-4 shadow-sm relative group cursor-pointer">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider"> Smart Vault & ANAF Active</span>
            
            {/* Tooltip fin la hover */}
            <div className="absolute top-full left-0 mt-2 w-64 bg-[#12181D] border border-slate-700 p-3 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-[11px] text-slate-300 leading-relaxed font-normal">
             Fiecare document este protejat prin amprentă criptografică SHA-256 și verificare fiscală prealabilă.
            </div>
          </div>
        </div>
        
        {/* HAMBURGER MOBILE */}
        <button 
          className="lg:hidden text-[#8ba888] text-2xl focus:outline-none hover:scale-110 transition-transform"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* MENIU DESKTOP */}
        <div className="hidden lg:flex items-center space-x-6">
          <Link href="/modele-contracte" className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors">Modele Tipizate</Link>
          <span className="text-slate-800">|</span>
          <Link href="/baza-legala" className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors">Baza Legală</Link>
          <span className="text-slate-800">|</span>
          
          {/* Dropdown Simplu pentru Pagini Info */}
          <div className="relative group">
            <button className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors flex items-center gap-1">
              Despre Noi <span className="text-[8px]">▼</span>
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 bg-[#12181D] border border-slate-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden">
              <Link href="/despre-noi" className="px-4 py-3 text-xs text-slate-300 hover:bg-slate-800 hover:text-white border-b border-slate-700/50">Misiune Platformă</Link>
              <Link href="/termeni-si-conditii" className="px-4 py-3 text-xs text-slate-300 hover:bg-slate-800 hover:text-white border-b border-slate-700/50">Termeni și Condiții</Link>
              <Link href="/politica-si-confidentialitate" className="px-4 py-3 text-xs text-slate-300 hover:bg-slate-800 hover:text-white border-b border-slate-700/50">Politica de Confidențialitate</Link>
              <Link href="/contact" className="px-4 py-3 text-xs text-[#8ba888] font-bold hover:bg-slate-800">Suport / Contact</Link>
            </div>
          </div>
          
          <span className="text-slate-800">|</span>
          
          {!user ? (
            <button type="button" onClick={() => { setIsSignUp?.(false); setShowAuthModal?.(true); }} className="text-[11px] font-black text-slate-200 hover:text-[#8ba888] transition-colors uppercase tracking-widest bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700 hover:border-[#8ba888]/50 shadow-sm">Autentificare</button>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end mr-2">
                <span className="text-[10px] text-slate-500 font-mono leading-none mb-1.5">{user.email}</span>
                <div className="flex items-center gap-1.5">
                  
                  {/* LOGICA DE AFIȘARE A STATUSURILOR - DESKTOP */}
                  {user.status === 'founder' ? (
                    <span className="text-[9px] uppercase font-black bg-gradient-to-r from-amber-400 to-amber-600 text-black px-2 py-0.5 rounded shadow-sm border border-amber-300 tracking-widest">
                      FONDATOR
                    </span>
                  ) : user.status === 'pro' ? (
                    <>
                      <span className="text-[9px] uppercase font-black bg-blue-900/20 text-blue-400 px-2 py-0.5 rounded shadow-sm border border-blue-900/50">
                        PRO
                      </span>
                      <span className="text-[9px] uppercase font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 shadow-sm">
                        {3 - (user?.proReportsUsed || 0)}/3 Rapoarte
                      </span>
                      <span className="text-[9px] uppercase font-bold bg-purple-950/40 text-purple-300 px-2 py-0.5 rounded border border-purple-800/50 shadow-sm">
                        {10 - (user?.aiAuditsUsed || 0)}/10 Audituri AI
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[9px] uppercase font-black bg-[#16221A] text-[#8ba888] px-2 py-0.5 rounded shadow-sm border border-emerald-900/40">
                        Plan Gratuit
                      </span>
                      <span className="text-[9px] uppercase font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 shadow-sm">
                        {user.credits} Credite
                      </span>
                    </>
                  )}

                </div>
              </div>
              <button type="button" onClick={handleLogout} className="text-slate-400 hover:text-white text-[11px] font-bold uppercase tracking-wider transition-colors">Ieșire</button>
              <button type="button" onClick={stergeCont} className="text-red-500 hover:text-red-400 text-[11px] font-bold uppercase tracking-wider transition-colors ml-2 bg-red-900/10 px-2 py-1 rounded">Șterge Cont</button>
            </div>
          )}
          
          <button onClick={mergiLaPreturi} className="bg-gradient-to-r from-[#8ba888] to-[#6d8a6a] text-black font-black text-[11px] px-5 py-2.5 rounded-xl uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(139,168,136,0.3)] hover:scale-[1.02] active:scale-[0.98]">Tarife</button>
        </div>
      </div>

      {/* MENIU MOBIL */}
      {isMobileMenuOpen && (
        <div className="lg:hidden flex flex-col space-y-3 pt-5 mt-4 border-t border-slate-800/80 px-4 sm:px-8 animate-fadeIn">
          <Link href="/modele-contracte" className="text-sm font-bold text-slate-300 hover:text-white uppercase tracking-wider" onClick={() => setIsMobileMenuOpen(false)}>Modele Tipizate</Link>
          <Link href="/baza-legala" className="text-sm font-bold text-slate-300 hover:text-white uppercase tracking-wider" onClick={() => setIsMobileMenuOpen(false)}>Baza Legală</Link>
          <div className="h-[1px] w-full bg-slate-800/50 my-1"></div>
          <Link href="/termeni-si-conditii" className="text-xs text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Termeni și Condiții</Link>
          <Link href="/politica-si-confidentialitate" className="text-xs text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Politică de Confidențialitate</Link>
          <Link href="/contact" className="text-xs text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
          <Link href="/despre-noi" className="text-xs text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Despre Noi</Link>

          <div className="h-[1px] w-full bg-slate-800/50 my-2"></div>

          {!user ? (
            <button type="button" onClick={() => { setIsMobileMenuOpen(false); setIsSignUp?.(false); setShowAuthModal?.(true); }} className="text-sm font-black text-[#8ba888] text-left uppercase tracking-wider">Autentificare / Cont Nou</button>
          ) : (
            <div className="flex flex-col space-y-3 bg-[#12181D] p-4 rounded-xl border border-slate-800">
              <div className="flex flex-col space-y-2 mb-2">
                <span className="text-xs text-slate-400">Logat ca: <strong className="text-white font-mono break-all">{user.email}</strong></span>
                <div className="flex items-center gap-2 flex-wrap">
                  
                  {/* LOGICA DE AFIȘARE A STATUSURILOR - MOBILE */}
                  {user.status === 'founder' ? (
                    <span className="text-[10px] uppercase font-black bg-gradient-to-r from-amber-400 to-amber-600 text-black px-2.5 py-1 rounded shadow-sm border border-amber-300 tracking-widest">
                      FONDATOR
                    </span>
                  ) : user.status === 'pro' ? (
                    <>
                      <span className="text-[10px] uppercase font-black bg-blue-900/20 text-blue-400 px-2.5 py-1 rounded shadow-sm border border-blue-900/50">
                        PRO
                      </span>
                      <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700 shadow-sm">
                        {3 - (user?.proReportsUsed || 0)}/3 Rapoarte
                      </span>
                      <span className="text-[10px] uppercase font-bold bg-purple-950/40 text-purple-300 px-2.5 py-1 rounded border border-purple-800/50 shadow-sm">
                        {10 - (user?.aiAuditsUsed || 0)}/10 Audituri AI
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] uppercase font-black bg-[#16221A] text-[#8ba888] px-2.5 py-1 rounded shadow-sm border border-emerald-900/40">
                        Plan Gratuit
                      </span>
                      <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700 shadow-sm">
                        {user.credits} Credite
                      </span>
                    </>
                  )}

                </div>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-700/50">
                <button type="button" onClick={handleLogout} className="text-slate-300 text-xs font-bold uppercase tracking-wider hover:text-white">Ieșire Cont</button>
                <button type="button" onClick={stergeCont} className="text-red-500 text-xs font-bold uppercase tracking-wider hover:text-red-400">Șterge Cont</button>
              </div>
            </div>
          )}
          <button onClick={mergiLaPreturi} className="bg-gradient-to-r from-[#8ba888] to-[#6d8a6a] text-black font-black text-sm px-4 py-3.5 rounded-xl text-center uppercase tracking-widest shadow-lg mt-2">Vezi Oferte & Tarife</button>
        </div>
      )}
    </nav>
  );
}