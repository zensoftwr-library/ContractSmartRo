'use client';
import Link from 'next/link';

export default function TermeniSiConditii() {
  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-300 font-sans py-12 px-6">
      <div className="max-w-4xl mx-auto bg-[#12181D] border border-slate-800 p-8 md:p-12 rounded-2xl shadow-2xl space-y-8">
        
        {/* HEADER */}
        <div className="border-b border-slate-800 pb-6 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Termeni și Condiții de Utilizare</h1>
            <p className="text-xs text-slate-500 mt-1">Platforma Legal-Tech ContractSmart.ro | Ediția Relații Comerciale & Auto 2026</p>
          </div>
          <Link 
            href="/" 
            className="text-xs font-bold text-[#8ba888] hover:text-white transition bg-[#16221A] border border-[#8ba888]/20 px-4 py-2 rounded-xl"
          >
            &larr; Înapoi la Panoul Principal
          </Link>
        </div>

        {/* CONȚINUT REGLEMENTAT INTEGRAL */}
        <div className="space-y-6 text-xs leading-relaxed text-slate-400">
          
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-[#8ba888]">1. Obiectul Platformei și Domeniul de Aplicare</h2>
            <p>
              Platforma <strong>ContractSmart.ro</strong> pune la dispoziția utilizatorilor o infrastructură avansată de automatizare legal-tech destinată generării instanțiale de contracte comerciale (Prestări Servicii, NDA, CDA, Închiriere Imobile, Promisiuni de Vânzare) și simplificării tranzacțiilor din sectorul auto (Generare pachete tipizate Model ITĂ-014 DITL, Procese-Verbale de predare-primire, Cereri DRPCIV și rapoarte tehnice RAR).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-[#8ba888]">2. Protecția Datelor cu Caracter Personal (Arhitectură Unică & Sesiuni Ephemere)</h2>
            <p>
              În conformitate cu Regulamentul European GDPR 2016/679, ContractSmart.ro este conceput după principiul <em>Data Protection by Design</em>. Toate datele cu caracter personal colectate pentru redactarea actelor (Nume, Prenume, CNP, Seri de Buletin, Serii de Șasiu/VIN, Adrese) sunt procesate <strong>exclusiv în memoria volatilă pe durata sesiunii curente</strong>.
            </p>
            <p>
              Sistemul <strong>NU stochează și NU persistă</strong> datele de identificare ale părților în baze de date permanente post-generare. La reîmprospătarea paginii, închiderea browserului sau finalizarea descărcării pachetului documentar (.ZIP/PDF), datele din sesiunea respectivă sunt distruse ireversibil.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-[#8ba888]">3. Specificații Module: Contracte B2B și Tranzacții Auto</h2>
            <p>
              <strong>3.1. Generatorul Comercial B2B:</strong> Permite configurarea clauzelor avansate de asigurare a încasărilor (clauze penale simetrice, suspendare drepturi IP, plafonare revizii, drept de retenție conform Codului Civil).
            </p>
            <p>
              <strong>3.2. Asistentul Automatizat Auto:</strong> Emite integral dosarul constituit din cele 5 exemplare ale contractului oficial de înstrăinare-dobândire (Model ITĂ-014), Procesul-Verbal de exonerare de răspundere (transfer răspundere civilă/contravențională la data și ora exactă), Cererile DRPCIV de radiere/înmatriculare și extrasul din registrul tehnic RAR. Utilizatorul garantează veridicitatea datelor privind starea kilometrajului și opozabilitatea garanției pentru vicii ascunse (Art. 1707 Cod Civil).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-[#8ba888]">4. Interogări Externe (Widgets ANAF & RAR)</h2>
            <p>
              Serviciile de interogare rapidă a stării fiscale a companiilor (ANAF) și a cazierului tehnic/ITP per serie de șasiu (RAR) preiau date publice din registre oficiale. ContractSmart.ro asigură afișarea tehnică a acestora, nefiind răspunzător de eventualele neconcordanțe din bazele de date de stat de proveniență.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-[#8ba888]">5. Exonerare de Răspundere Juridică</h2>
            <p>
              Livrabilele generate automat reprezintă modele profesionale standardizate. ContractSmart.ro nu acordă consultanță juridică sau avocățească individualizată în sensul Legii 51/1995. Responsabilitatea verificării conținutului final al actelor înainte de semnare revine părților contractante.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-[#8ba888]">6. Condiții de Plată și Politică de Returnare</h2>
            <p>
              Plățile pentru pachetele unice, micro-rapoarte sau abonamente se procesează securizat prin intermediul procesatorilor autorizați. Având în vedere livrarea digitală instantanee și compilarea fișierelor binare în timp real, serviciul se consideră complet executat la punerea la dispoziție a link-ului/fișierului de descărcare.
            </p>
          </section>

        </div>

        {/* FOOTER MODAL */}
        <div className="pt-6 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-500 font-mono">
          <span>© 2026 ContractSmart.ro | ZenSoftware</span>
          <span className="text-emerald-500 font-bold">✓ Zero-Data Retention Verified</span>
        </div>

      </div>
    </div>
  );
}