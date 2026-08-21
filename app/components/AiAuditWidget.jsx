'use client';
import { useState } from 'react';

export default function AiAuditWidget({ handleInapoiPrincipal, user, isPremium }) {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState(null); // Aici vom salva JSON-ul de la Gemini

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    
    // Validare simplă
    if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name.endsWith('.docx')) {
      return alert("Te rugăm să încarci un fișier PDF sau DOCX valid.");
    }
    
    setFile(uploadedFile);
  };

  const handleStartAudit = async () => {
    if (!user) {
      return alert("Trebuie să fii autentificat pentru a audita un contract extern.");
    }
    if (!isPremium && user.credits <= 0) {
      return alert("Ai nevoie de credite sau de un plan PRO pentru această funcție avansată.");
    }

    setIsAnalyzing(true);
    
    // Aici vom face call-ul către backend-ul Gemini 3.7 Flash în pasul următor
    // Pentru moment, simulăm 3 secunde de "gândire" a AI-ului
    setTimeout(() => {
      setReport({
        scorRisc: 8.5,
        rezumat: "Contractul prezintă un risc ridicat. Favorizează puternic partea emitentă, conține penalități disproporționate și lipsesc clauzele esențiale de limitare a răspunderii tale.",
        clauzeToxice: [
          {
            titlu: "Penalități de 1% pe zi de întârziere",
            textExtras: "Neplata la termen atrage penalități de 1% pe zi, putând depăși valoarea debitului.",
            recomandare: "Solicită plafonarea penalităților la maximum 0.1% pe zi și interzice depășirea valorii facturii inițiale."
          },
          {
            titlu: "Pact Comisoriu Abuziv",
            textExtras: "Beneficiarul poate rezilia contractul oricând, fără notificare prealabilă, reținând sumele plătite în avans.",
            recomandare: "Impunerea unui termen de remediere (ex: 15 zile) înainte de reziliere."
          }
        ],
        lipsuri: [
          "Lipsește clauza de Forță Majoră.",
          "Nu este definită instanța de judecată competentă în caz de litigiu."
        ]
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 animate-fadeIn">
      
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between bg-[#0B0F12]/80 backdrop-blur-sm border border-slate-800/80 px-4 sm:px-6 py-4 rounded-xl shadow-sm">
        <button type="button" onClick={handleInapoiPrincipal} className="text-[11px] font-bold text-purple-400 hover:text-white flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Înapoi la Panoul Principal
        </button>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span></span>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">AI Agent Activ</span>
        </div>
      </div>

      <div className="bg-[#12181D]/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow de fundal */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-[100px] pointer-events-none"></div>

        {!report ? (
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-purple-900/20 text-purple-400 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-3">Auditează un Contract Extern</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed mb-8">
              Ai primit un contract de la un partener sau corporație? Încarcă-l aici. Agentul nostru AI bazat pe Noul Cod Civil va identifica instantaneu clauzele toxice, penalitățile ascunse și obligațiile abuzive.
            </p>

            <div className="w-full max-w-lg bg-[#0B0F12] border-2 border-dashed border-slate-700 hover:border-purple-500/50 rounded-2xl p-10 transition-colors relative group">
              <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
              <div className="flex flex-col items-center pointer-events-none">
                <svg className="w-10 h-10 text-slate-500 group-hover:text-purple-400 transition-colors mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <span className="text-sm font-bold text-white uppercase tracking-widest">{file ? file.name : "Trage PDF-ul sau dă click"}</span>
                <span className="text-[10px] text-slate-500 mt-2">Maximum 10MB (PDF sau DOCX)</span>
              </div>
            </div>

            {file && (
              <button 
                onClick={handleStartAudit} 
                disabled={isAnalyzing}
                className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black px-10 py-4 rounded-xl text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:scale-[1.02] flex items-center justify-center gap-3 w-full max-w-lg"
              >
                {isAnalyzing ? (
                  <><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Agentul AI Analizează Juridic...</>
                ) : 'Lansează Auditul AI (1 Credit)'}
              </button>
            )}
          </div>
        ) : (
          
          /* RAPORTUL GENERAT (REDLINING) */
          <div className="relative z-10 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-slate-800/80 pb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-900/20 px-3 py-1 rounded-full border border-purple-500/20 mb-3 inline-block">Raport Finalizat</span>
                <h2 className="text-2xl font-black text-white">Diagnostic Contract: <span className="text-slate-400 font-medium text-lg">{file?.name}</span></h2>
              </div>
              <div className="mt-4 md:mt-0 text-right bg-[#0B0F12] p-4 rounded-xl border border-slate-700 shadow-inner">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Scor Risc (1 = Sigur, 10 = Toxic)</span>
                <span className={`text-3xl font-black ${report.scorRisc > 7 ? 'text-red-500' : report.scorRisc > 4 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {report.scorRisc} <span className="text-sm text-slate-600">/ 10</span>
                </span>
              </div>
            </div>

            <div className="bg-[#0B0F12] border border-slate-700 p-5 rounded-xl mb-8 leading-relaxed text-sm text-slate-300">
              <strong className="text-white">Concluzia AI: </strong> {report.rezumat}
            </div>

            <h3 className="text-lg font-black text-red-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Clauze Toxice Detectate ({report.clauzeToxice.length})
            </h3>
            <div className="space-y-4 mb-8">
              {report.clauzeToxice.map((clauza, i) => (
                <div key={i} className="bg-red-950/10 border border-red-900/30 p-5 rounded-xl">
                  <h4 className="font-bold text-white mb-2 text-sm">{clauza.titlu}</h4>
                  <div className="bg-[#0B0F12] border-l-2 border-red-500 p-3 text-xs text-slate-400 italic mb-3 font-serif">
                    "{clauza.textExtras}"
                  </div>
                  <p className="text-xs text-emerald-400 font-medium flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">↳ Recomandare de negociere:</span> 
                    <span className="text-slate-300">{clauza.recomandare}</span>
                  </p>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-black text-amber-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Lipsuri Majore (Vulnerabilități)
            </h3>
            <ul className="bg-amber-950/10 border border-amber-900/30 p-5 rounded-xl space-y-2">
              {report.lipsuri.map((lipsa, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="text-amber-500">•</span> {lipsa}
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-slate-800/80 flex justify-between items-center">
              <button onClick={() => setReport(null)} className="text-xs text-slate-400 hover:text-white transition-colors">Auditează alt document</button>
              <button className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg text-xs font-bold transition-colors shadow-sm">
                Descarcă Raport (PDF)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}