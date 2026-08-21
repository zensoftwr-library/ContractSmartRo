'use client';

export default function PricingAddons({ handleCumparaPremium }) {
  return (
    <div className="max-w-6xl mx-auto px-4 mb-20 mt-4">
      <div className="border-t border-slate-800/80 pt-8 pb-4 mb-6 text-center">
        <h3 className="text-xl font-black text-white tracking-tight">Șabloane & Extensii QR <span className="text-[#8ba888] font-bold">(Plată Unică)</span></h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Sablon */}
        <div className="bg-[#12181D]/60 border border-slate-800/80 hover:border-slate-600 rounded-xl p-4 flex flex-col justify-between transition-colors text-center">
          <div>
            <div className="flex justify-center items-center mb-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800/50 px-2 py-0.5 rounded">Document Legal</span>
            </div>
            <h4 className="text-sm font-bold text-white">Șablon Tipizat</h4>
            <div className="text-xl font-black text-white mt-1 mb-2">49 RON <span className="text-[9px] text-slate-500 font-normal">(~9.99 €)</span></div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Contracte PDF standard, gata redactate și verificate juridic.</p>
          </div>
          <button type="button" onClick={() => handleCumparaPremium('sablon_tipizat')} className="w-full bg-[#0B0F12] border border-slate-700 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm">Cumpără 9.99 €</button>
        </div>

        {/* QR Branding */}
        <div className="bg-[#12181D]/60 border border-slate-800/80 hover:border-slate-600 rounded-xl p-4 flex flex-col justify-between transition-colors text-center">
          <div>
            <div className="flex justify-center items-center mb-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800/50 px-2 py-0.5 rounded">Design QR</span>
            </div>
            <h4 className="text-sm font-bold text-white">Pachet Branding</h4>
            <div className="text-xl font-black text-white mt-1 mb-2">49 RON <span className="text-[9px] text-slate-500 font-normal">(~9.99 €)</span></div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Adaugă logo-ul companiei tale în centrul codului QR generat.</p>
          </div>
          <button type="button" onClick={() => handleCumparaPremium('qr_branding')} className="w-full bg-[#0B0F12] border border-slate-700 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm">Cumpără 9.99 €</button>
        </div>

        {/* QR Dynamic */}
        <div className="bg-[#12181D]/60 border border-slate-800/80 hover:border-[#8ba888]/50 rounded-xl p-4 flex flex-col justify-between transition-colors group text-center">
          <div>
            <div className="flex justify-center items-center mb-3">
              <span className="text-[9px] font-bold text-[#8ba888] uppercase tracking-wider bg-[#8ba888]/10 px-2 py-0.5 rounded border border-[#8ba888]/20 transition-colors group-hover:bg-[#8ba888] group-hover:text-black">Sistem QR</span>
            </div>
            <h4 className="text-sm font-bold text-white">QR Dinamic + PDF</h4>
            <div className="text-xl font-black text-[#8ba888] mt-1 mb-2">39 RON <span className="text-[9px] text-slate-500 font-normal">(~7.99 €)</span></div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Schimbă destinația link-ului oricând + Găzduire PDF inclusă.</p>
          </div>
          <button type="button" onClick={() => handleCumparaPremium('qr_dynamic')} className="w-full bg-[#0B0F12] border border-slate-700 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm">Cumpără 7.99 €</button>
        </div>

        {/* QR vCard */}
        <div className="bg-[#12181D]/60 border border-slate-800/80 hover:border-blue-500/50 rounded-xl p-4 flex flex-col justify-between transition-colors group text-center">
          <div>
            <div className="flex justify-center items-center mb-3">
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider bg-blue-900/20 px-2 py-0.5 rounded border border-blue-500/20 transition-colors group-hover:bg-blue-500 group-hover:text-white">Premium QR</span>
            </div>
            <h4 className="text-sm font-bold text-white">vCard Pro</h4>
            <div className="text-xl font-black text-white mt-1 mb-2">69 RON <span className="text-[9px] text-slate-500 font-normal">(~13.99 €)</span></div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Carte de vizită digitală inteligentă cu salvare directă în agendă.</p>
          </div>
          <button type="button" onClick={() => handleCumparaPremium('qr_vcard')} className="w-full bg-[#0B0F12] border border-slate-700 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm">Cumpără 13.99 €</button>
        </div>

      </div>
    </div>
  );
}