import './globals.css';
import CookieConsent from './components/CookieConsent';
import GlobalAIAssistant from './components/GlobalAIAssistant';
import Script from 'next/script';
import PwaRegister from './components/PwaRegister'; // Importăm înregistrarea PWA

export const metadata = {
  title: 'ContractSmart | Infrastructură Legală & Contracte B2B',
  description: 'Sistem avansat pentru generarea, validarea și semnarea electronică a contractelor comerciale. Auditare criptografică la standarde europene.',
  themeColor: '#0B0F12',
  manifest: '/manifest.json', // Legătura către manifest
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ContractSmart',
  },
  formatDetection: {
    telephone: false,
  },
};

// Configurație extinsă viewport necesară pentru PWA nativ
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        
        {/* PWA iOS Fallback Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-512x512.png" />
      </head>
      <body className="bg-[#0B0F12] text-slate-200 antialiased relative min-h-screen selection:bg-[#8ba888]/30 selection:text-[#8ba888]" suppressHydrationWarning>
        
        <PwaRegister /> {/* Activatorul aplicației de mobil */}

        {/* FIX PENTRU EROAREA CHUNKLOAD (La update-uri platformă) */}
        <Script id="chunk-error-handler" strategy="beforeInteractive">
          {`
            window.addEventListener('error', function(event) {
              if (event.message && (event.message.includes('Failed to load chunk') || event.message.includes('ChunkLoadError'))) {
                window.location.reload();
              }
            });
          `}
        </Script>

        {/* GOOGLE ANALYTICS 4 - Incarcare Asincrona Optimizata */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-V645FSMJYD`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-V645FSMJYD', {
                page_path: window.location.pathname,
              });
              gtag('config', 'AW-18427625678');
            `,
          }}
        />

        {children}
        
        <CookieConsent />
        <GlobalAIAssistant />
      </body>
    </html>
  );
}