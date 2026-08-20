'use client';
import { useEffect, useRef, useState } from 'react';
import SignaturePad from 'signature_pad';
import QRCode from 'qrcode';
import Link from 'next/link';

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
      alert("Te rugăm să semnezi documentul în chenarul alb înainte de a confirma.");
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
      alert("Eroare de rețea. Te rugăm să verifici conexiunea la internet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ECRAN DE ÎNCĂRCARE
  if (!contract) return (
    <div className="min-h-screen bg-[#0B0F12] flex flex-col items-center justify-center font-sans">
      <div className="w-10 h-10 border-4 border-[#8ba888]/30 border-t-[#8ba888] rounded-full animate-spin mb-4"></div>
      <div className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Se decodează documentul securizat...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-200 font-sans relative overflow-clip selection:bg-[#8ba888]/30 selection:text-[#8ba888]">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[50%] transform -translate-x-1/2 w-[80vw] h-[80vw] min-w-[600px] min-h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139, 168, 136, 0.05) 0%, rgba(11, 15, 18, 0) 70%)' }} />
      </div>

      {/* NAVBAR MINIMALIST */}
      <nav className="relative z-40 backdrop-blur-md bg-[#0B0F12]/80 border-b border-slate-800/80 py-4 px-6 shadow-sm">
        <div className="flex justify-center items-center w-full max-w-7xl mx-auto">
          <div className="w-[160px] h-[26px] flex items-center">
            <svg viewBox="0 0 240 40" className="w-full h-full opacity-80">
              <g transform="translate(0, 2)">
                <path d="M24 6 C15 6, 8 13, 8 22 C8 31, 15 38, 24 38 C31 38, 37 33, 39 27" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round"/>
                <path d="M16 21 L21 26 L32 12" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <text x="48" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="20" fill="#FFFFFF" letterSpacing="-0.5">
                Contract<tspan fill="#8ba888">Smart</tspan>
              </text>
            </svg>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex flex-col items-center py-10 px-4">
        
        {/* CARDUL PRINCIPAL DE SEMNARE */}
        <div className="w-full max-w-2xl bg-[#12181D]/80 backdrop-blur-xl p-6 md:p-10 rounded-3xl border border-slate-800/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden group hover:border-[#8ba888]/30 transition-colors">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-slate-800/60 mb-8 gap-3 sm:gap-0">
            <div>
              <span className="font-mono text-slate-500 text-[10px] uppercase tracking-widest block mb-1">Cod Unic Document</span>
              <span className="font-black text-white text-sm tracking-tighter bg-[#0B0F12] px-3 py-1.5 rounded-lg border border-slate-800 font-mono shadow-inner">{token}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16221A] text-[#8ba888] border border-emerald-900/30 text-[10px] font-black uppercase tracking-widest shadow-sm">
              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>
              Securizat Criptografic
            </div>
          </div>

          <div className="space-y-5 text-sm text-slate-300 leading-relaxed mb-10">
            <h2 className="text-xl md:text-2xl font-black text-white text-center mb-8 uppercase tracking-wide">
              Contract de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ba888] to-emerald-400">{contract.tip_contract || 'Prestări Servicii'}</span>
            </h2>
            
            <div className="bg-[#0B0F12] p-5 rounded-2xl border border-slate-800/60 shadow-inner">
              <p className="mb-3">
                Subsemnatul, <strong className="text-white">{contract.prestator_nume}</strong>, în calitate de Prestator, și <strong className="text-white">{contract.client_nume}</strong>, în calitate de Beneficiar, am convenit la executarea serviciilor de:
              </p>
              <div className="p-4 bg-[#12181D] border border-slate-700/50 rounded-xl text-slate-400 italic mb-4">
                "{contract.obiect_contract}"
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Suma Totală Agreată:</span>
                <span className="text-xl font-black text-white">{contract.valoare_totala} <span className="text-sm text-[#8ba888]">RON</span></span>
              </div>
            </div>
          </div>

          {/* WIDGET QR DE PLATĂ (STANDARDIZAT EPC) */}
          {qrCodeUrl && (
            <div className="bg-gradient-to-r from-[#0B0F12] to-[#12181D] p-6 rounded-2xl border border-slate-700/60 flex flex-col md:flex-row items-center justify-between gap-6 mb-10 shadow-lg relative overflow-hidden">
              <div className="absolute -left-10 -top-10 w-32 h-32 bg-[#8ba888]/5 rounded-full blur-2xl"></div>
              <div className="flex-1 relative z-10 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <svg className="w-5 h-5 text-[#8ba888]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Plată Rapidă Bancară</h4>
                </div>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto md:mx-0">
                  Deschide aplicația băncii tale (BT Pay, George, Revolut etc.), scanează codul alăturat și aprobă plata instant.
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl flex-shrink-0 shadow-[0_0_20px_rgba(139,168,136,0.15)] border-4 border-[#8ba888] relative z-10">
                <img src={qrCodeUrl} alt="QR Plată EPC" className="w-28 h-28 mix-blend-multiply" />
              </div>
            </div>
          )}

          {/* ZONA SEMNĂTURĂ */}
          <div className="pt-8 border-t border-slate-800/80">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-[1px] w-12 bg-slate-800"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Consimțământ Oficial</span>
              <div className="h-[1px] w-12 bg-slate-800"></div>
            </div>
            
            {signed ? (
              <div className="p-8 bg-emerald-900/10 border border-emerald-500/20 text-center rounded-2xl shadow-inner animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-3xl mb-4 mx-auto shadow-[0_0_20px_rgba(52,211,153,0.2)]">✓</div>
                <h4 className="text-emerald-400 font-black text-lg mb-1 uppercase tracking-wide">Document Validat Digital</h4>
                <p className="text-xs text-emerald-500/70">Exemplarul semnat a fost salvat și securizat în cloud. Poți închide această pagină.</p>
              </div>
            ) : (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-2 border-dashed border-slate-600 bg-white rounded-2xl overflow-hidden shadow-inner relative">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                    <span className="text-black text-3xl font-black italic tracking-tighter">Semnează Aici</span>
                  </div>
                  <canvas ref={canvasRef} className="w-full h-[200px] cursor-crosshair touch-none relative z-10" />
                </div>
                
                <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 sm:gap-0">
                  <button 
                    type="button" 
                    onClick={handleClear} 
                    className="text-[10px] text-slate-500 font-bold uppercase hover:text-white transition-colors flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-slate-800 w-full sm:w-auto justify-center"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Curăță Chenarul
                  </button>
                  <button 
                    onClick={handleSign} 
                    disabled={isSubmitting} 
                    className="w-full sm:w-auto bg-gradient-to-r from-[#8ba888] to-[#6d8a6a] text-black font-black px-8 py-3.5 rounded-xl text-xs uppercase tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(139,168,136,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Se Procesează...
                      </>
                    ) : (
                      <>
                        Confirmă și Semnează
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* FOOTER MINIMAL */}
        <div className="mt-12 text-center relative z-10">
          <p className="text-[10px] text-slate-500 font-mono tracking-wide">
            Acest document a fost emis de partenerul dumneavoastră via ContractSmart.<br/>
            Sistem auditat conform normelor europene privind validitatea juridică a semnăturii electronice simple.
          </p>
        </div>

      </div>
    </div>
  );
}