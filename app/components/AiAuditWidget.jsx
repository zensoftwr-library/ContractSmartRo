'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function AiAuditWidget({ handleInapoiPrincipal, user, isPremium, onGenerateCorrected }) {
  const [file, setFile] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // Funcție simulată/reală de audit
  const handleAudit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Te rugăm să încarci un contract PDF.');

    setIsAuditing(true);
    setIsSaved(false); // Resetăm starea de salvare la fiecare audit nou

    // Simularea procesării AI (Aici vei pune fetch-ul tău real către OpenAI)
    setTimeout(() => {
      const mockResult = {
        score: 8.5,
        fileName: file.name,
        conclusion: "Contractul prezintă un risc ridicat. Favorizează puternic partea emitentă, conține penalități disproporționate și lipsesc clauzele esențiale de limitare a răspunderii tale.",
        toxicClauses: [
          {
            original: "Beneficiarul poate rezilia contractul oricând, fără notificare prealabilă, reținând sumele plătite în avans.",
            recommendation: "Impunerea unui termen de remediere (ex: 15 zile) înainte de reziliere."
          }
        ],
        missingClauses: [
          "Lipsește clauza de Forță Majoră.",
          "Nu este definită instanța de judecată competentă în caz de litigiu."
        ],
        // AICI ESTE MAGIA: Datele extrase din PDF pentru a genera varianta corectată
        extractedData: {
          tipContract_detectat: 'prestari', // Schimbă în 'necunoscut' dacă vrei să testezi alerta
          prestatorNume: 'Compania Veche SRL',
          clientNume: 'Compania Ta SRL',
          valoare: '5000',
          moneda: 'EUR',
          obiect: 'Servicii de dezvoltare conform anexei din contractul inițial.'
        }
      };
      setAuditResult(mockResult);
      setIsAuditing(false);
    }, 2500);
  };

  // Funcția MAnuală de Salvare în CRM
  const handleSaveToCRM = async () => {
    if (!user?.id || !auditResult) return;
    setIsSaved('loading');

    const { error } = await supabase.from('user_contracts').insert({
      user_id: user.id,
      titlu_contract: `Raport AI: ${auditResult.fileName}`,
      tip_contract: 'audit',
      client_nume: '-',
      valoare: auditResult.score,
      moneda: 'Risc',
      hash_sha256: `Scor: ${auditResult.score}/10 | ${auditResult.toxicClauses.length} Clauze Toxice`,
      stare_plata: 'auditat'
    });

    if (!error) {
      setIsSaved('done');
    } else {
      setIsSaved(false);
      alert('Eroare la salvarea în CRM-ul Supabase.');
    }
  };

  // Culoarea și progresul cercului
  const getScoreColor = (score) => {
    if (score <= 3) return '#10b981'; // Verde
    if (score <= 7) return '#f59e0b'; // Galben
    return '#ef4444'; // Roșu
  };
  
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = auditResult ? circumference - ((10 - auditResult.score) / 10) * circumference : circumference;

  if (auditResult) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 animate-fadeIn">
        
        {/* Buton Înapoi */}
        <div className="mb-6 flex items-center justify-between bg-[#0B0F12]/80 backdrop-blur-sm border border-slate-800/80 px-4 py-4 rounded-xl shadow-sm">
          <button type="button" onClick={handleInapoiPrincipal} className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-2 transition-colors uppercase tracking-wider">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Înapoi la Panoul Principal
          </button>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span></span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">AI AGENT ACTIV</span>
          </div>
        </div>

        <div className="bg-[#12181D]/60 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-slate-800/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]">
          <span className="bg-purple-900/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Raport Finalizat</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">Diagnostic Contract:</h2>
          <p className="text-sm text-slate-400 font-mono mb-8">{auditResult.fileName}</p>

          {/* CERC PROGRESIV SCOR RISC */}
          <div className="bg-[#0B0F12] border border-slate-700/60 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-8 mb-8 shadow-inner">
            <div className="relative flex items-center justify-center">
              <svg width="120" height="120" className="-rotate-90">
                <circle cx="60" cy="60" r={radius} stroke="#1e293b" strokeWidth="12" fill="transparent" />
                <circle 
                  cx="60" 
                  cy="60" 
                  r={radius} 
                  stroke={getScoreColor(auditResult.score)} 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={dashoffset} 
                  strokeLinecap="round" 
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-black" style={{ color: getScoreColor(auditResult.score) }}>{auditResult.score}</span>
                <span className="text-xs font-bold text-slate-500 block -mt-1">/10</span>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Scor Risc (1 = Sigur, 10 = Toxic)</span>
              <p className="text-sm text-slate-300 leading-relaxed max-w-md">{auditResult.conclusion}</p>
            </div>
          </div>

          {/* Clauze Toxice */}
          <h3 className="text-lg font-black text-red-400 uppercase tracking-wide flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Clauze Toxice Detectate ({auditResult.toxicClauses.length})
          </h3>
          <div className="space-y-4 mb-8">
            {auditResult.toxicClauses.map((c, i) => (
              <div key={i} className="bg-red-900/10 border border-red-900/30 p-5 rounded-xl">
                <p className="text-slate-300 text-sm italic border-l-2 border-red-500 pl-3 mb-4">"{c.original}"</p>
                <div className="flex gap-2 items-start">
                  <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  <p className="text-xs text-emerald-400 font-bold leading-relaxed"><span className="uppercase tracking-wider mr-1">Recomandare:</span> {c.recommendation}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Lipsuri Majore */}
          <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Lipsuri Majore (Vulnerabilități)
          </h3>
          <div className="bg-amber-900/10 border border-amber-900/30 p-5 rounded-xl mb-10">
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
              {auditResult.missingClauses.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <button onClick={() => { setAuditResult(null); setFile(null); setIsSaved(false); }} className="text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-4 shrink-0">Auditează alt document</button>
              
              {/* BUTONUL DE SALVARE MANUALĂ CRM */}
              {!isSaved ? (
                <button onClick={handleSaveToCRM} className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-900/10 px-3 py-1.5 rounded border border-emerald-500/20 hover:bg-emerald-900/30 transition-colors shadow-sm shrink-0">
                  💾 Salvează în CRM
                </button>
              ) : isSaved === 'loading' ? (
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-900/10 px-3 py-1.5 rounded border border-emerald-500/20 shrink-0">Se salvează...</span>
              ) : (
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-900/20 px-3 py-1.5 rounded border border-emerald-500/20 shrink-0">✓ Salvat în CRM</span>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
              <button onClick={() => window.print()} className="w-full sm:w-auto shrink-0 bg-[#1e293b] hover:bg-slate-700 text-white px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wide transition-colors border border-slate-600">
                Descarcă PDF
              </button>
              <button onClick={() => onGenerateCorrected(auditResult.extractedData)} className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)]">
                Generează Contract Corectat
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ECRANUL DE UPLOAD INIȚIAL
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6 animate-fadeIn text-center">
      <div className="w-16 h-16 bg-purple-900/20 text-purple-400 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
      </div>
      <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">Analiză AI de Risc Juridic</h2>
      <p className="text-slate-400 mb-10 max-w-lg mx-auto">Încarcă orice contract PDF pe care l-ai primit de la un partener. Inteligența artificială va detecta clauzele abuzive, toxice sau ascunse în mai puțin de 5 secunde.</p>
      
      <form onSubmit={handleAudit} className="bg-[#12181D]/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-500/30 bg-[#0B0F12] hover:bg-purple-900/10 hover:border-purple-500/50 rounded-2xl cursor-pointer transition-all relative z-10 group">
          <svg className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
          <span className="text-sm font-bold text-white mb-1">{file ? file.name : 'Apasă pentru a alege PDF-ul'}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">{file ? 'Fișier Încărcat' : 'Dimensiune maximă 5MB'}</span>
          <input type="file" accept="application/pdf" className="hidden" onChange={e => setFile(e.target.files[0])} />
        </label>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-6 relative z-10">
          <button type="button" onClick={handleInapoiPrincipal} className="w-full sm:w-1/3 bg-transparent text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-800 px-6 py-4 rounded-xl text-xs font-bold uppercase transition-colors">
            Înapoi
          </button>
          <button type="submit" disabled={isAuditing || !file} className="w-full sm:w-2/3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-black px-6 py-4 rounded-xl text-sm uppercase tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
            {isAuditing ? (
              <><svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Auditează Acum...</>
            ) : 'Începe Auditul AI'}
          </button>
        </div>
      </form>
    </div>
  );
}