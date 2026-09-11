import Link from 'next/link';

export default function AuthModal({
  showAuthModal, setShowAuthModal,
  isSignUp, setIsSignUp,
  authEmail, setAuthEmail,
  authPassword, setAuthPassword,
  authConfirmPassword, setAuthConfirmPassword,
  handleAuthSubmit, handleSocialLogin, loadingText
}) {
  if (!showAuthModal) return null;

  return (
    <div className="fixed inset-0 bg-[#0B0F12]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#12181D]/90 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl max-w-sm w-full shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden">
        
        {/* Buton Închidere */}
        <button 
          type="button" 
          onClick={() => { setShowAuthModal(false); setIsSignUp(false); setAuthPassword(''); setAuthConfirmPassword(''); }} 
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-[#0B0F12] border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10 shadow-inner"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        {/* Header Modal */}
        <div className="relative z-10 mb-6">
          <div className="w-12 h-12 bg-[#16221A] border border-emerald-900/30 rounded-2xl flex items-center justify-center text-[#8ba888] mb-4 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">{isSignUp ? 'Cont Nou' : 'Autentificare'}</h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            {isSignUp ? 'Completează datele pentru a crea un cont în ecosistemul ContractSmart.' : 'Conectează-te la infrastructura securizată ContractSmart.'}
          </p>
        </div>

        {/* Butoane Social Login (Google & GitHub) */}
        <div className="space-y-2 mb-5 relative z-10">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="w-full bg-[#0B0F12] hover:bg-slate-900/90 border border-slate-700/70 hover:border-slate-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-3 shadow-inner group"
          >
            {/* Google SVG */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="tracking-wide">Continuă cu Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('github')}
            className="w-full bg-[#0B0F12] hover:bg-slate-900/90 border border-slate-700/70 hover:border-slate-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-3 shadow-inner group"
          >
            {/* GitHub SVG */}
            <svg className="w-4 h-4 shrink-0 fill-current text-white" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="tracking-wide">Continuă cu GitHub</span>
          </button>
        </div>

        {/* Separator Vizual */}
        <div className="relative flex py-2 items-center mb-4 z-10">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[9px] uppercase tracking-widest text-slate-500 font-black">sau cu email</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Formular Email & Parolă */}
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

        {/* Schimbă între Login și Înregistrare */}
        <div className="relative z-10 text-center mt-6 pt-4 border-t border-slate-800/80">
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