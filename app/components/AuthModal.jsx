import Link from 'next/link';

export default function AuthModal({
  showAuthModal, setShowAuthModal,
  isSignUp, setIsSignUp,
  authEmail, setAuthEmail,
  authPassword, setAuthPassword,
  authConfirmPassword, setAuthConfirmPassword,
  handleAuthSubmit, loadingText
}) {
  if (!showAuthModal) return null;

  return (
    <div className="fixed inset-0 bg-[#0B0F12]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#12181D]/90 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl max-w-sm w-full shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden">
        
        <button 
          type="button" 
          onClick={() => { setShowAuthModal(false); setIsSignUp(false); setAuthPassword(''); setAuthConfirmPassword(''); }} 
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-[#0B0F12] border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10 shadow-inner"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div className="relative z-10 mb-8">
          <div className="w-12 h-12 bg-[#16221A] border border-emerald-900/30 rounded-2xl flex items-center justify-center text-[#8ba888] mb-5 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">{isSignUp ? 'Cont Nou' : 'Autentificare'}</h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            {isSignUp ? 'Completează datele pentru a crea un cont în ecosistemul ContractSmart.' : 'Conectează-te la infrastructura securizată ContractSmart.'}
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4 relative z-10">
          <div>
            <label htmlFor="authEmail" className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-1.5">Adresă de Email</label>
            <input 
              id="authEmail" name="email" type="email" required pattern="^\S+@\S+\.\S+$" title="Introdu o adresă de email validă (ex: nume@domeniu.com)" placeholder="nume@companie.ro" 
              value={authEmail} onChange={e => setAuthEmail(e.target.value)} 
              className="w-full p-3.5 bg-[#0B0F12] border border-slate-700/60 rounded-xl text-xs text-white outline-none focus:border-[#8ba888] focus:ring-1 focus:ring-[#8ba888]/30 transition-all shadow-inner" 
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="authPassword" className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Parolă Validă</label>
              {!isSignUp && (
                <Link href="/reset-parola" className="text-[9px] text-[#8ba888] hover:text-white transition-colors font-bold uppercase tracking-wider">
                  Ai uitat parola?
                </Link>
              )}
            </div>
            <input 
              id="authPassword" name="password" type="password" required placeholder="••••••••" 
              value={authPassword} onChange={e => setAuthPassword(e.target.value)} 
              className="w-full p-3.5 bg-[#0B0F12] border border-slate-700/60 rounded-xl text-xs text-white outline-none focus:border-[#8ba888] focus:ring-1 focus:ring-[#8ba888]/30 transition-all shadow-inner" 
            />
          </div>

          {isSignUp && (
            <div className="animate-fadeIn">
              <label htmlFor="authConfirmPassword" className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-1.5">Confirmă Parola</label>
              <input 
                id="authConfirmPassword" name="confirmPassword" type="password" required placeholder="••••••••" 
                value={authConfirmPassword} onChange={e => setAuthConfirmPassword(e.target.value)} 
                className="w-full p-3.5 bg-[#0B0F12] border border-slate-700/60 rounded-xl text-xs text-white outline-none focus:border-[#8ba888] focus:ring-1 focus:ring-[#8ba888]/30 transition-all shadow-inner" 
              />
            </div>
          )}
          
          <button 
            type="submit" disabled={!!loadingText} 
            className="w-full bg-gradient-to-r from-[#8ba888] to-[#6d8a6a] text-[#0B0F12] font-black py-3.5 rounded-xl text-xs tracking-wide uppercase transition-all shadow-[0_0_15px_rgba(139,168,136,0.3)] hover:scale-[1.02] active:scale-[0.98] mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loadingText ? (
              <>
                <svg className="animate-spin h-4 w-4 text-[#0B0F12]" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Se procesează...
              </>
            ) : isSignUp ? 'Confirmă Înregistrarea' : 'Conectare Securizată'}
          </button>
        </form>

        <div className="relative z-10 text-center mt-6 pt-5 border-t border-slate-800/80">
          <button 
            type="button" 
            onClick={() => { setIsSignUp(!isSignUp); setAuthPassword(''); setAuthConfirmPassword(''); }} 
            className="text-[11px] text-slate-400 hover:text-[#8ba888] font-bold uppercase tracking-wider transition-colors"
          >
            {isSignUp ? 'Ai deja cont? Conectează-te' : 'Nu ai cont? Creează unul'}
          </button>
        </div>

      </div>
    </div>
  );
}