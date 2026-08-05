import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function LandingPage({ params }) {
  const { id } = params;

  const { data: qr, error } = await supabase.from('qr_codes').select('*').eq('id', id).single();

  if (error || !qr || qr.type !== 'landing' || !qr.landing_data) {
    notFound();
  }

  const data = typeof qr.landing_data === 'string' ? JSON.parse(qr.landing_data) : qr.landing_data;

  return (
    <div className="min-h-screen bg-[#0B0F12] flex flex-col items-center py-16 px-4 font-sans text-slate-200">
      <div className="w-full max-w-md bg-[#12181D] border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
        
        {data.avatarUrl && (
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-[#8ba888]/30 mb-6 shadow-lg shadow-[#8ba888]/10">
            <img src={data.avatarUrl} alt={data.title} className="w-full h-full object-cover" />
          </div>
        )}

        <h1 className="text-2xl font-black text-white mb-2">{data.title || 'Bine ai venit'}</h1>
        {data.desc && <p className="text-sm text-slate-400 mb-8 leading-relaxed">{data.desc}</p>}

        <div className="space-y-4 w-full">
          {data.links && data.links.map((link, idx) => (
            link.url && link.label && (
              <a 
                key={idx} 
                href={link.url} 
                target="_blank" 
                rel="noreferrer"
                className="block w-full py-3.5 px-4 bg-[#16221A] border border-[#8ba888]/50 hover:bg-[#8ba888] hover:text-[#0B0F12] text-[#8ba888] font-bold rounded-xl transition-all shadow-md"
              >
                {link.label}
              </a>
            )
          ))}
        </div>
      </div>
      
      <a href="https://contractsmart.ro" className="mt-8 text-[10px] text-slate-500 uppercase tracking-wider hover:text-slate-300 transition">
        Securizat & Generat de <strong>ContractSmart</strong>
      </a>
    </div>
  );
}