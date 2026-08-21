'use client';
import Link from 'next/link';

export default function Footer({ handleInapoiPrincipal }) {
  return (
    <footer className="relative z-10 border-t border-slate-800 bg-[#0B0F12] pt-12 pb-8 mt-16 text-center">
      <div className="max-w-5xl mx-auto px-6 space-y-6">
        <div className="flex justify-center">
          <div className="w-[180px] h-[30px] cursor-pointer" onClick={handleInapoiPrincipal}>
            <svg viewBox="0 0 240 52" className="w-full h-full mx-auto">
              <g transform="translate(0, 6)">
                <path d="M24 6 C15 6, 8 13, 8 22 C8 31, 15 38, 24 38 C31 38, 37 33, 39 27" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round"/>
                <path d="M16 21 L21 26 L32 12" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <text x="48" y="34" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="22" fill="#FFFFFF" letterSpacing="-0.5">
                Contract<tspan fill="#8ba888">Smart</tspan>
              </text>
            </svg>
          </div>
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
            <strong className="text-red-500">Disclaimer Legal!</strong> <strong className="text-[#8ba888]">ContractSmart</strong> este o platformă de software. <strong className="text-red-500">NU</strong> suntem o casă de avocatură și nu oferim consultanță juridică. Utilizarea platformei reprezintă acceptarea faptului că modelele generate necesită revizuirea de către un specialist.
          </p>
          <p className="text-[11px] text-slate-500 font-mono">© 2026 <strong className="text-[#8ba888]">ContractSmart</strong>. Powered by <strong className="text-[#8ba888]">ZenSoftWare</strong>. Toate drepturile rezervate legal.</p>
        </div>
      </div>
    </footer>
  );
}