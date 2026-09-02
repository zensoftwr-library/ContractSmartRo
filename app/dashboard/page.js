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
        setUser({ id: session.user.id, email: session.user.email });
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
      
      {/* Glow de fundal (opțional, pentru continuitate cu designul) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[100vw] h-[100vw] min-w-[600px] min-h-[600px] rounded-full animate-glow-1 opacity-50" style={{ background: 'radial-gradient(circle, rgba(139, 168, 136, 0.08) 0%, rgba(11, 15, 18, 0) 65%)' }} />
      </div>

      <Navbar user={user} />
      
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 pt-12 pb-24 relative z-10">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Arhiva Mea</h1>
          <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-2xl">Aici se regăsesc toate documentele generate de tine. Amprentele criptografice SHA-256 garantează autenticitatea și imuabilitatea datelor în fața oricărei terțe părți.</p>
        </div>
        
        <ContractsDashboard userId={user.id} />
      </main>

      <Footer />
    </div>
  );
}