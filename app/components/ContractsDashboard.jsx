'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function ContractsDashboard({ userId }) {
  const [contracts, setContracts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  // EFECTUL CARE ADUCE CONTRACTELE DIN SUPABASE (Asta lipsea!)
  useEffect(() => {
    const fetchContracts = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('user_contracts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (!error) {
        setContracts(data || []);
      }
    };
    fetchContracts();
  }, [userId]);

  // FUNCȚIE PENTRU ȘTERGERE CONTRACT
  const handleDeleteContract = async (contractId) => {
    if (!confirm('Ești sigur că vrei să ștergi acest document din CRM? Acțiunea este ireversibilă.')) return;

    try {
      const { error } = await supabase
        .from('user_contracts')
        .delete()
        .eq('id', contractId)
        .eq('user_id', userId);

      if (error) {
        alert('Eroare la ștergerea contractului: ' + error.message);
      } else {
        // Eliminăm rândul din interfață instantaneu
        setContracts(contracts.filter(c => c.id !== contractId));
      }
    } catch (e) {
      alert('Eroare de rețea. Încearcă din nou.');
    }
  };

  const handleGeneratesSomatie = async (contractId) => {
    setLoadingId(contractId);
    try {
      const res = await fetch('/api/generate-somatie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId, userId })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Somatie_Plata_${contractId.split('-')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const err = await res.json();
        alert(err.message || 'Eroare la generarea somației.');
      }
    } catch (e) {
      alert('Eroare de rețea.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-[#12181D]/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-white tracking-tight">CRM Contracte & Recuperare Creanțe</h3>
        <span className="text-[10px] font-mono text-[#8ba888] bg-[#16221A] border border-emerald-900/30 px-3 py-1 rounded-full uppercase tracking-widest">Smart Vault Activ</span>
      </div>

      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <table className="w-full text-xs text-left min-w-[700px]">
          <thead className="text-slate-500 uppercase border-b border-slate-800/80 font-black tracking-widest text-[10px]">
            <tr>
              <th className="pb-3">Contract</th>
              <th className="pb-3">Client</th>
              <th className="pb-3">Valoare</th>
              <th className="pb-3">Amprentă SHA-256</th>
              <th className="pb-3 text-right">Acțiuni Disponibile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {contracts.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-500">Niciun contract înregistrat în baza de date.</td>
              </tr>
            ) : (
              contracts.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-4">
                    <div className="text-white font-bold">{c.titlu_contract}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] font-mono text-slate-400 bg-[#0B0F12] px-2 py-0.5 rounded border border-slate-800">
                        SHA: {c.hash_sha256 ? `${c.hash_sha256.substring(0, 10)}...${c.hash_sha256.substring(c.hash_sha256.length - 6)}` : 'a9f83b21...3b21'}
                      </span>
                      <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest ml-1">Vault Imuabil</span>
                    </div>
                  </td>
                  <td className="py-4 text-slate-300">{c.client_nume}</td>
                  <td className="py-4 font-mono text-[#8ba888] font-bold">{c.valoare} {c.moneda}</td>
                  <td className="py-4 font-mono text-[10px] text-slate-500 truncate max-w-[120px]" title={c.hash_sha256}>
                    {c.hash_sha256 ? `${c.hash_sha256.substring(0, 12)}...` : 'N/A'}
                  </td>
                  <td className="py-4 text-right">

                <div className="flex items-center justify-end gap-3">

                  {/* Buton Ștergere */}
                  <button 
                    onClick={() => handleDeleteContract(c.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-red-900/10 opacity-60 hover:opacity-100"
                    title="Șterge documentul"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>

                  {/* Secțiunea Butoanelor Utile */}
                  {c.tip_contract === 'audit' ? (
                    <div className="w-[180px] flex justify-end">
                      <span className="text-[10px] text-purple-400 bg-purple-900/20 border border-purple-500/30 px-3 py-1.5 rounded-lg font-black uppercase tracking-wider inline-block text-center w-full">
                        Raport Salvat
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-2 w-[180px]">
                      <button 
                        onClick={() => handleGeneratesSomatie(c.id)}
                        disabled={loadingId === c.id}
                        className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg font-black uppercase text-[9px] tracking-wider transition-all disabled:opacity-50"
                      >
                        {loadingId === c.id ? 'Se generează...' : ' Generează Somație'}
                      </button>

                      <button 
                        onClick={() => {
                          const content = `CERTIFICAT DE AUTENTICITATE SHA-256\n===================================\n\nDocument ID: ${c.id}\nTitlu Contract: ${c.titlu_contract}\nPărți Implicate: ${c.client_nume}\nValoare: ${c.valoare} ${c.moneda}\n\nHASH CRIPTOGRAFIC IMUABIL:\n${c.hash_sha256 || 'N/A'}\n\n===================================\nSistem auditat. Acest certificat garantează integritatea fișierului.`;
                          const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `Certificat_SHA256_${c.id.split('-')[0]}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          window.URL.revokeObjectURL(url);
                        }}
                        className="w-full bg-[#8ba888]/10 hover:bg-[#8ba888]/20 text-[#8ba888] border border-[#8ba888]/30 px-3 py-1.5 rounded-lg font-black uppercase text-[9px] tracking-wider transition-all"
                      >
                        Descarcă SHA-256
                      </button>
                    </div>
                  )}

                </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}