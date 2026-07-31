'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Verificăm dacă utilizatorul a luat deja o decizie
    const consimtamant = localStorage.getItem('cs_cookie_consent');
    if (!consimtamant) {
      setShowBanner(true);
    }
  }, []);

  const acceptaToate = () => {
    localStorage.setItem('cs_cookie_consent', 'accepted');
    setShowBanner(false);
  };

  const refuzaEsentiale = () => {
    localStorage.setItem('cs_cookie_consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 pointer-events-none animate-fadeIn">
      <div className="max-w-4xl mx-auto bg-[#12181D] border border-slate-700 p-5 md:p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-auto">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-white mb-1">Protecția Datelor & Cookie-uri (GDPR)</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Folosim cookie-uri esențiale pentru securizarea sesiunilor (Supabase) și a procesatorului de plăți (LemonSqueezy). Platforma ContractSmart respectă principiul Zero-Data Retention pentru datele tale din formulare. 
            <Link href="/termeni-si-conditii" className="text-[#8ba888] hover:underline ml-1">
              Vezi Politica de Confidențialitate.
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={refuzaEsentiale}
            className="flex-1 md:flex-none px-4 py-2 bg-[#0B0F12] border border-slate-700 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-800 transition"
          >
            Refuză
          </button>
          <button 
            onClick={acceptaToate}
            className="flex-1 md:flex-none px-6 py-2 bg-[#8ba888] text-[#0B0F12] text-xs font-black rounded-xl hover:opacity-90 transition tracking-tight"
          >
            Acceptă Toate
          </button>
        </div>
      </div>
    </div>
  );
}