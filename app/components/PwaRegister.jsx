'use client';
import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Am scos listener-ul de 'load' ca să se înregistreze instant la prima randare
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('PWA Service Worker înregistrat cu succes. Scope:', registration.scope);
        })
        .catch((err) => {
          console.error('Eroare la înregistrarea PWA Service Worker:', err);
        });
    }
  }, []);

  return null;
}