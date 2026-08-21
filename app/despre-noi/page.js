'use client';
import Link from 'next/link';
import { useState } from 'react';
import '../globals.css';
import Navbar from '@/app/components/Navbar';

export default function DespreNoi() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-300 font-sans selection:bg-[#8ba888]/30 selection:text-[#8ba888]">
      
            {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[50%] transform -translate-x-1/2 w-[90vw] h-[90vw] min-w-[800px] min-h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139, 168, 136, 0.05) 0%, rgba(11, 15, 18, 0) 60%)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10 md:py-16">
        
        {/* BUTON INAPOI RAPID */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-[#12181D]/60 border border-slate-800/80 px-4 py-2 rounded-lg hover:border-[#8ba888]/50 shadow-sm backdrop-blur-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Înapoi la aplicație
          </Link>
        </div>

        {/* HEADER PAGE */}
        <div className="text-center mb-16 border-b border-slate-800/80 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16221A] border border-[#8ba888]/20 text-[#8ba888] text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>
            Misiunea Noastră
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter mb-5">
            Birocrația nu ar trebui să fie o <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ba888] to-emerald-400">frână în afaceri.</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Am construit <strong>ContractSmart</strong> dintr-o frustrare comună: timpul pierdut redactând hârtii, teama de clienți rău-platnici și lipsa unei structuri clare care să protejeze munca antreprenorilor și a freelancerilor din România.
          </p>
        </div>

        {/* CONTINUT */}
        <div className="space-y-8 text-sm text-slate-300 leading-relaxed font-light">
          
          <p className="text-base text-slate-200 text-center max-w-3xl mx-auto">
            Platforma noastră nu este doar un simplu generator de PDF-uri. Este o <strong className="text-white">infrastructură electronică avansată</strong>, dezvoltată pe fundamentele Codului Civil, concepută să îți securizeze încasările. Integrăm clauze anti-inflație, limitări de răspundere și sisteme moderne precum plata prin cod QR, direct pe document.
          </p>
          
          {/* CARD PREZENTARE - DE CE NOI? */}
          <div className="bg-gradient-to-b from-[#12181D]/40 to-[#16221A]/60 border border-slate-800/80 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden group hover:border-[#8ba888]/30 transition-colors my-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8ba888]/5 blur-3xl rounded-full"></div>
            
            <h3 className="text-2xl font-black text-white mb-8 relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8ba888]/20 flex items-center justify-center text-[#8ba888] border border-[#8ba888]/30">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              De ce noi?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div className="bg-[#0B0F12] p-6 rounded-2xl border border-slate-800/60 hover:border-[#8ba888]/30 transition-colors shadow-inner">
                <div className="w-8 h-8 rounded-full bg-emerald-900/30 text-emerald-400 flex items-center justify-center mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h4 className="text-white font-bold mb-2 tracking-wide">Rapiditate</h4>
                <p className="text-xs text-slate-400">Generezi contracte blindate juridic și pachete auto complete în sub 60 de secunde.</p>
              </div>

              <div className="bg-[#0B0F12] p-6 rounded-2xl border border-slate-800/60 hover:border-[#8ba888]/30 transition-colors shadow-inner">
                <div className="w-8 h-8 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                </div>
                <h4 className="text-white font-bold mb-2 tracking-wide">Inovație AI</h4>
                <p className="text-xs text-slate-400">Singurul ecosistem cu OCR integrat, asistent AI Juridic și Mega-QR Studio dedicat conversiilor.</p>
              </div>

              <div className="bg-[#0B0F12] p-6 rounded-2xl border border-slate-800/60 hover:border-[#8ba888]/30 transition-colors shadow-inner">
                <div className="w-8 h-8 rounded-full bg-amber-900/30 text-amber-400 flex items-center justify-center mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h4 className="text-white font-bold mb-2 tracking-wide">Siguranță</h4>
                <p className="text-xs text-slate-400">Arhitectură "Privacy by Design". Datele tale sunt prelucrate volatil (RAM) și nu stocăm informații sensibile.</p>
              </div>
            </div>
          </div>

          <p className="text-center text-slate-400 max-w-2xl mx-auto">
            Fie că ești la început de drum, vinzi o mașină sau rulezi un SRL cu cifre de afaceri complexe, ContractSmart este partenerul tău tăcut care se asigură că la finalul zilei, munca ta este respectată și plătită la timp.
          </p>

          <div className="mt-16 pt-10 border-t border-slate-800/80 flex justify-center">
            <Link href="/" className="bg-gradient-to-r from-[#8ba888] to-[#6d8a6a] text-black font-black px-10 py-4 rounded-xl text-sm tracking-wide uppercase shadow-[0_0_20px_rgba(139,168,136,0.2)] hover:shadow-[0_0_25px_rgba(139,168,136,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              Începe să generezi gratuit
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
          </div>
          
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