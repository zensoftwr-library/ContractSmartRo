'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContractsDashboard from '../components/ContractsDashboard';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = globalThis.supabaseClient ?? createClient(supabaseUrl, supabaseAnonKey);

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Preluăm și profilul complet din baza de date pentru a sincroniza statusul (Fondator/Pro/Free)
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier, credits_remaining, is_pro, pro_reports_used, ai_audits_used')
          .eq('id', session.user.id)
          .single();

        setUser({ 
          id: session.user.id, 
          email: session.user.email,
          status: profile?.subscription_tier || 'free',
          credits: profile?.credits_remaining ?? 0,
          proReportsUsed: profile?.pro_reports_used || 0,
          aiAuditsUsed: profile?.ai_audits_used || 0
        });
      } else {
        window.location.href = '/'; // Redirecționare instantă dacă nu e logat
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#0B0F12] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-t-[#8ba888] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-200 font-sans flex flex-col relative overflow-clip">
      
      {/* Glow de fundal */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[100vw] h-[100vw] min-w-[600px] min-h-[600px] rounded-full animate-glow-1 opacity-50" style={{ background: 'radial-gradient(circle, rgba(139, 168, 136, 0.08) 0%, rgba(11, 15, 18, 0) 65%)' }} />
      </div>

      <Navbar user={user} />
      
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 pt-12 pb-24 relative z-10">
        
        <a href="/" className="text-[11px] font-bold text-[#8ba888] hover:text-white flex items-center gap-2 mb-6 transition-colors w-fit">
        &larr; Înapoi la Panoul Principal
        </a>

        {/* HEADER NOU */}
        <div className="text-center mb-16 border-b border-slate-800/80 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16221A] border border-[#8ba888]/20 text-[#8ba888] text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>
            CRM Dashboard
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter mb-5">
            Arhiva Contracte <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ba888] to-emerald-400">si Rapoarte</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Aici se regăsesc toate documentele generate de tine. Amprentele criptografice SHA-256 garantează autenticitatea și imuabilitatea datelor în fața oricărei terțe părți.
          </p>
        </div>
        
        <ContractsDashboard userId={user.id} />
      </main>

      <Footer />
    </div>
  );
}