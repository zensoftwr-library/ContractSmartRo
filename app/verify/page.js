'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function VerifyVaultPage() {
  const [file, setFile] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const uploaded = e.target.files[0];
    if (uploaded) setFile(uploaded);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!file) return alert('Te rugăm să selectezi un fișier PDF.');

    setIsVerifying(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/verify-vault', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert('Eroare de rețea la comunicarea cu serverul de securitate.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-200 font-sans p-6 md:p-12 relative flex flex-col justify-between">
      <div className="max-w-2xl mx-auto w-full pt-10">
        
        <div className="mb-8">
          <Link href="/" className="text-xs text-[#8ba888] hover:text-white transition-colors font-bold uppercase tracking-wider">
            ← Înapoi la platformă
          </Link>
        </div>

        <div className="bg-[#12181D]/80 backdrop-blur-xl border border-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8ba888]/5 blur-3xl pointer-events-none"></div>

          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#16221A] border border-emerald-900/30 text-[#8ba888] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Portal Verificare Smart Vault</h1>
            <p className="text-xs text-slate-400 mt-2">Încarcă un contract PDF pentru a verifica integritatea criptografică și valoarea sa probatorie.</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="border-2 border-dashed border-slate-700 hover:border-[#8ba888]/50 bg-[#0B0F12]/50 p-8 rounded-2xl text-center relative cursor-pointer group transition-colors">
              <input type="file" accept="application/pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <span className="text-xs font-bold text-white block uppercase tracking-wider">{file ? file.name : "Alege fișierul PDF semnat"}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Sistemul va extrage amprenta SHA-256 în mod securizat</span>
            </div>

            <button 
              type="submit" 
              disabled={!file || isVerifying}
              className="w-full bg-gradient-to-r from-[#8ba888] to-[#6d8a6a] text-[#0B0F12] font-black py-4 rounded-xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(139,168,136,0.2)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isVerifying ? 'Se calculează amprenta SHA-256...' : 'Validează Integritatea Documentului'}
            </button>
          </form>

          {result && (
            <div className={`mt-8 p-6 rounded-2xl border animate-fadeIn ${result.verified ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-red-950/20 border-red-500/30'}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`w-3 h-3 rounded-full ${result.verified ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`}></span>
                <h3 className={`text-sm font-black uppercase tracking-wide ${result.verified ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.verified ? '✓ Document Autentic și Neverificat Modificat' : '✗ Eșec Verificare Criptografică'}
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">{result.message}</p>

              {result.verified && result.contract && (
                <div className="bg-[#0B0F12] p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
                  <div><strong className="text-slate-500">Titlu:</strong> <span className="text-white">{result.contract.titlu}</span></div>
                  <div><strong className="text-slate-500">Beneficiar:</strong> <span className="text-white">{result.contract.client}</span></div>
                  <div><strong className="text-slate-500">Valoare:</strong> <span className="text-[#8ba888]">{result.contract.valoare}</span></div>
                  <div><strong className="text-slate-500">Data Emitere:</strong> <span className="text-white">{result.contract.dataEmitere}</span></div>
                  <div><strong className="text-slate-500">Hash SHA-256:</strong> <span className="text-purple-400 break-all">{result.contract.hash}</span></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="text-center text-[10px] text-slate-600 mt-10">
        ContractSmart Enterprise Security Suite • Arhitectură de Valoare Probatorie
      </footer>
    </div>
  );
}