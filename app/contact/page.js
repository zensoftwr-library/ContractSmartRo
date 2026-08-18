'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({ nume: '', email: '', subiect: '', mesaj: '' });
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('trimis');
    // Aici va veni logica ta de trimitere email (ex: Resend)
    setTimeout(() => {
      setStatus(null);
      setFormData({ nume: '', email: '', subiect: '', mesaj: '' });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-200 font-sans pb-16 relative overflow-clip">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#0B0F12]/90 border-b border-slate-800 py-4 px-6 shadow-lg">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/" className="w-[180px] h-[30px] flex items-center cursor-pointer">
            <svg viewBox="0 0 240 52" className="w-full h-full">
              <g transform="translate(0, 6)">
                <path d="M24 6 C15 6, 8 13, 8 22 C8 31, 15 38, 24 38 C31 38, 37 33, 39 27" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round"/>
                <path d="M16 21 L21 26 L32 12" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <text x="48" y="34" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="22" fill="#FFFFFF" letterSpacing="-0.5">
                Contract<tspan fill="#8ba888">Smart</tspan>
              </text>
            </svg>
          </Link>
          <div className="hidden md:flex space-x-5">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition">Înapoi la Platformă</Link>
            <Link href="/termeni-si-conditii" className="text-xs text-slate-400 hover:text-white transition">Termeni și Condiții</Link>
          </div>
        </div>
      </nav>

      {/* AMBIENT BLOBS */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-clip">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-slate-700/5 blur-[120px] transform-gpu top-[20%] right-[10%]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        
        <div className="text-center mb-12">
          <span className="text-[#8ba888] text-xs font-black uppercase tracking-widest block mb-2">Suport Clienți & B2B</span>
          <h1 className="text-4xl md:text-5xl font-black text-white">Contactează-ne</h1>
          <p className="text-slate-400 text-sm mt-3 max-w-lg mx-auto">Ai o întrebare despre produsele ContractSmart, un abonament sau dorești un parteneriat? Completează formularul sau folosește datele de mai jos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* DETALII FIRMA */}
          <div className="bg-[#12181D] border border-slate-800 rounded-xl p-8 shadow-2xl flex flex-col justify-center">
            <h3 className="text-xl font-bold text-white mb-6">Date de Identificare</h3>
            
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#16221A] rounded-lg flex items-center justify-center text-[#8ba888] shrink-0">🏛️</div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Denumire Companie</span>
                  <span className="block text-sm text-white font-medium">ZenSoftware</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#16221A] rounded-lg flex items-center justify-center text-[#8ba888] shrink-0">✉️</div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Suport Email</span>
                  <a href="mailto:contact@contractsmart.ro" className="block text-sm text-[#8ba888] hover:underline font-medium">zensoftwr@gmail.com</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#16221A] rounded-lg flex items-center justify-center text-[#8ba888] shrink-0">📞</div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Telefon Call-Center</span>
                  <a href="tel:+40700000000" className="block text-sm text-white hover:text-[#8ba888] font-medium">+40757895746</a>
                  <span className="block text-[10px] text-slate-500 mt-1">Luni - Vineri: 09:00 - 18:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* FORMULAR DE CONTACT */}
          <div className="bg-[#12181D] border border-slate-800 rounded-xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Lasă-ne un mesaj</h3>
            
            {status === 'trimis' ? (
              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-6 text-center">
                <span className="text-4xl block mb-2">✅</span>
                <h4 className="text-emerald-400 font-bold mb-1">Mesaj recepționat cu succes!</h4>
                <p className="text-xs text-emerald-500/70">Un reprezentant te va contacta în cel mai scurt timp.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Nume Complet</label>
                    <input type="text" required value={formData.nume} onChange={e => setFormData({...formData, nume: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#8ba888]" placeholder="Popescu Ion" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Email</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#8ba888]" placeholder="nume@companie.ro" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Subiect</label>
                  <input type="text" required value={formData.subiect} onChange={e => setFormData({...formData, subiect: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#8ba888]" placeholder="Problemă abonament / Parteneriat..." />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Mesajul tău</label>
                  <textarea required value={formData.mesaj} onChange={e => setFormData({...formData, mesaj: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700 rounded-lg p-3 text-xs text-white outline-none focus:border-[#8ba888] h-32 resize-none" placeholder="Descrie pe scurt cum te putem ajuta..."></textarea>
                </div>
                <button type="submit" className="w-full bg-[#8ba888] text-[#0B0F12] font-black py-3 rounded-lg text-xs tracking-wide uppercase hover:opacity-90 transition">
                  Trimite Mesajul
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}