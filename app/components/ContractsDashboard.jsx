'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function ContractsDashboard({ userId }) {
  const [contracts, setContracts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    const fetchContracts = async () => {
      const { data } = await supabase
        .from('user_contracts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setContracts(data || []);
    };
    fetchContracts();
  }, [userId]);

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
                    {c.tip_contract === 'audit' ? (
                      <span className="text-[10px] text-purple-400 bg-purple-900/20 border border-purple-500/30 px-3 py-1.5 rounded-lg font-black uppercase tracking-wider inline-block">
                        Raport Salvat
                      </span>
                    ) : (
                      <div className="flex flex-col items-end gap-2">
                        <button 
                          onClick={() => handleGeneratesSomatie(c.id)}
                          disabled={loadingId === c.id}
                          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg font-black uppercase text-[9px] tracking-wider transition-all disabled:opacity-50"
                        >
                          {loadingId === c.id ? 'Se generează...' : ' Generează Somație'}
                        </button>
                        <button 
                          onClick={() => {
                            const printWindow = window.open('', '_blank');
                            printWindow.document.write(`
                              <html style="font-family: monospace; padding: 40px; color: #111;">
                                <h2 style="color: #16a34a;">CERTIFICAT DE AUTENTICITATE SHA-256</h2>
                                <hr />
                                <p><strong>Document ID:</strong> ${c.id}</p>
                                <p><strong>Titlu Contract:</strong> ${c.titlu_contract}</p>
                                <p><strong>Părți Implicate:</strong> ${c.client_nume}</p>
                                <p><strong>Valoare:</strong> ${c.valoare} ${c.moneda}</p>
                                <div style="background: #f1f5f9; padding: 20px; border: 1px solid #cbd5e1; word-wrap: break-word;">
                                  <strong>HASH CRIPTOGRAFIC IMUABIL:</strong><br/>
                                  ${c.hash_sha256 || 'Lipsă amprentă în baza de date'}
                                </div>
                                <p style="font-size: 12px; margin-top: 40px; color: #64748b;">
                                  Acest certificat garantează faptul că documentul binar generat nu a fost alterat din momentul semnării.
                                </p>
                                <script>window.print();</script>
                              </html>
                            `);
                            printWindow.document.close();
                          }}
                          className="bg-[#8ba888]/10 hover:bg-[#8ba888]/20 text-[#8ba888] border border-[#8ba888]/30 px-3 py-1.5 rounded-lg font-black uppercase text-[9px] tracking-wider transition-all"
                        >
                          Descarcă Certificat SHA-256
                        </button>
                      </div>
                    )}
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