'use client';

export default function BazaLegala() {
  const articole = [
    {
      titlu: "Valoarea Legală a Semnăturii Electronice în România",
      lege: "Legea nr. 455/2001 privind semnătura electronică",
      descriere: "Semnătura electronică extinsă, bazată pe un certificat calificat nesuspendat sau nerevocat la momentul respectiv și generată cu ajutorul unui dispozitiv securizat de creare a semnăturii, este asimilată, în ceea ce privește condițiile și efectele sale, cu înscrisul sub semnătură privată."
    },
    {
      titlu: "Regimul penalităților de întârziere în contractele B2B",
      lege: "Art. 1535 Cod Civil & Legea nr. 72/2013",
      descriere: "În raporturile comerciale dintre profesioniști, dacă debitorul nu plătește datoria la scadență, datorează penalități de întârziere. Procentul acestora poate fi stabilit liber prin clauze contractuale ferme, cu condiția să nu fie abuziv. Platforma noastră utilizează o clauză standard de 0.5% pe zi de întârziere."
    },
    {
      titlu: "Momentul Transferului Drepturilor de Proprietate Intelectuală",
      lege: "Legea nr. 8/1996 privind dreptul de autor și drepturile conexe",
      descriere: "Creațiile software, design-ul sau materialele foto-video sunt protejate automat de la momentul realizării. Transferul drepturilor patrimoniale de autor către client nu se face implicit prin predarea fișierelor, ci poate fi condiționat contractual prin clauza de suspendare până la achitarea integrală a facturilor."
    },
    {
      titlu: "Validitatea clauzei de Aprobare Tacită la livrarea serviciilor",
      lege: "Art. 1240-1242 Cod Civil (Manifestarea voinței)",
      descriere: "Voința de a contracta sau de a recepționa o lucrare poate fi exprimată nu doar explicit, ci și tacit, printr-un comportament care nu lasă nicio îndoială asupra intenției. Stabilirea unui termen contractual de 3 zile pentru obiecții reprezintă un mecanism perfect legal de securizare a recepției."
    },
    {
      titlu: "Obligativitatea e-Factura și integrarea API cu SmartBill",
      lege: "OUG nr. 120/2021 & Modificările Fiscale Codul Fiscal",
      descriere: "Toate facturile emise în relațiile B2B între companii românești trebuie transmise obligatoriu în sistemul RO e-Factura în termen de 5 zile calendaristice. Automatizarea SmartBill implementată în fluxul nostru emite factura de avans instant la semnarea grafică, asigurând conformitatea fiscală automată cu ANAF."
    },
    {
      titlu: "Contractul de Drepturi de Autor (CDA) vs. Prestări Servicii",
      lege: "Art. 30 din Legea nr. 8/1996 & Codul Fiscal",
      descriere: "Contractul de drepturi de autor implică cesiunea exclusivă sau neexclusivă a unei opere de creație intelectuală originală. Din punct de vedere fiscal, acesta beneficiază de o reținere la sursă a impozitului cu o cotă forfetară de cheltuieli de 40%, fiind o alternativă optimă pentru proiectele de copywriting, design sau programare."
    },
    {
      titlu: "Legalitatea Clauzei de Confidențialitate (NDA) și Daunele Interese",
      lege: "Art. 1194 și Art. 200 Cod de Procedură Civilă",
      descriere: "Acordul de confidențialitate (NDA) obligă părțile să nu divulge secretele comerciale sau informațiile tehnice obținute în timpul negocierilor sau executării contractului. Pentru a fi eficient în instanță, un NDA trebuie să specifice clar cuantumul daunelor interese fixe pe care partea în culpă le va plăti automat în caz de încălcare."
    },
    {
      titlu: "Clauza de Split Payment (Plată Eșalonată) și Scadența",
      lege: "Art. 1516 Cod Civil privind Executarea silită a obligațiilor",
      descriere: "Eșalonarea plăților pe tranșe (Avans / Intermediar / Final) protejează prestatorul împotriva insolvenței de facto a clientului. Neplata unei singure tranșe la scadența stabilită contractual dă dreptul legal prestatorului de a suspenda imediat execuția lucrărilor, fără a fi considerat în culpă."
    },
    {
      titlu: "Dreptul de Retenție Directă asupra Livrabilelor sau Codului Sursă",
      lege: "Art. 2495 - Art. 2499 Cod Civil",
      descriere: "Cel care este obligat să execute sau să livreze un bun ori un serviciu poate să îl rețină atât timp cât creditorul nu își execută propria obligație corelativă (de plată). Clauza de retenție din aplicație îți permite legal să oprești livrarea, accesul la servere sau la fișierele finale până când contul bancar reflectă plata."
    },
    {
      titlu: "Valoarea notificărilor prin WhatsApp (Twilio API) în instanță",
      lege: "Art. 266 Cod de Procedură Civilă (Înscrisul pe suport electronic)",
      descriere: "Mesajele electronice, alertele SMS sau notificările automate transmise pe canale oficiale (cum ar fi WhatsApp prin API securizat Twilio) constituie mijloace de probă de tip înscris electronic, dacă reflectă un istoric nemodificabil și pot fi corelate cu numărul de telefon stipulat în contract."
    },
    {
      titlu: "Taxa de Anulare Proiect și Denunțarea Unilaterală",
      lege: "Art. 1276 Cod Civil",
      descriere: "Dacă dreptul de a denunța contractul este recunoscut uneia dintre părți, acesta poate fi exercitat atât timp cât executarea contractului nu a început. În cazul în care execuția a început, activarea clauzei din platformă obligă legal clientul la plata unei taxe de reziliere de 50% din restul contractului rămas pentru blocarea resurselor."
    },
    {
      titlu: "Exonerarea de Răspundere pe Schimbări de Algoritm (Google, Meta, TikTok)",
      lege: "Art. 1351 Cod Civil (Cazul Fortuit și Forța Majoră)",
      descriere: "În contractele de marketing digital și SEO, prestatorul nu poate garanta poziții fixe sau costuri de reclamă neschimbate, deoarece acestea depind de platforme terțe. Clauza de exonerare încadrează modificările bruște de algoritm ca și caz fortuit, eliminând riscul ca prestatorul să fie dat în judecată pentru scăderea traficului organic."
    },
    {
      titlu: "Plafoanele Fiscale 2026 pentru Microîntreprinderi și PFA-uri",
      lege: "Codul Fiscal Român 2026",
      descriere: "Managementul clauzelor trebuie corelat cu formele juridice. Pentru SRL-uri (micro), cota de impozitare este influențată de numărul de angajați, iar depășirea plafonului de TVA (300.000 RON) sau a plafonului de micro obligă trecerea la impozit pe profit. Calculatorul nostru fiscal integrează automat aceste praguri actualizate."
    },
    {
      titlu: "Conformitatea GDPR în colectarea datelor de business",
      lege: "Regulamentul (UE) 2016/679 (GDPR)",
      descriere: "Colectarea CUI-ului, numelui reprezentantului, emailului și numărului de telefon prin widget-urile noastre se face strict în temeiul executării unor măsuri precontractuale sau a unui contract (Art. 6 alin. 1 lit. b din GDPR). Datele sunt criptate și nu sunt înstrăinate către terți."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-200 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Bază Legală & Conformitate Comercială</h1>
          <p className="text-xs text-slate-400 mt-2">Cadrul juridic aplicabil în România pentru anul 2026 privind automatizarea și securizarea tranzacțiilor contractuale.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {articole.map((art, i) => (
            <div key={i} className="bg-[#12181D] p-6 rounded-2xl border border-slate-800 space-y-3 hover:border-slate-700 transition shadow-xl">
              <div className="flex justify-between items-start gap-4">
                <h2 className="text-lg font-bold text-[#8ba888] leading-snug">{art.titlu}</h2>
                <span className="text-[10px] bg-[#16221A] text-slate-500 font-mono px-2 py-0.5 rounded border border-slate-800/60 shrink-0">Art. {i + 1}</span>
              </div>
              <span className="inline-block bg-[#16221A] text-emerald-400 text-[10px] px-2.5 py-0.5 rounded border border-emerald-900 font-mono">{art.lege}</span>
              <p className="text-xs text-slate-400 leading-relaxed">{art.descriere}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}