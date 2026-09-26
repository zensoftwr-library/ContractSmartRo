'use client';
import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(
          function (registration) {
            console.log('PWA Service Worker înregistrat cu succes. Scope:', registration.scope);
          },
          function (err) {
            console.error('Eroare la înregistrarea PWA Service Worker:', err);
          }
        );
      });
    }
  }, []);

  return null; // Este o componentă de sistem, nu randează nimic vizual
}