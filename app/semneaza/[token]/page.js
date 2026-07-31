'use client';
import { useEffect, useRef, useState } from 'react';
import SignaturePad from 'signature_pad';
import QRCode from 'qrcode';

export default function SignPortal({ params }) {
  const token = params.token;
  const canvasRef = useRef(null);
  const sigPadRef = useRef(null);
  const [contract, setContract] = useState(null);
  const [signed, setSigned] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // EFECT PENTRU COLECTARE DATE CONTRACT ȘI INITIALIZARE QR EPC
  useEffect(() => {
    fetch(`/api/get-contract?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setContract(data.contract);
          if (data.contract.status === 'semnat') setSigned(true);
          
          // --- GENERARE AUTOMATĂ QR DE PLATĂ (Standard European EPC) ---
          const iban = (data.contract.prestator_iban || "RO00AAAA0000000000000000").replace(/\s+/g, '');
          const beneficiar = (data.contract.prestator_nume || "Beneficiar").substring(0, 35);
          const suma = parseFloat(data.contract.valoare_totala || 0).toFixed(2);
          
          // Format standard BCD (Bank Customer Data) - EPC QR
          const paymentString = `BCD\n001\n1\nSCT\n\n${beneficiar}\n${iban}\nRON${suma}\n\n\nContract ${token}`;
          
          QRCode.toDataURL(paymentString, {
            margin: 2,
            color: { dark: '#000000', light: '#FFFFFF' }
          }, (err, url) => {
            if (!err) setQrCodeUrl(url);
          });
        }
      }).catch(err => console.error("Eroare incarcare contract live:", err));
  }, [token]);

  // INIȚIALIZARE CANVAS SEMNĂTURĂ OLOGRAFĂ
  useEffect(() => {
    if (canvasRef.current && !signed) {
      const canvas = canvasRef.current;
      sigPadRef.current = new SignaturePad(canvas, {
        penColor: '#000000',
        backgroundColor: 'rgba(255,255,255,0)'
      });
    }
  }, [signed, contract]);

  const handleClear = () => {
    if (sigPadRef.current) sigPadRef.current.clear();
  };

  const handleSign = async () => {
    if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
      alert("Te rugăm să semnezi documentul înainte de confirmare.");
      return;
    }
    
    setIsSubmitting(true);
    const signatureBase64 = sigPadRef.current.toDataURL('image/png');

    try {
      const res = await fetch('/api/submit-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, signature: signatureBase64 })
      });
      const data = await res.json();
      
      if (data.success) {
        setSigned(true);
      } else {
        alert(data.message || "Eroare la înregistrarea semnăturii.");
      }
    } catch {
      alert("Eroare de rețea.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!contract) return <div className="p-12 text-center text-slate-500 text-xs">Se încarcă documentul securizat...</div>;

  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-200 flex flex-col items-center py-12 px-4 font-sans">
      <div className="w-full max-w-2xl bg-[#12181D] p-8 rounded-3xl border border-slate-800 shadow-2xl relative">
        
        <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
          <span className="font-black text-white text-sm tracking-tighter uppercase">Document: {token}</span>
          <span className="text-[10px] px-3 py-1 rounded-full bg-[#16221A] text-[#8ba888] border border-[#8ba888]/20 font-bold uppercase">Securizat Criptografic</span>
        </div>

        <div className="text-xs space-y-4 text-slate-300 leading-relaxed mb-8">
          <h2 className="text-lg font-black text-white text-center mb-6 uppercase">Contract de {contract.tip_contract || 'Prestări Servicii'}</h2>
          <p>Subsemnatul, <strong>{contract.prestator_nume}</strong>, în calitate de Prestator, și <strong>{contract.client_nume}</strong>, în calitate de Beneficiar, am convenit la executarea serviciilor de: <em>{contract.obiect_contract}</em>.</p>
          <p>Suma totală agreată: <strong className="text-white">{contract.valoare_totala} RON</strong>.</p>
        </div>

        {/* WIDGET QR DE PLATĂ (STANDARDIZAT EPC) */}
        <div className="bg-[#0B0F12] p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 shadow-inner">
          <div className="flex-1">
            <h4 className="text-xs font-bold text-[#8ba888] uppercase tracking-wider mb-1">Plată Rapidă Bancară (Standard EPC)</h4>
            <p className="text-[10px] text-slate-500">Scanează codul QR cu aplicația băncii tale pentru plata instantă.</p>
          </div>
          {qrCodeUrl && (
            <div className="bg-white p-2 rounded-xl flex-shrink-0 shadow-lg border-4 border-[#8ba888]">
              <img src={qrCodeUrl} alt="QR Plată EPC" className="w-24 h-24" />
            </div>
          )}
        </div>

        {/* ZONA SEMNĂTURĂ */}
        <div className="pt-6 border-t border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 block mb-3 uppercase tracking-widest text-center">Consimțământ prin Semnătură Grafică</span>
          
          {signed ? (
            <div className="p-5 bg-[#16221A] text-[#8ba888] border border-[#8ba888]/20 text-center font-bold text-xs rounded-2xl">
              DOCUMENT SEMNAT ȘI VALIDAT DIGITAL.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border border-slate-700 bg-white rounded-2xl overflow-hidden shadow-inner">
                <canvas ref={canvasRef} className="w-full h-[180px] cursor-crosshair touch-none" />
              </div>
              <div className="flex justify-between items-center">
                <button type="button" onClick={handleClear} className="text-[10px] text-slate-500 font-bold uppercase hover:text-white transition">Șterge</button>
                <button onClick={handleSign} disabled={isSubmitting} className="bg-[#8ba888] text-[#0B0F12] font-black px-6 py-3 rounded-xl text-xs uppercase hover:opacity-90 transition">
                  {isSubmitting ? 'Se procesează...' : 'Confirmă și Semnează'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}