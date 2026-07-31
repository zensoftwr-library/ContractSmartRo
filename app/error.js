'use client';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    fetch('/api/alerta-eroare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        mesaj: error.message, 
        stack: error.stack,
        url: typeof window !== 'undefined' ? window.location.href : ''
      })
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0B0F12] flex flex-col items-center justify-center p-6 text-center text-slate-200">
      <h2 className="text-xl font-bold text-red-500 mb-2">A apărut o problemă tehnică!</h2>
      <p className="text-slate-400 text-sm mb-6">Echipa a fost notificată automat prin e-mail.</p>
      <button 
        onClick={() => reset()} 
        className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition"
      >
        Reîncearcă
      </button>
    </div>
  );
}