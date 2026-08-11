import './globals.css';
import CookieConsent from './components/CookieConsent';
import GlobalAIAssistant from './components/GlobalAIAssistant';

export const metadata = {
  title: 'ContractSmart Premium - Contracte Digitale Securizate',
  description: 'Serviciu inteligent de generare și semnare contracte anti-țeapă cu audit cryptographic.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        
      </head>
      <body className="bg-[#0B0F12] text-slate-200 antialiased relative" suppressHydrationWarning>
        {children}
        
        <CookieConsent />
        <GlobalAIAssistant />
      </body>
    </html>
  );
}