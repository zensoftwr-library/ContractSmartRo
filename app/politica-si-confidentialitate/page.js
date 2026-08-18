import Link from 'next/link';

export const metadata = {
  title: 'Politica de Confidențialitate | ContractSmart',
  description: 'Detalii despre prelucrarea tranzitorie a datelor și respectarea normelor GDPR.',
};

export default function PoliticaConfidentialitate() {
  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-300 py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-[#111820] p-8 md:p-12 rounded-lg border border-slate-800 shadow-2xl">
        
        <div className="mb-10 border-b border-slate-800 pb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-wide uppercase">Politica de Confidențialitate</h1>
          <p className="text-[#8ba888] text-sm">Ultima actualizare: {new Date().toLocaleDateString('ro-RO')} | Sistem de Prelucrare Tranzitorie (RAM)</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">
          
          <section>
            <h2 className="text-lg font-bold text-white mb-3 uppercase tracking-wider">1. Principii Generale și Abordare GDPR</h2>
            <p>
              Această Politică de Confidențialitate explică modul în care platforma noastră prelucrează datele cu caracter personal (precum informații din cărți de identitate, certificate de înmatriculare sau date financiare). 
              Ne-am construit arhitectura tehnică pe principiul <strong>„Privacy by Design”</strong>, minimizând riscurile asociate stocării datelor.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3 uppercase tracking-wider">2. Prelucrarea Tranzitorie (Fără Stocare)</h2>
            <p className="mb-3">
              Platforma noastră utilizează un sistem avansat de citire optică a caracterelor (OCR) pentru a automatiza completarea formularelor și generarea contractelor. Pentru a asigura confidențialitatea absolută, aplicăm următoarele reguli tehnice:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li><strong>Procesare Exclusiv în RAM:</strong> Documentele încărcate (poze buletin, talon) sunt procesate strict în memoria volatilă (RAM) a serverului nostru pe durata a câteva secunde.</li>
              <li><strong>Ștergere Automată (Auto-Delete):</strong> Imediat după extragerea textului sau generarea documentului PDF final, orice fișier sursă este distrus automat și ireversibil din sistemele noastre.</li>
              <li><strong>Fără Baze de Date:</strong> Nu salvăm profiluri ascunse ale clienților, nu reținem serii de șasiu, CNP-uri sau adrese pe hard disk-urile noastre.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3 uppercase tracking-wider">3. Scopul Colectării</h2>
            <p>
              Datele sunt prelucrate strict pentru un singur scop: <strong>facilitarea și automatizarea generării contractelor comerciale sau auto</strong> solicitate în mod direct de către utilizator. Nu realizăm profilări (profiling) și nu folosim datele pentru campanii de marketing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3 uppercase tracking-wider">4. Securitatea și Mascarea Log-urilor</h2>
            <p>
              Sistemele noastre de monitorizare a erorilor (Server Logs) sunt configurate să aplice tehnici de <em>Data Masking</em>. Astfel, în eventualitatea unei erori tehnice de sistem, datele sensibile (precum CNP sau numere de identificare) sunt cenzurate automat înainte de a fi scrise în fișierele de log, prevenind orice scurgere de informații.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3 uppercase tracking-wider">5. Drepturile Dumneavoastră</h2>
            <p>
              Conform Regulamentului (UE) 2016/679 (GDPR), beneficiați de dreptul la informare, acces, rectificare, ștergere („dreptul de a fi uitat”), restricționare și opoziție. Având în vedere că datele dumneavoastră nu sunt stocate permanent, exercitarea dreptului de ștergere are loc automat la finalizarea sesiunii de utilizare a platformei.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 text-center">
          <Link href="/" className="inline-block bg-[#16221A] text-[#8ba888] px-6 py-2 rounded border border-[#8ba888]/30 hover:bg-[#8ba888] hover:text-black transition-colors font-bold text-sm uppercase">
            Înapoi la platformă
          </Link>
        </div>
        
      </div>
    </div>
  );
}