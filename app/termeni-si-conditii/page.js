'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function TermeniSiConditii() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollPercent(window.scrollY / totalHeight);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className="min-h-screen bg-[#0B0F12] text-slate-200 font-sans relative overflow-clip selection:bg-[#8ba888]/30 selection:text-[#8ba888]"
      style={{
        '--scroll-y': `${scrollPercent * 100}%`,
      }}
    >

      <Navbar />

            {/* PREMIUM CINEMATIC LIGHT LEAKS (BACKGROUND) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[5%] left-[50%] transform -translate-x-1/2 w-[90vw] h-[90vw] min-w-[800px] min-h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139, 168, 136, 0.04) 0%, rgba(11, 15, 18, 0) 60%)' }} />
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
            Document Legal Actualizat 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter mb-5">
            Termeni și Condiții de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ba888] to-emerald-400">Utilizare</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Prin accesarea, navigarea și utilizarea funcțiilor platformei ContractSmart (operată de ZenSoftWare), confirmați că <strong>aveți vârsta minimă de 18 ani împliniți</strong>, aveți capacitate deplină de exercițiu și ați acceptat în mod expres prevederile prezentului document.
          </p>
        </div>

        {/* CONTINUT ARTICOLE (Stilizate ca Premium Cards) */}
        <div className="space-y-8 text-sm text-slate-300 leading-relaxed font-light">

          {/* 1. DISCLAIMER LEGAL */}
          <section className="bg-gradient-to-b from-red-900/10 to-[#12181D]/40 border border-red-500/20 p-6 md:p-8 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-2xl rounded-full"></div>
            <h2 className="text-xl md:text-2xl font-black text-white mb-5 flex items-center gap-3 relative z-10">
              <span className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 font-black text-sm border border-red-500/30">1</span>
              Disclaimer Legal Major
            </h2>
            <div className="relative z-10 space-y-4">
              <p>
                <strong className="text-red-400 font-bold">ATENȚIE: Platforma ContractSmart NU este o casă de avocatură, un birou notarial sau o firmă de consultanță juridică/fiscală.</strong> Platforma operează ca o soluție de tip <span className="italic">Software-as-a-Service (SaaS)</span> care pune la dispoziția utilizatorilor șabloane dinamice și instrumente automate de audit.
              </p>
              <ul className="list-disc pl-5 space-y-3 text-slate-400">
                <li>Rapoartele de risc generate de modulul <strong className="text-white">AI Contract Review</strong> au caracter pur informativ și tehnic, bazat pe inteligență artificială, neconstituind consultanță juridică oficială.</li>
                <li>Documentele generate sau auditate <strong className="text-white">trebuie revizuite obligatoriu de către un avocat sau consilier juridic</strong> înainte de orice decizie comercială sau semnare.</li>
                <li>Compania ZenSoftWare nu răspunde pentru daune financiare, litigii, amenzi, anularea tranzacțiilor, recalificări fiscale (ANAF) sau alte prejudicii rezultate din utilizarea documentelor, rapoartelor AI sau validărilor fiscale de pe platformă.</li>
              </ul>
            </div>
          </section>

          {/* 2. DESCRIEREA SERVICIILOR */}
          <section className="bg-[#12181D]/40 border border-slate-800/80 p-6 md:p-8 rounded-2xl shadow-lg hover:border-[#8ba888]/30 transition-colors">
            <h2 className="text-xl md:text-2xl font-black text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#8ba888]/20 flex items-center justify-center text-[#8ba888] font-black text-sm border border-[#8ba888]/30">2</span>
              Descrierea Serviciilor și Funcționalităților
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-[#0B0F12] p-5 rounded-xl border border-slate-800/60 transition-colors hover:border-[#8ba888]/20">
                <h3 className="text-[#8ba888] font-bold text-xs uppercase tracking-wider mb-2">2.1. Generatoare Contracte</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Platforma permite generarea de acte juridice bazate pe input-ul utilizatorului. Utilizatorul poartă răspunderea exclusivă pentru datele introduse. Validitatea juridică a semnăturii electronice simple depinde exclusiv de voința părților.
                </p>
              </div>

              <div className="bg-[#0B0F12] p-5 rounded-xl border border-slate-800/60 transition-colors hover:border-[#8ba888]/20">
                <h3 className="text-[#8ba888] font-bold text-xs uppercase tracking-wider mb-2">2.2. Rapoarte & Validare ANAF</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Interogările stării fiscale se fac prin surse publice. Alertele de pre-semnare au rol de prevenție. Nu garantăm acuratețea 100% în timp real a stării fiscale afișate de bazele de date administrative.
                </p>
              </div>

              <div className="bg-[#0B0F12] p-5 rounded-xl border border-slate-800/60 transition-colors hover:border-[#8ba888]/20">
                <h3 className="text-[#8ba888] font-bold text-xs uppercase tracking-wider mb-2">2.3. AI Contract Review (Audit)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Scanarea și evaluarea clauzelor externe folosesc modele generative avansate. Algoritmul poate prezenta erori de interpretare contextuală. Utilizatorul are obligația de a verifica manual toate clauzele semnalate ca toxice.
                </p>
              </div>

              <div className="bg-[#0B0F12] p-5 rounded-xl border border-slate-800/60 transition-colors hover:border-[#8ba888]/20">
                <h3 className="text-[#8ba888] font-bold text-xs uppercase tracking-wider mb-2">2.4. Smart Vault (SHA-256)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sistemul generează amprente criptografice unice (hash SHA-256) pentru documentele generate. Portalul public de verificare confirmă exclusiv identitatea matematică a amprentei stocate în baza noastră de date.
                </p>
              </div>
            </div>
          </section>

          {/* 3. PLATI SI RAMBURSARI - ACTUALIZAT CU CLAUZA OUG 34/2014 */}
          <section className="bg-[#12181D]/40 border border-slate-800/80 p-6 md:p-8 rounded-2xl shadow-lg hover:border-[#8ba888]/30 transition-colors">
            <h2 className="text-xl md:text-2xl font-black text-white mb-5 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#8ba888]/20 flex items-center justify-center text-[#8ba888] font-black text-sm border border-[#8ba888]/30">3</span>
              Plăți, Conținut Digital și Rambursări
            </h2>
            <p className="mb-4">
              ContractSmart folosește procesatorul extern securizat <strong>Gumroad</strong> pentru gestionarea tranzacțiilor și <strong>Supabase</strong> pentru infrastructura de autentificare.
            </p>
            <ul className="list-disc pl-5 space-y-3 text-slate-400">
              <li><strong className="text-white">Abonamentul PRO:</strong> Reprezintă o facturare recurentă (lunară/anuală). Puteți anula reînnoirea oricând din contul Gumroad.</li>
              <li><strong className="text-white">Membru Fondator (Lifetime):</strong> Reprezintă o plată unică ce garantează accesul pe durata de viață a platformei.</li>
              <li className="bg-red-900/10 p-4 rounded-xl border border-red-500/20 mt-3 shadow-inner">
                <strong className="text-red-400 block mb-1">Politică Strictă: Renunțarea la Dreptul de Retragere</strong> 
                Conform <strong className="text-white">OUG 34/2014, art. 16, lit. m)</strong>, privind exceptările de la dreptul de retragere pentru furnizarea de conținut digital, <strong className="text-white">prin bifarea acordului și generarea/descărcarea documentelor finale (PDF/ZIP)</strong>, vă exprimați acordul prealabil expres pentru începerea prestării și confirmați că <strong className="text-white">vă pierdeți dreptul legal de retragere de 14 zile.</strong> Deoarece serviciile noastre constau în livrarea instantanee a fișierelor digitale, toate vânzările sunt finale (No Refunds).
              </li>
            </ul>
          </section>

          {/* 4. ANTI-SPAM */}
          <section className="bg-gradient-to-br from-[#12181D]/40 to-[#16221A]/80 border border-slate-800/80 p-6 md:p-8 rounded-2xl shadow-lg hover:border-emerald-500/30 transition-colors">
            <h2 className="text-xl md:text-2xl font-black text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-sm border border-emerald-500/30">4</span>
              Politica Anti-Spam și Securitate
            </h2>
            <p className="text-sm text-slate-300">
              Platforma este protejată de tehnologia <strong>Cloudflare Turnstile</strong> și sisteme avansate de limitare a ratei de cereri (Rate Limiting). Orice tentativă de:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-sm text-slate-400">
              <li>Inginerie inversă, decriptare sau "scraping" asupra API-urilor platformei.</li>
              <li>Generare abuzivă și automatizată de documente prin scripturi, boți sau programe neautorizate.</li>
              <li>Vânzarea/revânzarea conturilor de tip PRO sau Founder către alte companii.</li>
            </ul>
            <p className="text-sm mt-4 text-red-400 bg-red-900/10 p-3 rounded-lg border border-red-500/20 font-medium">
              ... va atrage suspendarea imediată, definitivă și fără notificare prealabilă a contului, alături de blocarea adresei IP, fără drept de rambursare.
            </p>
          </section>

          {/* 5. GDPR */}
          <section className="bg-[#12181D]/40 border border-slate-800/80 p-6 md:p-8 rounded-2xl shadow-lg hover:border-[#8ba888]/30 transition-colors">
            <h2 className="text-xl md:text-2xl font-black text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#8ba888]/20 flex items-center justify-center text-[#8ba888] font-black text-sm border border-[#8ba888]/30">5</span>
              Protecția Datelor Personale (GDPR)
            </h2>
            <p className="text-slate-400">
              Prezentele clauze se completează cu Politica de Confidențialitate. Colectăm strict datele necesare generării documentelor și facturării. Responsabilitatea introducerii datelor terților (Cumpărători Auto, Clienți B2B) cade exclusiv în sarcina utilizatorului platformei, acesta având calitatea de Operator de Date față de clienții săi.
            </p>
          </section>

          {/* 6. IP & FORTA MAJORA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-[#12181D]/40 border border-slate-800/80 p-6 rounded-2xl shadow-lg hover:border-[#8ba888]/30 transition-colors">
              <h2 className="text-lg font-black text-white mb-4 flex items-center gap-3">
                <span className="text-[#8ba888] font-mono">06.</span> Proprietate Intelectuală
              </h2>
              <p className="text-xs text-slate-400">
                Codul sursă al platformei, design-ul UI/UX, arhitectura de organizare a clauzelor și logo-ul sunt protejate prin legile drepturilor de autor. Crearea de lucrări derivate din șabloanele noastre atrage răspunderea penală și civilă.
              </p>
            </section>

            <section className="bg-[#12181D]/40 border border-slate-800/80 p-6 rounded-2xl shadow-lg hover:border-[#8ba888]/30 transition-colors">
              <h2 className="text-lg font-black text-white mb-4 flex items-center gap-3">
                <span className="text-[#8ba888] font-mono">07.</span> Forță Majoră
              </h2>
              <p className="text-xs text-slate-400">
                ZenSoftWare nu va fi trasă la răspundere pentru întârzieri rezultate din cauze independente (căderi servere cloud/Supabase/Gumroad, întreruperea API-urilor statului român - ex: ONRC/ANAF).
              </p>
            </section>
          </div>

          {/* 8. SOLUȚIONAREA LITIGIILOR & ANPC (SECȚIUNE NOUĂ OBLIGATORIE) */}
          <section className="bg-[#12181D]/40 border border-slate-800/80 p-6 md:p-8 rounded-2xl shadow-lg hover:border-[#8ba888]/30 transition-colors">
            <h2 className="text-xl md:text-2xl font-black text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#8ba888]/20 flex items-center justify-center text-[#8ba888] font-black text-sm border border-[#8ba888]/30">8</span>
              Soluționarea Litigiilor și ANPC
            </h2>
            <p className="text-slate-400 leading-relaxed mb-5">
              Orice dispută rezultată din utilizarea platformei va fi soluționată pe cale amiabilă. În caz contrar, litigiile vor fi deduse instanțelor judecătorești competente. Pentru soluționarea alternativă a litigiilor (SAL/SOL), aveți la dispoziție următoarele platforme oficiale:
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="https://anpc.ro/" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#16221A] border border-[#8ba888]/30 text-[#8ba888] px-4 py-2.5 rounded-lg hover:bg-[#8ba888] hover:text-black transition-colors text-xs font-bold uppercase tracking-wider">
                Site Oficial ANPC
              </a>
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#16221A] border border-[#8ba888]/30 text-[#8ba888] px-4 py-2.5 rounded-lg hover:bg-[#8ba888] hover:text-black transition-colors text-xs font-bold uppercase tracking-wider">
                Platforma SOL (UE)
              </a>
            </div>
          </section>

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
            <Link href="/termeni-si-conditii" className="hover:text-[#8ba888] transition text-white">Termeni și Condiții</Link>
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