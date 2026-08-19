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
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#0B0F12]/90 border-b border-slate-800 py-4 px-6 shadow-md transition-all">
      <div className="flex justify-between items-center w-full">
        {/* LOGO */}
        <Link 
          href="/" 
          onClick={(e) => { 
            if (handleInapoiPrincipal) {
              e.preventDefault(); 
              handleInapoiPrincipal(); 
            }
          }} 
          className="w-[180px] h-[30px] flex items-center cursor-pointer"
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
        
        {/* HAMBURGER MOBILE */}
        <button 
          className="md:hidden text-[#8ba888] text-2xl focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* MENIU DESKTOP */}
        <div className="hidden md:flex items-center space-x-5">
          <Link href="/modele-contracte" className="text-xs text-slate-400 hover:text-white transition">Modele Contracte Standard</Link>
          <span className="text-slate-800">|</span>
          <Link href="/baza-legala" className="text-xs text-slate-400 hover:text-white transition">Articole Validitate Juridică</Link>
          <span className="text-slate-800">|</span>
          <Link href="/termeni-si-conditii" className="text-xs text-slate-400 hover:text-white transition">Termeni și Condiții</Link>
          <span className="text-slate-800">|</span>
          <Link href="/politica-si-confidentialitate" className="text-xs text-slate-400 hover:text-white transition">Politica și Confidențialitate</Link>
          <span className="text-slate-800">|</span>
          <Link href="/contact" className="text-xs text-slate-400 hover:text-white transition">Contact</Link>
          <span className="text-slate-800">|</span>
          <Link href="/despre-noi" className="text-xs text-slate-400 hover:text-white transition">Despre Noi</Link>
          <span className="text-slate-800">|</span>
          
          {!user ? (
            <button type="button" onClick={() => { setIsSignUp?.(false); setShowAuthModal?.(true); }} className="text-xs font-bold text-slate-300 hover:text-[#8ba888] transition">Autentificare / Cont Nou</button>
          ) : (
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-slate-400 flex items-center gap-2">
                <span>Cont: <strong className="text-white font-mono font-normal">{user.email}</strong></span>
                <span className="text-[10px] uppercase font-bold bg-[#16221A] text-[#8ba888] px-2 py-0.5 rounded border border-emerald-900/40">
                  {user.status}
                </span>
                {user.status === 'pro' && (
                  <span className="text-[10px] uppercase font-bold bg-blue-900/20 text-blue-400 px-2 py-0.5 rounded border border-blue-900/50 shadow-sm">
                    {3 - (user?.proReportsUsed || 0)}/3 RAPOARTE
                  </span>
                )}
                {!isPremium && (
                  <span className="text-[10px] uppercase font-bold bg-amber-900/20 text-amber-500 px-2 py-0.5 rounded border border-amber-900/50">
                    {user.credits} CREDITE
                  </span>
                )}
              </span>
              <button type="button" onClick={handleLogout} className="text-slate-300 hover:text-white font-bold hover:underline">Ieșire</button>
              <span className="text-slate-800">|</span>
              <button type="button" onClick={stergeCont} className="text-red-500 font-bold hover:underline">Șterge Cont</button>
            </div>
          )}
          <button onClick={mergiLaPreturi} className="bg-[#8ba888] hover:opacity-90 text-[#0B0F12] font-black text-xs px-4 py-2 rounded-md transition shadow-md shadow-[#8ba888]/10">Vezi Oferte</button>
        </div>
      </div>

      {/* MENIU MOBIL */}
      {isMobileMenuOpen && (
        <div className="md:hidden flex flex-col space-y-4 pt-4 mt-4 border-t border-slate-800 animate-fadeIn">
          <Link href="/modele-contracte" className="text-sm text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Modele Contracte Standard</Link>
          <Link href="/baza-legala" className="text-sm text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Articole Validitate Juridică</Link>
          <Link href="/termeni-si-conditii" className="text-sm text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Termeni și Condiții</Link>
          <Link href="/politica-si-confidentialitate" className="text-sm text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Politică de Confidențialitate</Link>
          <Link href="/contact" className="text-sm text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
          <Link href="/despre-noi" className="text-sm text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Despre Noi</Link>

          {!user ? (
            <button type="button" onClick={() => { setIsMobileMenuOpen(false); setIsSignUp?.(false); setShowAuthModal?.(true); }} className="text-sm font-bold text-[#8ba888] text-left">Autentificare / Cont Nou</button>
          ) : (
            <div className="flex flex-col space-y-2 border-t border-slate-800/50 pt-2">
              <div className="flex flex-col space-y-1.5 mb-2">
                <span className="text-xs text-slate-400">Logat ca: <strong className="text-white">{user.email}</strong></span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-bold bg-[#16221A] text-[#8ba888] px-2 py-0.5 rounded border border-emerald-900/40">
                    {user.status}
                  </span>
                  {user.status === 'pro' && (
                    <span className="text-[10px] uppercase font-bold bg-blue-900/20 text-blue-400 px-2 py-0.5 rounded border border-blue-900/50 shadow-sm">
                      {3 - (user?.proReportsUsed || 0)}/3 RAPOARTE
                    </span>
                  )}
                  {!isPremium && (
                    <span className="text-[10px] uppercase font-bold bg-amber-900/20 text-amber-500 px-2 py-0.5 rounded border border-amber-900/50">
                      {user.credits} CREDITE
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-4 pt-1">
                <button type="button" onClick={handleLogout} className="text-slate-300 text-sm font-bold text-left hover:text-white">Ieșire</button>
                <button type="button" onClick={stergeCont} className="text-red-500 text-sm font-bold text-left hover:underline">Șterge Cont</button>
              </div>
            </div>
          )}
          <button onClick={mergiLaPreturi} className="bg-[#8ba888] text-[#0B0F12] font-black text-sm px-4 py-3 rounded-md text-center">Vezi Oferte</button>
        </div>
      )}
    </nav>
  );
}