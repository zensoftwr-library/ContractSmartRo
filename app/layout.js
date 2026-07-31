import './globals.css';
import CookieConsent from './components/CookieConsent';

export const metadata = {
  title: 'ContractSmart Premium - Contracte Digitale Securizate',
  description: 'Serviciu inteligent de generare și semnare contracte anti-țeapă cu audit cryptographic.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <head>
        
      </head>
      <body className="bg-[#0B0F12] text-slate-200 antialiased relative">
        {children}
        
        {/* AICI lipsea componenta care randează banner-ul pe ecran */}
        <CookieConsent />
      </body>
    </html>
  );
}