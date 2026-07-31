import { dictonarCaenSeo } from '../date-caen';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { cod } = params;
  const date = dictonarCaenSeo[cod];
  
  return {
    title: `Ghid Complet Cod CAEN ${cod} — Taxe și Înființare 2026`,
    description: date ? `Totul despre CAEN ${cod}: ${date.titlu.slice(0, 100)}... Află regimul fiscal și cerințele ONRC.` : `Analiză juridică cod CAEN.`
  };
}

export default function PaginaCodCaen({ params }) {
  const { cod } = params;
  const date = dictonarCaenSeo[cod];

  // Fallback în cazul în care codul nu are un cluster dedicat (generăm automat o pagină tipizată legală)
  const dateAfisare = date || {
    titlu: `Activitate Economică Aliniată Clasificării Naționale Cod ${cod}`,
    descriere: `Ghid structural automat generat pentru clasa de activități ${cod} conform nomenclatorului CAEN Rev. 2 în vigoare în România.`,
    taxe2026: "Supus regimului general al Codului Fiscal 2026: 1% sau 3% la microîntreprinderi SRL, respectiv impunere progresivă în sistem real pentru PFA.",
    recomandare: "Vă recomandăm utilizarea asistentului nostru AI legislativ pentru a simula exact scenariul tău de venituri.",
    autorizatii: "Necesită autorizare standard la Registrul Comerțului în baza declarațiilor pe proprie răspundere.",
    faq: [
      { q: "Este acest cod autorizabil de către persoane fizice?", a: "Majoritatea codurilor CAEN pot fi autorizate ca PFA dacă titularul depune dovada calificării sau studii în domeniu." }
    ]
  };

  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigație */}
        <div className="mb-8">
          <Link href="/baza-legala" className="text-xs text-[#8ba888] hover:underline">
            ← Înapoi la Biblioteca Legala
          </Link>
        </div>

        {/* Titlu Principal */}
        <div className="border-b border-slate-800 pb-6 mb-8">
          <span className="text-xs bg-[#16221A] text-[#8ba888] border border-emerald-950 font-mono px-3 py-1 rounded-full uppercase tracking-wider">
            Registrul Oficial CAEN 2026
          </span>
          <h1 className="text-4xl font-black text-white mt-4 tracking-tight leading-tight">
            Cod CAEN <span className="text-[#8ba888]">{cod}</span>: {dateAfisare.titlu}
          </h1>
        </div>

        {/* Corp Conținut Academic */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-300">
          
          <section className="bg-[#12181D] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-3 border-b border-slate-800 pb-2">📋 Descrierea Oficială a Activității</h2>
            <p>{dateAfisare.descriere}</p>
          </section>

          <section className="bg-[#12181D] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-3 border-b border-slate-800 pb-2">💰 Regim Fiscal & Taxe (Actualizat 2026)</h2>
            <p>{dateAfisare.taxe2026}</p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-[#12181D] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-sm font-bold text-white mb-2 uppercase tracking-wider text-[#8ba888]">⚖️ Recomandare Formă Juridică</h2>
              <p className="text-xs">{dateAfisare.recomandare}</p>
            </section>

            <section className="bg-[#12181D] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-sm font-bold text-white mb-2 uppercase tracking-wider text-[#8ba888]">🏛️ Avize & Autorizații ONRC</h2>
              <p className="text-xs">{dateAfisare.autorizatii}</p>
            </section>
          </div>

          {/* Secțiunea FAQ dinamică structurată pentru îmbunătățirea scorului SEO */}
          <section className="bg-[#12181D] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">❓ Întrebări Frecvente (FAQ)</h2>
            <div className="space-y-4">
              {dateAfisare.faq.map((item, idx) => (
                <div key={idx} className="border-l-2 border-[#8ba888] pl-4 py-1">
                  <h4 className="font-bold text-white text-sm mb-1">{item.q}</h4>
                  <p className="text-xs text-slate-400">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Funnel inteligent propus în strategie */}
          <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-900/30 rounded-2xl p-6 text-center mt-12 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Vrei să înființezi un business pe codul CAEN {cod}?</h3>
            <p className="text-xs text-slate-400 mb-4 max-w-xl mx-auto">Generează-ți instant tot kitul oficial de acte ONRC (Act Constitutiv, Contract de Comodat, Cereri) completat automat în 2 minute prin ContractSmart.</p>
            <Link href="/" className="inline-block bg-[#8ba888] text-[#0B0F12] font-black text-xs px-6 py-3 rounded-xl hover:opacity-90 transition shadow-md">
              Deschide Configuratur ONRC →
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}