import Link from 'next/link';
import { notFound } from 'next/navigation';
import { bibliotecaLegala } from '../bazaLegalaData';

export default async function BazaLegalaArticol({ params }) {
  const { slug } = await params;
  const articol = bibliotecaLegala.find(a => a.slug === slug);

  if (!articol) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-300 font-sans py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/baza-legala" className="text-xs font-bold text-[#8ba888] hover:text-white transition flex items-center gap-2 mb-4">
            &larr; Înapoi la Baza Legală
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            {articol.titlu}
          </h1>
          <div className="flex items-center gap-3 mt-4 text-[11px] font-mono flex-wrap">
            <span className="bg-[#16221A] text-[#8ba888] border border-[#8ba888]/20 px-3 py-1 rounded">
              Domeniu: {articol.categorie}
            </span>
            <span className="text-slate-500 bg-[#12181D] px-3 py-1 rounded border border-slate-800">
              Sursa: {articol.sursa}
            </span>
            <span className="text-slate-500">Validat: 2026</span>
          </div>
        </div>

        <div className="bg-[#12181D] border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
          <div className="absolute top-0 right-8 -mt-3 bg-[#8ba888] text-[#0B0F12] text-[9px] font-black uppercase px-2 py-1 rounded">
            Citat din Lege / Extrase
          </div>
          
          <div className="space-y-6 text-sm leading-relaxed text-slate-300">
            {articol.continut.map((paragraf, index) => (
              <p key={index} className="text-justify">
                {index === 0 ? <strong className="text-white">{paragraf}</strong> : paragraf}
              </p>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800/80">
            <div className="bg-[#0B0F12] border border-amber-900/30 rounded-xl p-4 flex gap-3 items-start">
              <span className="text-xl">⚖️</span>
              <div>
                <h4 className="text-amber-500 text-[10px] font-bold uppercase mb-1 tracking-wider">Notă de aplicabilitate tehnică</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Extrasele juridice prezentate susțin logic funcționarea clauzelor și generarea actelor în platforma ContractSmart. Această pagină are scop informativ și nu substituie o consultație acordată de un avocat în sensul Legii 51/1995.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}