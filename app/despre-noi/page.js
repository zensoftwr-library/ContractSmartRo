import Link from 'next/link';
import '../globals.css';

export const metadata = {
  title: 'Despre Noi | ContractSmart',
  description: 'Infrastructură electronică avansată pentru securizarea încasărilor și managementul clauzelor comerciale.',
};

export default function DespreNoi() {
  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-200 font-sans pb-16 relative overflow-clip">
      {/* NAVBAR SIMPLIFICAT */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#0B0F12]/90 border-b border-slate-800 py-4 px-6 shadow-md">
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
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
          <Link href="/" className="text-xs font-bold text-slate-400 hover:text-[#8ba888] transition flex items-center gap-2">
            <span>&larr;</span> Înapoi
          </Link>
        </div>
      </nav>

      {/* AMBIENT GLOW */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#8ba888]/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-20">
        <span className="bg-[#16221A] text-[#8ba888] border border-emerald-900/50 text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider mb-6 inline-block">
          Misiunea Noastră
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">
          Birocrația nu ar trebui să fie o <span className="text-[#8ba888]">frână în afaceri.</span>
        </h1>
        
        <div className="space-y-6 text-sm text-slate-400 leading-relaxed">
          <p>
            Am construit <strong>ContractSmart</strong> dintr-o frustrare comună: timpul pierdut redactând hârtii, teama de clienți rău-platnici și lipsa unei structuri clare care să protejeze munca antreprenorilor și a freelancerilor din România.
          </p>
          <p>
            Platforma noastră nu este doar un simplu generator de PDF-uri. Este o infrastructură electronică avansată, dezvoltată pe fundamentele Codului Civil, concepută să îți securizeze încasările. Integrăm clauze anti-inflație, limitări de răspundere și sisteme moderne precum plata prin cod QR, direct pe document.
          </p>
          
          <div className="bg-[#12181D] border border-slate-800 p-6 rounded-xl my-8">
            <h3 className="text-white font-bold mb-2">De ce noi?</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><span className="text-[#8ba888]">✓</span> <strong>Rapiditate:</strong> Generezi contracte blindate juridic în sub 60 de secunde.</li>
              <li className="flex items-start gap-2"><span className="text-[#8ba888]">✓</span> <strong>Inovație:</strong> Singurul ecosistem care oferă un Mega-QR Studio dedicat conversiilor și un Terminal Bursier integrat.</li>
              <li className="flex items-start gap-2"><span className="text-[#8ba888]">✓</span> <strong>Siguranță:</strong> Datele tale sunt protejate și nu stocăm informații comerciale sensibile pe termen lung fără acordul tău.</li>
            </ul>
          </div>

          <p>
            Fie că ești la început de drum sau rulezi un SRL cu cifre de afaceri complexe, ContractSmart este partenerul tău tăcut care se asigură că la finalul zilei, munca ta este respectată și plătită la timp.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800">
          <Link href="/" className="bg-[#8ba888] text-[#0B0F12] font-black px-6 py-3 rounded-md text-sm transition hover:opacity-90 inline-block">
            Începe să generezi gratuit
          </Link>
        </div>
      </div>
    </div>
  );
}