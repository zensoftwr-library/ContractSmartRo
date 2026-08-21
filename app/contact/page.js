'use client';
import Link from 'next/link';
import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function Contact() {
  const [formData, setFormData] = useState({ nume: '', email: '', subiect: '', mesaj: '' });
  const [status, setStatus] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-[#0B0F12] text-slate-300 font-sans selection:bg-[#8ba888]/30 selection:text-[#8ba888]">
      
<Navbar />

            {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[50%] transform -translate-x-1/2 w-[90vw] h-[90vw] min-w-[800px] min-h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139, 168, 136, 0.04) 0%, rgba(11, 15, 18, 0) 60%)' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10 md:py-16">
        
        {/* BUTON INAPOI */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-[#12181D]/60 border border-slate-800/80 px-4 py-2 rounded-lg hover:border-[#8ba888]/50 shadow-sm backdrop-blur-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Înapoi la aplicație
          </Link>
        </div>

        {/* HEADER */}
        <div className="text-center mb-16 border-b border-slate-800/80 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16221A] border border-[#8ba888]/20 text-[#8ba888] text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>
            Suport Clienți & B2B
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter mb-5">
            Contactează <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ba888] to-emerald-400">Echipa</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Ai o întrebare despre produsele ContractSmart, un abonament sau dorești un parteneriat? Completează formularul sau folosește datele de contact directe de mai jos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* DETALII FIRMA (2 Coloane) */}
          <div className="lg:col-span-2 bg-[#12181D]/40 border border-slate-800/80 rounded-2xl p-8 shadow-lg relative overflow-hidden group hover:border-[#8ba888]/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8ba888]/5 blur-2xl rounded-full"></div>
            
            <h3 className="text-xl font-black text-white mb-8 relative z-10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#8ba888]/20 flex items-center justify-center text-[#8ba888] border border-[#8ba888]/30">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              Date de Identificare
            </h3>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0B0F12] border border-slate-800/60 hover:border-[#8ba888]/20 transition-colors">
                <div className="w-10 h-10 bg-[#16221A] rounded-lg flex items-center justify-center text-[#8ba888] shrink-0 border border-[#8ba888]/20 shadow-inner">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-black tracking-widest text-slate-500 mb-0.5">Denumire Companie</span>
                  <span className="block text-sm text-white font-bold">ZenSoftware</span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0B0F12] border border-slate-800/60 hover:border-[#8ba888]/20 transition-colors">
                <div className="w-10 h-10 bg-[#16221A] rounded-lg flex items-center justify-center text-[#8ba888] shrink-0 border border-[#8ba888]/20 shadow-inner">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-black tracking-widest text-slate-500 mb-0.5">Suport Email</span>
                  <a href="mailto:zensoftwr@gmail.com" className="block text-sm text-[#8ba888] hover:text-white transition-colors font-bold">zensoftwr@gmail.com</a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0B0F12] border border-slate-800/60 hover:border-[#8ba888]/20 transition-colors">
                <div className="w-10 h-10 bg-[#16221A] rounded-lg flex items-center justify-center text-[#8ba888] shrink-0 border border-[#8ba888]/20 shadow-inner">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-black tracking-widest text-slate-500 mb-0.5">Telefon Call-Center</span>
                  <a href="tel:+40757895746" className="block text-sm text-white hover:text-[#8ba888] transition-colors font-bold">+40757895746</a>
                  <span className="block text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3 text-[#8ba888]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Luni - Vineri: 09:00 - 18:00
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* FORMULAR DE CONTACT (3 Coloane) */}
          <div className="lg:col-span-3 bg-[#12181D]/40 border border-slate-800/80 rounded-2xl p-8 shadow-lg relative overflow-hidden group hover:border-[#8ba888]/30 transition-colors">
            <h3 className="text-xl font-black text-white mb-6 relative z-10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#8ba888]/20 flex items-center justify-center text-[#8ba888] border border-[#8ba888]/30">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
              </div>
              Lasă-ne un mesaj direct
            </h3>
            
            {status === 'trimis' ? (
              <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-10 text-center shadow-inner relative z-10 animate-fadeIn h-[350px] flex flex-col justify-center items-center">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-4xl mb-6 shadow-[0_0_20px_rgba(52,211,153,0.2)]">✓</div>
                <h4 className="text-2xl text-emerald-400 font-black mb-2">Mesaj recepționat cu succes!</h4>
                <p className="text-sm text-emerald-500/70 max-w-xs mx-auto">Un reprezentant al echipei noastre te va contacta în cel mai scurt timp posibil pe email.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block mb-1.5">Nume Complet</label>
                    <input type="text" required value={formData.nume} onChange={e => setFormData({...formData, nume: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700/60 rounded-xl p-3.5 text-xs text-white outline-none focus:ring-1 focus:ring-[#8ba888]/50 focus:border-[#8ba888] transition-all shadow-inner" placeholder="Ex: Popescu Ion" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block mb-1.5">Adresă Email</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700/60 rounded-xl p-3.5 text-xs text-white outline-none focus:ring-1 focus:ring-[#8ba888]/50 focus:border-[#8ba888] transition-all shadow-inner" placeholder="Ex: nume@companie.ro" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block mb-1.5">Subiect</label>
                  <input type="text" required value={formData.subiect} onChange={e => setFormData({...formData, subiect: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700/60 rounded-xl p-3.5 text-xs text-white outline-none focus:ring-1 focus:ring-[#8ba888]/50 focus:border-[#8ba888] transition-all shadow-inner" placeholder="Ex: Problemă abonament PRO / Parteneriat / Eroare..." />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block mb-1.5">Mesajul tău</label>
                  <textarea required value={formData.mesaj} onChange={e => setFormData({...formData, mesaj: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700/60 rounded-xl p-3.5 text-xs text-white outline-none focus:ring-1 focus:ring-[#8ba888]/50 focus:border-[#8ba888] transition-all shadow-inner h-36 resize-y" placeholder="Descrie pe scurt cum te putem ajuta..."></textarea>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-[#8ba888] to-[#6d8a6a] text-black font-black py-4 rounded-xl text-xs tracking-wide uppercase shadow-[0_0_20px_rgba(139,168,136,0.2)] hover:shadow-[0_0_25px_rgba(139,168,136,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2">
                  Trimite Mesajul
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* TRUST BADGES ENTERPRISE */}
      <div className="max-w-6xl mx-auto px-6 my-16">
        <div className="bg-[#12181D]/40 border border-slate-800/80 backdrop-blur-xl p-6 rounded-2xl flex flex-col md:flex-row items-center justify-around gap-6 text-center shadow-lg">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20">✓</div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Validare Fiscală ANAF</h4>
              <p className="text-[10px] text-slate-400">Interogare directă în registre</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#8ba888]/10 text-[#8ba888] flex items-center justify-center font-bold border border-[#8ba888]/20">🛡️</div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Criptografie SHA-256</h4>
              <p className="text-[10px] text-slate-400">Amprentă imuabilă în Smart Vault</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold border border-blue-500/20">⚖️</div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Codul Civil Român</h4>
              <p className="text-[10px] text-slate-400">Conformitate Art. 1522 & 1538</p>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER STANDARD PLATFORMA */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#0B0F12] pt-12 pb-8 mt-16 text-center">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          <div className="flex justify-center">
            <Link href="/" className="w-[180px] h-[30px] cursor-pointer block hover:opacity-90 transition-opacity">
              <svg viewBox="0 0 240 40" className="w-full h-full mx-auto">
                <g transform="translate(0, 2)">
                  <path d="M24 6 C15 6, 8 13, 8 22 C8 31, 15 38, 24 38 C31 38, 37 33, 39 27" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round"/>
                  <path d="M16 21 L21 26 L32 12" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <text x="48" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="20" fill="#FFFFFF" letterSpacing="-0.5">
                  Contract<tspan fill="#8ba888">Smart</tspan>
                </text>
              </svg>
            </Link>
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Infrastructură electronică avansată dedicată optimizării micro-sistemelor, înmatriculării rapide a entităților comerciale și auditului de clauze pe Codul Civil român.
          </p>
          <div className="flex justify-center space-x-6 text-xs text-slate-400 font-medium">
            <Link href="/termeni-si-conditii" className="hover:text-[#8ba888] transition">Termeni și Condiții</Link>
            <span>•</span>
            <Link href="/politica-si-confidentialitate" className="hover:text-[#8ba888] transition">Confidențialitate</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-[#8ba888] transition">Contact</Link>
          </div>
          <div className="pt-6 border-t border-slate-800/40 flex flex-col items-center gap-4">
            <p className="text-[10px] text-slate-500 font-mono max-w-3xl text-center leading-relaxed px-4">
              <strong className="text-red-500/80">Disclaimer Legal!</strong> <strong className="text-[#8ba888]">ContractSmart</strong> este o platformă de software. <strong className="text-red-500/80">NU</strong> suntem o casă de avocatură și nu oferim consultanță juridică.
            </p>
            <p className="text-[11px] text-slate-500 font-mono tracking-wide">© 2026 <strong className="text-[#8ba888]">ContractSmart</strong>. Powered by <strong className="text-[#8ba888]">ZenSoftWare</strong>.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}