import './globals.css';
import CookieConsent from './components/CookieConsent';
import GlobalAIAssistant from './components/GlobalAIAssistant';

export const metadata = {
  title: 'ContractSmart | Infrastructură Legală & Contracte B2B',
  description: 'Sistem avansat pentru generarea, validarea și semnarea electronică a contractelor comerciale. Auditare criptografică la standarde europene.',
  themeColor: '#0B0F12',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro" className="scroll-smooth" suppressHydrationWarning>
      <body className="bg-[#0B0F12] text-slate-200 antialiased relative min-h-screen selection:bg-[#8ba888]/30 selection:text-[#8ba888]" suppressHydrationWarning>
        {children}
        
        <CookieConsent />
        <GlobalAIAssistant />
      </body>
    </html>
  );
}