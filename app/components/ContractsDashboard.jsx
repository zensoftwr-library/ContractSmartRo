'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function ContractsDashboard({ userId }) {
  const [contracts, setContracts] = useState([]);

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

  return (
    <div className="bg-[#12181D]/60 p-6 rounded-2xl border border-slate-800">
      <h2 className="text-xl font-black text-white mb-6">CRM Contracte Active</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="text-slate-500 uppercase border-b border-slate-800">
            <tr>
              <th className="pb-3">Contract</th>
              <th className="pb-3">Client</th>
              <th className="pb-3">Valoare</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {contracts.map(c => (
              <tr key={c.id}>
                <td className="py-4 text-white font-bold">{c.titlu_contract}</td>
                <td className="py-4 text-slate-300">{c.client_nume}</td>
                <td className="py-4 text-[#8ba888]">{c.valoare} {c.moneda}</td>
                <td className="py-4">
                  <span className="px-2 py-1 bg-emerald-900/20 text-emerald-400 rounded text-[9px] uppercase font-bold">Activ</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}