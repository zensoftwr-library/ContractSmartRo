'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutSuccess() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-200 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-[#12181D] border border-slate-800 p-8 rounded-3xl max-w-md shadow-2xl space-y-4">
        <div className="w-16 h-16 bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center text-2xl mx-auto font-bold animate-bounce">✓</div>
        <h1 className="text-2xl font-black text-white tracking-tight">Plată Confirmată!</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Tranzacția a fost procesată cu succes. Creditele sau pachetul tău premium au fost activate în baza de date.
        </p>
        <p className="text-[10px] text-slate-500 font-mono animate-pulse">
          Te redirecționăm automat în dashboard în 5 secunde...
        </p>
        <button onClick={() => router.push('/')} className="w-full bg-[#8ba888] text-[#0B0F12] font-black py-2.5 rounded-xl text-xs transition hover:opacity-90">
          Mergi la Dashboard acum
        </button>
      </div>
    </div>
  );
}