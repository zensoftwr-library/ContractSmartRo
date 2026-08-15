'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

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
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#0B0F12]/90 border-b border-slate-800 py-4 px-6 shadow-md transition-all">
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
          <Link href="/" className="w-[180px] h-[30px] flex items-center cursor-pointer">
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
          
          <button 
            className="md:hidden text-[#8ba888] text-2xl focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>

          <div className="hidden md:flex items-center space-x-5">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition">Acasă</Link>
            <span className="text-slate-800">|</span>
            <Link href="/modele-contracte" className="text-xs text-slate-400 hover:text-white transition">Modele Contracte Standard</Link>
            <span className="text-slate-800">|</span>
            <Link href="/baza-legala" className="text-xs text-slate-400 hover:text-white transition">Articole Validitate Juridică</Link>
            <span className="text-slate-800">|</span>
            <Link href="/termeni-si-conditii" className="text-xs text-white font-bold transition">Termeni și Condiții</Link>
            <span className="text-slate-800">|</span>
            <Link href="/contact" className="text-xs text-slate-400 hover:text-white transition">Contact</Link>
          </div>
        </div>
        
        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="md:hidden flex flex-col space-y-4 pt-4 mt-4 border-t border-slate-800 animate-fadeIn px-4">
            <Link href="/" className="text-sm text-slate-300 hover:text-white">Acasă</Link>
            <Link href="/modele-contracte" className="text-sm text-slate-300 hover:text-white">Modele Contracte Standard</Link>
            <Link href="/baza-legala" className="text-sm text-slate-300 hover:text-white">Articole Validitate Juridică</Link>
            <Link href="/termeni-si-conditii" className="text-sm text-[#8ba888] font-bold">Termeni și Condiții</Link>
            <Link href="/contact" className="text-sm text-slate-300 hover:text-white">Contact</Link>
          </div>
        )}
      </nav>

      {/* PREMIUM CINEMATIC LIGHT LEAKS (BACKGROUND) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[50%] transform -translate-x-1/2 w-[80vw] h-[80vw] min-w-[800px] min-h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139, 168, 136, 0.05) 0%, rgba(11, 15, 18, 0) 70%)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        
        {/* HEADER PAGE */}
        <div className="text-center mb-16 border-b border-slate-800/80 pb-10">
          <span className="inline-block bg-[#16221A] text-[#8ba888] border border-[#8ba888]/20 text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase mb-6">
            Document Legal Actualizat 2026
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter mb-4">
            Termeni și Condiții de <span className="text-[#8ba888]">Utilizare</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Prin accesarea, navigarea și utilizarea funcțiilor platformei ContractSmart (operată de ZenSoftWare), confirmați că ați citit, înțeles și acceptat în mod expres și neechivoc prevederile prezentului document.
          </p>
        </div>

        {/* CONTINUT ARTICOLE */}
        <div className="space-y-12 text-sm text-slate-300 leading-relaxed font-light">

          <section className="bg-[#12181D] border border-slate-800/80 p-8 rounded-2xl shadow-xl hover:border-[#8ba888]/30 transition-colors">
            <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
              <span className="text-[#8ba888]">1.</span> Disclaimer Legal Major (Absolvirea de Răspundere)
            </h2>
            <p className="mb-4">
              <strong className="text-red-400 font-bold">ATENȚIE: Platforma ContractSmart NU este o casă de avocatură, un birou notarial sau o firmă de consultanță juridică/fiscală.</strong> Platforma operează ca o soluție de tip <span className="italic">Software-as-a-Service (SaaS)</span> care pune la dispoziția utilizatorilor șabloane dinamice (B2B, auto, NDA, etc.) cu un grad înalt de automatizare.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>Documentele generate reprezintă puncte de plecare (draft-uri) bazate pe legislația generală (Codul Civil Român), însă <strong className="text-white">nu garantează</strong> acoperirea tuturor spețelor individuale sau modificărilor legislative de ultimă oră.</li>
              <li>Orice document generat, inclusiv pachetele de vânzare auto (DITL) sau contractele cu clauze de securizare (mega-QR, anti-inflație), <strong className="text-white">trebuie revizuit obligatoriu de către un avocat sau un consilier juridic</strong> înainte de semnare.</li>
              <li>Compania ZenSoftWare (operatorul ContractSmart) nu răspunde pentru daune financiare, litigii, amenzi, anularea tranzacțiilor, recalificări fiscale (ANAF) sau alte prejudicii rezultate din utilizarea documentelor sau rapoartelor financiare generate pe această platformă.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white mb-4 border-b border-slate-800 pb-2">2. Descrierea Serviciilor și Funcționalităților</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="bg-[#12181D] p-5 rounded-xl border border-slate-800">
                <h3 className="text-[#8ba888] font-bold text-sm uppercase tracking-wider mb-2">2.1. Generatoare de Contracte (B2B & Auto)</h3>
                <p className="text-[11px] text-slate-400">
                  Platforma permite generarea de acte juridice bazate pe input-ul utilizatorului. Utilizatorul poartă răspunderea exclusivă pentru datele introduse (CUI, CNP, sume, valute). Opțiunile de decupare a semnăturii (desen/upload) sunt oferite cu titlu de facilitate grafică; validitatea juridică a semnăturii electronice simple depinde exclusiv de voința părților.
                </p>
              </div>

              <div className="bg-[#12181D] p-5 rounded-xl border border-slate-800">
                <h3 className="text-[#8ba888] font-bold text-sm uppercase tracking-wider mb-2">2.2. Rapoarte Fiscale ANAF</h3>
                <p className="text-[11px] text-slate-400">
                  Rapoartele financiare și bulinele de risc (roșu/verde) sunt extrase prin interogarea unor surse publice (inclusiv API-uri terțe). Nu garantăm acuratețea 100% în timp real a datoriilor, bilanțurilor sau stării fiscale a companiilor. Aceste rapoarte au strict un caracter informativ.
                </p>
              </div>

              <div className="bg-[#12181D] p-5 rounded-xl border border-slate-800">
                <h3 className="text-[#8ba888] font-bold text-sm uppercase tracking-wider mb-2">2.3. Funcția OCR (Inteligență Artificială)</h3>
                <p className="text-[11px] text-slate-400">
                  Scanarea documentelor (CIV, Talon, C.I.) prin camera foto folosește algoritmi AI de extragere a textului. Ne rezervăm dreptul la o marjă de eroare tehnică. <strong className="text-white">Este obligația dumneavoastră să verificați datele extrase</strong> înainte de generarea PDF-urilor (ex: seria de șasiu, CNP-ul). Imaginiile încărcate pentru OCR sunt procesate efemer și nu sunt stocate în baza noastră de date pe termen lung, respectând normele GDPR.
                </p>
              </div>

              <div className="bg-[#12181D] p-5 rounded-xl border border-slate-800">
                <h3 className="text-[#8ba888] font-bold text-sm uppercase tracking-wider mb-2">2.4. ContractSmart QR ProStudio</h3>
                <p className="text-[11px] text-slate-400">
                  Abonamentele premium permit generarea de QR-uri dinamice, smart OS, geo-targeted și găzduire PDF în infrastructura Supabase. Ne rezervăm dreptul de a dezactiva/șterge codurile QR care redirecționează către conținut ilegal, malițios, phishing sau care încalcă legislația națională/internațională.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4 pt-6">
            <h2 className="text-2xl font-black text-white mb-4 border-b border-slate-800 pb-2">3. Conturi, Plăți și Rambursări (Refund Policy)</h2>
            <p className="mb-2">
              ContractSmart folosește procesatorul extern securizat <strong>Gumroad</strong> pentru gestionarea tranzacțiilor (card bancar / PayPal) și <strong>Supabase</strong> pentru infrastructura de autentificare.
            </p>
            <ul className="list-disc pl-5 space-y-3 text-slate-400">
              <li><strong className="text-white">Abonamentul PRO:</strong> Reprezintă o facturare recurentă (lunară/anuală). Puteți anula reînnoirea oricând din contul dumneavoastră Gumroad primit pe email.</li>
              <li><strong className="text-white">Membru Fondator (Lifetime):</strong> Reprezintă o plată unică ce garantează accesul pe durata de viață a platformei ContractSmart. </li>
              <li><strong className="text-amber-500">Politică Strictă de Rambursare:</strong> Deoarece serviciile noastre constau în livrarea de bunuri digitale instantanee (PDF-uri, arhive ZIP cu acte auto, rapoarte financiare detaliate), <strong className="text-white">ne rezervăm dreptul de a refuza rambursarea sumelor (No Refunds)</strong> imediat ce produsul a fost descărcat cu succes de către utilizator. Problemele tehnice excepționale vor fi soluționate prin suport direct.</li>
            </ul>
          </section>

          <section className="bg-[#16221A] p-6 rounded-xl border border-[#8ba888]/20">
            <h2 className="text-xl font-black text-[#8ba888] mb-3">4. Politica Anti-Spam și Protecția Sistemelor</h2>
            <p className="text-sm">
              Platforma este protejată de tehnologia <strong>Cloudflare Turnstile</strong> și sisteme avansate de limitare a ratei de cereri (Rate Limiting). Orice tentativă de:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-slate-400">
              <li>Inginerie inversă, decriptare sau "scraping" asupra API-urilor platformei (inclusiv API-urile de rapoarte ANAF).</li>
              <li>Generare abuzivă și automatizată de documente prin scripturi, boți sau programe neautorizate.</li>
              <li>Vânzarea/revânzarea conturilor de tip PRO sau Founder către alte companii.</li>
            </ul>
            <p className="text-sm mt-3">
              ... va atrage <strong className="text-red-400">suspendarea imediată, definitivă și fără notificare prealabilă a contului</strong>, alături de blocarea adresei IP, fără drept de rambursare.
            </p>
          </section>

          <section className="space-y-4 pt-6">
            <h2 className="text-2xl font-black text-white mb-4 border-b border-slate-800 pb-2">5. Protecția Datelor cu Caracter Personal (GDPR)</h2>
            <p>
              Prezentele clauze se completează cu Politica de Confidențialitate. Colectăm strict datele necesare generării documentelor și facturării. Adresele de email, CNP-urile și datele auto (VIN) introduse în formulare sunt procesate pentru obținerea rezultatului final. Responsabilitatea introducerii datelor terților (ex: datele cumpărătorului auto sau datele clienților din contractele B2B) cade exclusiv în sarcina utilizatorului platformei, acesta având calitatea de Operator de Date față de clienții săi.
            </p>
          </section>

          <section className="space-y-4 pt-6">
            <h2 className="text-2xl font-black text-white mb-4 border-b border-slate-800 pb-2">6. Proprietate Intelectuală</h2>
            <p>
              Codul sursă al platformei, design-ul UI/UX, arhitectura de organizare a clauzelor, logo-ul ContractSmart și ZenSoftWare sunt protejate prin legile drepturilor de autor. Copierea, reproducerea, decompilarea sau crearea de lucrări derivate din șabloanele noastre pentru a construi platforme concurente este strict interzisă și atrage răspunderea penală și civilă.
            </p>
          </section>

          <section className="space-y-4 pt-6">
            <h2 className="text-2xl font-black text-white mb-4 border-b border-slate-800 pb-2">7. Forța Majoră și Modificarea Termenilor</h2>
            <p>
              ZenSoftWare nu va fi trasă la răspundere pentru nicio întârziere sau neîndeplinire a obligațiilor rezultată din cauze ce scapă de sub controlul său rezonabil (căderi ale serverelor cloud/Supabase/Gumroad, atacuri cibernetice de mare amploare, întreruperea API-urilor statului român - ex: ONRC / ANAF).
            </p>
            <p>
              Ne rezervăm dreptul de a modifica acești Termeni și Condiții în orice moment, fără notificare prealabilă, versiunea actualizată fiind vizibilă mereu pe această pagină. Continuarea utilizării platformei reprezintă acceptul noilor termeni.
            </p>
          </section>

        </div>
      </div>

      {/* FOOTER STANDARD PLATFORMA */}
      <footer className="relative z-10 border-t border-slate-800 bg-[#0B0F12] pt-12 pb-8 mt-16 text-center">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          <div className="flex justify-center">
            <Link href="/" className="w-[180px] h-[30px] cursor-pointer block">
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
            <Link href="/modele-contracte" className="hover:text-[#8ba888] transition">Modele Standard</Link>
            <span>•</span>
            <Link href="/termeni-si-conditii" className="hover:text-[#8ba888] transition text-white">Termeni și Condiții</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-[#8ba888] transition">Contact</Link>
          </div>
          <div className="pt-6 border-t border-slate-800/40 flex flex-col items-center gap-4">
            <p className="text-[10px] text-slate-500 font-mono max-w-3xl text-center leading-relaxed px-4">
              <strong className="text-red-500">Disclaimer Legal!</strong> <strong className="text-[#8ba888]">ContractSmart</strong> este o platformă de software. <strong className="text-red-500">NU</strong> suntem o casă de avocatură și nu oferim consultanță juridică. Utilizarea platformei reprezintă acceptarea faptului că modelele generate necesită revizuirea de către un specialist.
            </p>
            <p className="text-[11px] text-slate-500 font-mono">© 2026 <strong className="text-[#8ba888]">ContractSmart</strong>. Powered by <strong className="text-[#8ba888]">ZenSoftWare</strong>. Toate drepturile rezervate legal.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}