'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BursaPage() {
  const [cursBnr, setCursBnr] = useState({ eur: '4.9752', usd: '4.5820', gbp: '5.8500', chf: '5.2010' });
  const [cryptoData, setCryptoData] = useState([
    { name: 'Bitcoin', symbol: 'BTC', price: '$64,230.00', change: '+2.4%', up: true },
    { name: 'Ethereum', symbol: 'ETH', price: '$3,450.20', change: '+1.8%', up: true },
    { name: 'Solana', symbol: 'SOL', price: '$145.60', change: '-0.5%', up: false },
    { name: 'MultiversX', symbol: 'EGLD', price: '$42.10', change: '+5.2%', up: true },
  ]);

  // Transformare corectă în Array pentru a evita eroarea fatală .map() -> 502
  const [indiciBursa, setIndiciBursa] = useState([
    { name: 'BET (România)', symbol: '^BET', points: '17,420.50', change: '+1.24%', up: true },
    { name: 'S&P 500 (US)', symbol: '^GSPC', points: '5,310.12', change: '+0.68%', up: true },
    { name: 'NASDAQ (US)', symbol: '^IXIC', points: '18,650.45', change: '-0.12%', up: false },
    { name: 'DAX (Germania)', symbol: '^GDAXI', points: '18,430.20', change: '+0.45%', up: true },
    { name: 'NIKKEI 225 (Japonia)', symbol: '^N225', points: '38,900.50', change: '-1.10%', up: false }
  ]);

  const [marfuri, setMarfuri] = useState([
    { name: 'Aur (Gold)', price: '$2,340.50 / oz', change: '+0.8%', up: true },
    { name: 'Argint (Silver)', price: '$28.40 / oz', change: '+1.1%', up: true },
    { name: 'Petrol (Crude Oil WTI)', price: '$82.30 / bbl', change: '-0.3%', up: false },
  ]);

  useEffect(() => {
    // Aducem ratele valutare live (Raportate la RON)
    fetch('https://open.er-api.com/v6/latest/EUR')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          setCursBnr({
            eur: data.rates.RON ? data.rates.RON.toFixed(4) : '4.9752',
            usd: (data.rates.RON / data.rates.USD) ? (data.rates.RON / data.rates.USD).toFixed(4) : '4.5820',
            gbp: (data.rates.RON / data.rates.GBP) ? (data.rates.RON / data.rates.GBP).toFixed(4) : '5.8500',
            chf: (data.rates.RON / data.rates.CHF) ? (data.rates.RON / data.rates.CHF).toFixed(4) : '5.2010'
          });
        }
      }).catch(() => {});

    // În producție aici poți chema /api/bursa pentru restul datelor
  }, []);

  // Helper-funcții sigure pentru a trage datele în Ticker fără erori
  const getIndexPoint = (sym) => indiciBursa.find(i => i.symbol === sym)?.points || '0.00';
  const getIndexChange = (sym) => indiciBursa.find(i => i.symbol === sym)?.change || '0.00%';

  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-200 font-sans pb-16 relative">
      
      {/* 📈 BARA TICKER DINAMICĂ LIVE */}
      <div className="w-full bg-[#12181D] border-b border-slate-800 text-[11px] text-slate-400 py-2 overflow-hidden whitespace-nowrap relative z-50 flex">
        <div className="animate-marquee font-mono flex gap-12 items-center shrink-0 min-w-full justify-around pr-6">
          <span>📈 <strong>EUR/RON:</strong> {cursBnr.eur} lei</span>
          <span>🇺🇸 <strong>USD/RON:</strong> {cursBnr.usd} lei</span>
          <span>📊 <strong>BET Index (BVB):</strong> {getIndexPoint('^BET')} ({getIndexChange('^BET')})</span>
          <span>📊 <strong>S&P 500 (US):</strong> {getIndexPoint('^GSPC')} ({getIndexChange('^GSPC')})</span>
          <span>📊 <strong>NASDAQ (US):</strong> {getIndexPoint('^IXIC')} ({getIndexChange('^IXIC')})</span>
        </div>
        <div className="animate-marquee font-mono flex gap-12 items-center shrink-0 min-w-full justify-around pr-6 select-none" aria-hidden="true">
          <span>📈 <strong>EUR/RON:</strong> {cursBnr.eur} lei</span>
          <span>🇺🇸 <strong>USD/RON:</strong> {cursBnr.usd} lei</span>
          <span>📊 <strong>BET Index (BVB):</strong> {getIndexPoint('^BET')} ({getIndexChange('^BET')})</span>
          <span>📊 <strong>S&P 500 (US):</strong> {getIndexPoint('^GSPC')} ({getIndexChange('^GSPC')})</span>
          <span>📊 <strong>NASDAQ (US):</strong> {getIndexPoint('^IXIC')} ({getIndexChange('^IXIC')})</span>
        </div>
      </div>

      {/* NAVBAR SIMPLIFICAT */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#0B0F12]/90 border-b border-slate-800 py-4 px-6 shadow-md">
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
          <Link href="/" className="w-[180px] h-[30px] flex items-center cursor-pointer">
            <svg viewBox="0 0 240 40" className="w-full h-full">
              <g transform="translate(0, 2)">
                <path d="M24 6 C15 6, 8 13, 8 22 C8 31, 15 38, 24 38 C31 38, 37 33, 39 27" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round"/>
                <path d="M16 21 L21 26 L32 12" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <text x="48" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="20" fill="#FFFFFF" letterSpacing="-0.5">
                Contract<tspan fill="#8ba888">Smart</tspan>
              </text>
            </svg>
          </Link>
          <Link href="/" className="text-xs font-bold text-slate-400 hover:text-[#8ba888] transition flex items-center gap-2">
            <span>&larr;</span> Înapoi la Dashboard
          </Link>
        </div>
      </nav>

      {/* AMBIENT BLOBS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute -top-[20%] -left-[10%] w-[100vw] h-[100vw] min-w-[600px] min-h-[600px] rounded-full animate-glow-1"
          style={{ background: 'radial-gradient(circle, rgba(139, 168, 136, 0.08) 0%, rgba(11, 15, 18, 0) 65%)' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12">
        {/* HEADER BURSĂ */}
        <div className="mb-10 text-center sm:text-left">
          <span className="bg-[#16221A] text-[#8ba888] border border-emerald-900/50 text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider">
            Terminal Financiar Live
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-4 tracking-tight">Piețe & <span className="text-[#8ba888]">Curs Valutar</span></h1>
          <p className="text-sm text-slate-400 mt-2">Urmărește evoluția activelor financiare globale și cursul de referință raportat la RON.</p>
        </div>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CURS VALUTAR (FOREX) - Ocupă o treime */}
          <div className="bg-[#12181D] rounded-2xl border border-slate-800/80 p-6 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-800/80 pb-4">
              <span className="text-2xl">💱</span>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider block">Curs Valutar BNR</h3>
                <p className="text-[11px] text-slate-500">Parități de bază în RON</p>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex justify-between items-center bg-[#0B0F12] p-4 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/20">EU</div>
                  <div>
                    <strong className="text-slate-200 block text-sm">Euro</strong>
                    <span className="text-[10px] font-mono text-slate-500">EUR/RON</span>
                  </div>
                </div>
                <strong className="text-[#8ba888] font-mono text-lg">{cursBnr.eur}</strong>
              </div>

              <div className="flex justify-between items-center bg-[#0B0F12] p-4 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-900/30 text-green-400 flex items-center justify-center font-bold text-xs border border-green-500/20">US</div>
                  <div>
                    <strong className="text-slate-200 block text-sm">US Dollar</strong>
                    <span className="text-[10px] font-mono text-slate-500">USD/RON</span>
                  </div>
                </div>
                <strong className="text-[#8ba888] font-mono text-lg">{cursBnr.usd}</strong>
              </div>

              <div className="flex justify-between items-center bg-[#0B0F12] p-4 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-900/30 text-purple-400 flex items-center justify-center font-bold text-xs border border-purple-500/20">UK</div>
                  <div>
                    <strong className="text-slate-200 block text-sm">Liră Sterlină</strong>
                    <span className="text-[10px] font-mono text-slate-500">GBP/RON</span>
                  </div>
                </div>
                <strong className="text-white font-mono text-lg">{cursBnr.gbp}</strong>
              </div>

              <div className="flex justify-between items-center bg-[#0B0F12] p-4 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-900/30 text-red-400 flex items-center justify-center font-bold text-xs border border-red-500/20">CH</div>
                  <div>
                    <strong className="text-slate-200 block text-sm">Franc Elvețian</strong>
                    <span className="text-[10px] font-mono text-slate-500">CHF/RON</span>
                  </div>
                </div>
                <strong className="text-white font-mono text-lg">{cursBnr.chf}</strong>
              </div>
            </div>
          </div>

          {/* INDICI BURSIERI & CRYPTO - Ocupă două treimi */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* INDICI GLOBALI */}
            <div className="bg-[#12181D] rounded-2xl border border-slate-800/80 p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-800/80 pb-4">
                <span className="text-2xl">📈</span>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider block">Indici Bursieri (Stock Market)</h3>
                  <p className="text-[11px] text-slate-500">Performanța piețelor globale</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {indiciBursa.map((index, i) => (
                  <div key={i} className="bg-[#0B0F12] border border-slate-800/60 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <strong className="text-sm text-slate-200 block">{index.symbol}</strong>
                        <span className="text-[10px] text-slate-500">{index.name}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${index.up ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-900/50' : 'bg-red-900/20 text-red-400 border border-red-900/50'}`}>
                        {index.change}
                      </span>
                    </div>
                    <div className="text-xl font-mono font-black text-white">
                      {index.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CRYPTO & MĂRFURI GRID SPLIT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CRYPTO */}
              <div className="bg-[#12181D] rounded-2xl border border-slate-800/80 p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-800/80 pb-3">
                  <span className="text-xl">₿</span>
                  <h3 className="text-[11px] font-bold text-white uppercase tracking-wider block">Cryptomonede</h3>
                </div>
                <div className="space-y-3">
                  {cryptoData.map((coin, i) => (
                    <div key={i} className="flex justify-between items-center bg-[#0B0F12] p-3 rounded-lg border border-slate-800/40">
                      <div>
                        <strong className="text-sm text-slate-200 block">{coin.symbol}</strong>
                        <span className="text-[10px] text-slate-500">{coin.name}</span>
                      </div>
                      <div className="text-right">
                        <strong className="text-sm font-mono text-white block">{coin.price}</strong>
                        <span className={`text-[10px] font-bold ${coin.up ? 'text-emerald-400' : 'text-red-400'}`}>{coin.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MĂRFURI */}
              <div className="bg-[#12181D] rounded-2xl border border-slate-800/80 p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-800/80 pb-3">
                  <span className="text-xl">🛢️</span>
                  <h3 className="text-[11px] font-bold text-white uppercase tracking-wider block">Mărfuri (Commodities)</h3>
                </div>
                <div className="space-y-3">
                  {marfuri.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-[#0B0F12] p-3 rounded-lg border border-slate-800/40">
                      <strong className="text-xs text-slate-300">{item.name}</strong>
                      <div className="text-right">
                        <strong className="text-sm font-mono text-white block">{item.price}</strong>
                        <span className={`text-[10px] font-bold ${item.up ? 'text-emerald-400' : 'text-red-400'}`}>{item.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}