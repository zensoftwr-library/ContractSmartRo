'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function PoliticaConfidentialitate() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-300 font-sans selection:bg-[#8ba888]/30 selection:text-[#8ba888]">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0F12]/80 border-b border-slate-800/80 py-4 px-6 shadow-sm transition-all">
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
          <Link href="/" className="w-[180px] h-[30px] flex items-center cursor-pointer hover:opacity-90 transition-opacity">
            <svg viewBox="0 0 240 40" className="w-full h-full">
              <g transform="translate(0, 2)">
                <path d="M24 6 C15 6, 8 13, 8 22 C8 31, 15 38, 24 38 C31 38, 37 33, 39 27" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round"/>
                <path d="M16 21 L21 26 L32 12" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <text x="48" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="20" fill="#FFFFFF" letterSpacing="-0.5">
                Contract<tspan fill="#8ba888">Smart</tspan>
              </text>
            </svg>
          </Link>
          
          <button className="md:hidden text-[#8ba888] text-2xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>

          <div className="hidden md:flex items-center space-x-5">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition">Acasă</Link>
            <span className="text-slate-800">|</span>
            <Link href="/termeni-si-conditii" className="text-xs text-slate-400 hover:text-white transition">Termeni și Condiții</Link>
            <span className="text-slate-800">|</span>
            <Link href="/politica-si-confidentialitate" className="text-xs text-[#8ba888] font-bold transition drop-shadow-[0_0_8px_rgba(139,168,136,0.3)]">Confidențialitate</Link>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden flex flex-col space-y-4 pt-4 mt-4 border-t border-slate-800/80 animate-fadeIn px-4 pb-2">
            <Link href="/" className="text-sm text-slate-300">Acasă</Link>
            <Link href="/termeni-si-conditii" className="text-sm text-slate-300">Termeni și Condiții</Link>
            <Link href="/politica-si-confidentialitate" className="text-sm text-[#8ba888] font-bold">Confidențialitate</Link>
          </div>
        )}
      </nav>

      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[5%] left-[50%] transform -translate-x-1/2 w-[90vw] h-[90vw] min-w-[800px] min-h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139, 168, 136, 0.04) 0%, rgba(11, 15, 18, 0) 60%)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10 md:py-16">
        
        {/* BUTON INAPOI */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-[#12181D]/60 border border-slate-800/80 px-4 py-2 rounded-lg hover:border-[#8ba888]/50 shadow-sm backdrop-blur-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Înapoi la aplicație
          </Link>
        </div>

        {/* HEADER */}
        <div className="text-center mb-16 border-b border-slate-800/80 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16221A] border border-[#8ba888]/20 text-[#8ba888] text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>
            Sistem Prelucrare Tranzitorie (RAM)
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter mb-5">
            Politica de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ba888] to-emerald-400">Confidențialitate</span>
          </h1>
          <p className="text-sm text-slate-400">Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}</p>
        </div>

        {/* CONTINUT */}
        <div className="space-y-8">
          
          <section className="bg-[#12181D]/40 border border-slate-800/80 p-6 md:p-8 rounded-2xl shadow-lg hover:border-[#8ba888]/30 transition-colors">
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#8ba888]/20 flex items-center justify-center text-[#8ba888] font-black text-sm border border-[#8ba888]/30">1</span>
              Principii Generale, Vârsta Minimă și Abordare GDPR
            </h2>
            <p className="text-sm leading-relaxed text-slate-300 mb-3">
              Această Politică de Confidențialitate explică modul în care platforma noastră prelucrează datele cu caracter personal. Ne-am construit arhitectura tehnică pe principiul <strong>„Privacy by Design”</strong>, minimizând riscurile asociate stocării datelor.
            </p>
            <p className="text-sm leading-relaxed text-slate-300">
              <strong className="text-white">Vârsta Minimă:</strong> Platforma și serviciile noastre sunt destinate exclusiv persoanelor care au împlinit vârsta de 18 ani. Nu colectăm și nu procesăm cu bună știință date ale minorilor.
            </p>
          </section>

          <section className="bg-[#12181D]/40 border border-slate-800/80 p-6 md:p-8 rounded-2xl shadow-lg hover:border-[#8ba888]/30 transition-colors">
            <h2 className="text-lg font-black text-white mb-5 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#8ba888]/20 flex items-center justify-center text-[#8ba888] font-black text-sm border border-[#8ba888]/30">2</span>
              Prelucrare Tranzitorie (Fără Stocare)
            </h2>
            <p className="text-sm leading-relaxed text-slate-300 mb-4">
              Pentru a asigura confidențialitatea absolută (în special la modulul OCR), aplicăm următoarele reguli tehnice:
            </p>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex gap-3"><span className="text-[#8ba888]">▹</span> <strong>Procesare Exclusiv în RAM:</strong> Documentele încărcate sunt procesate strict în memoria volatilă pe durata a câteva secunde.</li>
              <li className="flex gap-3"><span className="text-[#8ba888]">▹</span> <strong>Ștergere Automată:</strong> Imediat după generarea documentului, orice fișier sursă sau fotografie cu act de identitate este distrus automat și ireversibil.</li>
              <li className="flex gap-3"><span className="text-[#8ba888]">▹</span> <strong>Fără Baze de Date:</strong> Nu salvăm profiluri ascunse, nu reținem serii de șasiu, CNP-uri sau detalii de tranzacții pe hard disk-urile noastre.</li>
            </ul>
          </section>

          <section className="bg-[#12181D]/40 border border-slate-800/80 p-6 md:p-8 rounded-2xl shadow-lg hover:border-[#8ba888]/30 transition-colors">
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#8ba888]/20 flex items-center justify-center text-[#8ba888] font-black text-sm border border-[#8ba888]/30">3</span>
              Scopul Colectării
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Datele sunt prelucrate strict pentru un singur scop: <strong>facilitarea și automatizarea generării contractelor</strong> solicitate în mod direct de către utilizator. Nu realizăm profilări și nu vindem datele către terți.
            </p>
          </section>

          <section className="bg-[#12181D]/40 border border-slate-800/80 p-6 md:p-8 rounded-2xl shadow-lg hover:border-[#8ba888]/30 transition-colors">
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#8ba888]/20 flex items-center justify-center text-[#8ba888] font-black text-sm border border-[#8ba888]/30">4</span>
              Securitate și Mascarea Log-urilor
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">
              În eventualitatea unei erori tehnice de sistem, datele sensibile (precum CNP sau numere de identificare) sunt cenzurate automat înainte de a fi scrise în fișierele de log, prevenind orice scurgere de informații (Data Masking).
            </p>
          </section>

          <section className="bg-[#12181D]/40 border border-slate-800/80 p-6 md:p-8 rounded-2xl shadow-lg hover:border-[#8ba888]/30 transition-colors">
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#8ba888]/20 flex items-center justify-center text-[#8ba888] font-black text-sm border border-[#8ba888]/30">5</span>
              Drepturile Dumneavoastră și ANSPDCP
            </h2>
            <p className="text-sm leading-relaxed text-slate-300 mb-5">
              Conform GDPR, beneficiați de dreptul la informare, acces, rectificare și ștergere. Având în vedere că datele introduse în formulare nu sunt stocate permanent, ștergerea are loc automat la finalizarea sesiunii de utilizare a platformei.
            </p>
            <p className="text-sm leading-relaxed text-slate-300">
              Dacă considerați că drepturile privind protecția datelor v-au fost încălcate, aveți dreptul de a depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP):
            </p>
            <div className="mt-4">
              <a href="https://www.dataprotection.ro/" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#16221A] border border-[#8ba888]/30 text-[#8ba888] px-4 py-2.5 rounded-lg hover:bg-[#8ba888] hover:text-black transition-colors text-xs font-bold uppercase tracking-wider">
                Site Oficial ANSPDCP
              </a>
            </div>
          </section>
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
            <Link href="/politica-si-confidentialitate" className="hover:text-[#8ba888] transition text-white">Confidențialitate</Link>
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