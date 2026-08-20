import './globals.css';
import CookieConsent from './components/CookieConsent';
import GlobalAIAssistant from './components/GlobalAIAssistant';

export const metadata = {
  title: 'ContractSmart | Infrastructură Legală & Contracte B2B',
  description: 'Sistem avansat pentru generarea, validarea și semnarea electronică a contractelor comerciale. Auditare criptografică la standarde europene.',
  themeColor: '#0B0F12',
};

export default function RootLayout({ children }) {
  // SCHEMA MARKUP PENTRU GOOGLE (SEO)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ContractSmart",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser, iOS, Android",
    "description": "Platformă digitală B2B pentru generarea, validarea și semnarea electronică a contractelor comerciale și auto, actualizată conform Codului Civil Român.",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "19.00",
      "highPrice": "999.00",
      "priceCurrency": "RON"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ZenSoftWare"
    }
  };

  return (
    <html lang="ro" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#0B0F12] text-slate-200 antialiased relative min-h-screen selection:bg-[#8ba888]/30 selection:text-[#8ba888]" suppressHydrationWarning>
        {children}
        
        <CookieConsent />
        <GlobalAIAssistant />
      </body>
    </html>
  );
}