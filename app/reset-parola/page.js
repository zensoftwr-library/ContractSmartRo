"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ResetParolaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-parola/update`, 
      });

      if (error) throw error;
      
      setMessage("Dacă adresa există în baza noastră de date, vei primi un email cu instrucțiunile de resetare.");
      setEmail("");
    } catch (err) {
      setError("A apărut o eroare la trimiterea linkului. Te rugăm să încerci din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F12] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0B0F12] border border-slate-800 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden relative">
        <div className="p-8">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
              Resetare <span className="text-[#8ba888]">Parolă</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Introdu adresa de email asociată contului tău ContractSmart.
            </p>
          </div>

          <form onSubmit={handleReset} className="space-y-5 relative z-10">
            <div>
              <label htmlFor="resetEmail" className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-1.5">
                Adresă de Email
              </label>
              <input 
                id="resetEmail" 
                name="email" 
                type="email" 
                required 
                pattern="^\S+@\S+\.\S+$"
                title="Introdu o adresă de email validă (ex: nume@domeniu.com)"
                placeholder="nume@companie.ro" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full p-3.5 bg-[#0B0F12] border border-slate-700/60 rounded-xl text-xs text-white outline-none focus:border-[#8ba888] focus:ring-1 focus:ring-[#8ba888]/30 transition-all shadow-inner" 
              />
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20 text-center">
                {error}
              </div>
            )}

            {message && (
              <div className="text-xs text-[#8ba888] bg-[#8ba888]/10 p-3 rounded-xl border border-[#8ba888]/20 text-center">
                {message}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-[#8ba888] to-[#6d8a6a] text-[#0B0F12] font-black py-3.5 rounded-xl text-xs tracking-wide uppercase transition-all shadow-[0_0_15px_rgba(139,168,136,0.3)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-[#0B0F12]" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Se procesează...
                </>
              ) : (
                'Trimite Link Resetare'
              )}
            </button>
          </form>

          <div className="relative z-10 text-center mt-8 pt-5 border-t border-slate-800/80">
            <Link 
              href="/" 
              className="text-[11px] text-slate-400 hover:text-[#8ba888] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Înapoi la Autentificare
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}