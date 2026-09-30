'use client';
import { useRouter } from 'next/navigation';

export default function CheckoutCancel() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-200 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-[#12181D] border border-slate-800 p-8 rounded-3xl max-w-md shadow-2xl space-y-4">
        <div className="w-16 h-16 bg-red-950/50 border border-red-500/30 text-red-400 rounded-full flex items-center justify-center text-xl mx-auto font-bold">✕</div>
        <h1 className="text-2xl font-black text-white tracking-tight">Plată Anulată</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Sesiunea de plată a fost întreruptă sau cardul a fost respins. Nu ai fost taxat pentru această tranzacție.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <button onClick={() => router.push('/')} className="w-full bg-[#8ba888] text-[#0B0F12] font-black py-2.5 rounded-xl text-xs transition hover:opacity-90">
            Înapoi la Dashboard
          </button>
          <button onClick={() => window.history.back()} className="w-full bg-transparent border border-slate-700 text-slate-400 font-bold py-2.5 rounded-xl text-xs transition hover:text-white hover:border-slate-500">
            Reîncearcă Plata
          </button>
        </div>
      </div>
    </div>
  );
}