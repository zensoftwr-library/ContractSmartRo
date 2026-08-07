'use client';
import Link from 'next/link';

export default function TermeniSiConditii() {
  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-200 font-sans pb-16 relative overflow-clip">
      
      {/* NAVBAR SIMPLIFICAT */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#0B0F12]/90 border-b border-slate-800 py-4 px-6 shadow-lg">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
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
          <div className="hidden md:flex space-x-5">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition">Înapoi la Home</Link>
            <Link href="/contact" className="text-xs text-slate-400 hover:text-white transition">Contact</Link>
          </div>
        </div>
      </nav>

      {/* AMBIENT BLOBS */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-clip">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#8ba888]/5 blur-[100px] transform-gpu top-[10%] left-[15%]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <span className="text-[#8ba888] text-xs font-black uppercase tracking-widest block mb-2">Legal</span>
          <h1 className="text-3xl md:text-4xl font-black text-white">Termeni și Condiții de Utilizare</h1>
          <p className="text-slate-400 text-sm mt-2">Ultima actualizare: August 2026</p>
        </div>

        <div className="bg-[#12181D] border border-slate-800 rounded-xl p-6 md:p-10 shadow-2xl space-y-8 text-sm text-slate-300 leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Introducere</h2>
            <p>
              Prezentul document reprezintă un contract legal între dumneavoastră (în calitate de "Utilizator" sau "Client") și platforma ContractSmart.ro ("Platforma", "noi"). Utilizarea serviciilor noastre de generare contracte, audit fiscal, citire optică a documentelor auto (OCR), soluții Mega-QR Studio și găzduire a fișierelor PDF reprezintă acordul dumneavoastră ferm cu privire la acești termeni.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Descrierea Serviciilor Oferite</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Generatoare de Contracte:</strong> Crearea dinamică a documentelor B2B și a pachetelor de acte auto în format PDF, pe baza inputului utilizatorului.</li>
              <li><strong>Mega-QR Studio:</strong> Crearea de coduri QR dinamice, rute inteligente (Smart OS / Geo-Targeting), găzduire fișiere (Meniuri PDF) și crearea de pagini Micro-Landing.</li>
              <li><strong>Tehnologie AI / OCR:</strong> Platforma oferă funcționalități de citire automată a documentelor auto și consultanță AI. Rezultatele trebuie verificate de utilizator, având rol orientativ.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Plăți, Abonamente și Facturare</h2>
            <p>
              Plățile sunt procesate în siguranță prin intermediul partenerului nostru autorizat, <strong>LemonSqueezy</strong>. Oferim produse cu plată unică (Micro-tranzacții) și abonamente recurente (PRO, Enterprise). Abonamentele se reînnoiesc automat până la anularea explicită din contul utilizatorului. Licența "Membru Fondator" oferă acces pe durata de viață a platformei.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">4. Politica de Retur și Renunțarea la Dreptul de Retragere</h2>
            <p>
              Conform legislației europene și a OUG 34/2014, art. 16, lit. m), <strong>consumatorul își pierde dreptul de retragere (refund)</strong> în cazul furnizării de conținut digital care nu este livrat pe un suport material (cum ar fi descărcarea de PDF-uri, arhive ZIP, generarea de coduri QR, sau activarea instantă a abonamentelor premium). 
            </p>
            <p className="mt-2 text-slate-400">
              Prin plasarea comenzii și inițierea procesului de generare/descărcare a fișierelor sau prin accesarea mediului PRO, <strong>vă exprimați acordul prealabil și asumați explicit faptul că veți pierde dreptul la rambursarea sumei plătite</strong> din cauza naturii digitale și de consum instantaneu a serviciilor ContractSmart. Sumele aferente abonamentelor deja începute nu pot fi rambursate parțial.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Exonerarea de Răspundere Legală (Disclaimer Juridic)</h2>
            <p>
              Șabloanele de contracte și explicațiile asistentului AI oferite de ContractSmart.ro au caracter pur <strong>orientativ și informațional</strong>. Platforma noastră NU oferă consultanță juridică autorizată. Nu ne asumăm răspunderea pentru pierderile financiare, refuzul dosarelor la DITL/RAR sau litigiile rezultate din utilizarea clauzelor generate. Recomandăm revizuirea documentelor complexe de către un avocat înscris în Barou.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Protecția Datelor și a Fișierelor (Storage)</h2>
            <p>
              Fișierele încărcate voluntar de dumneavoastră (ex: Poze de profil pentru landing pages, meniuri PDF pentru QR Dinamic, documente auto scanate) sunt găzduite securizat pe infrastructura cloud Supabase. Ne angajăm să nu folosim aceste fișiere în scopuri terțe. Sunteți unicul responsabil pentru obținerea drepturilor de autor asupra materialelor pe care le încărcați prin intermediul QR Studio.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}