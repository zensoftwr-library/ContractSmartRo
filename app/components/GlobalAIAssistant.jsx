'use client';
import { useState, useRef, useEffect } from 'react';

export default function GlobalAIAssistant({ user }) {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState([]);
  const [aiInputMessage, setAiInputMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // ANCORĂ PENTRU AUTO-SCROLL
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiChatMessages, aiLoading]);

  // Funcție care transformă URL-urile text în link-uri click-uibile
  const renderTextWithLinks = (text) => {
    if (!text) return '';
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => 
      urlRegex.test(part) ? (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-900 font-bold hover:underline break-all">
          {part}
        </a>
      ) : (
        <span key={i} className="whitespace-pre-wrap">{part}</span>
      )
    );
  };

  const handleSendAiMessage = async (e) => {
    e.preventDefault();
    if (!aiInputMessage.trim()) return;
    const userMsg = { role: 'user', content: aiInputMessage };
    setAiChatMessages(prev => [...prev, userMsg]);
    setAiInputMessage('');
    setAiLoading(true);
    try {
      const res = await fetch('/api/consilier-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, history: aiChatMessages, userId: user?.id || null })
      });
      const data = await res.json();
      if (data.success) {
        setAiChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        alert(data.message || 'Eroare de la Asistentul AI.');
      }
    } catch {
      alert('Eroare de conexiune cu Asistentul Virtual.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      {isAiOpen && (
        <div className="bg-[#0B0F12]/95 backdrop-blur-xl border border-slate-700/50 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)] rounded-2xl w-[340px] sm:w-[400px] h-[550px] mb-5 flex flex-col overflow-hidden animate-fadeIn ring-1 ring-white/5 origin-bottom-right">
          
          {/* HEADER PREMIUM */}
          <div className="bg-gradient-to-r from-[#16221A] to-[#0B0F12] border-b border-[#8ba888]/20 p-4 flex justify-between items-center relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#8ba888]/10 blur-xl rounded-full pointer-events-none"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#12181D] border border-slate-700">
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-[#12181D] rounded-full"></span>
                <svg className="w-4 h-4 text-[#8ba888]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <div>
                <h3 className="text-white font-black text-sm tracking-wide">Consilier Smart AI</h3>
                <span className="text-[10px] text-[#8ba888] font-medium tracking-wider uppercase">Asistent Juridic Live</span>
              </div>
            </div>
            <button onClick={() => setIsAiOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700 p-1.5 rounded-full relative z-10">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          {/* ZONA DE MESAJE (Cu scroll fin) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-transparent custom-scrollbar">
            {aiChatMessages.length === 0 ? (
              <div className="text-center mt-8 p-6 bg-[#16221A]/30 border border-[#8ba888]/10 rounded-xl mx-2 shadow-inner">
                <svg viewBox="0 0 240 40" className="w-[140px] h-[24px] block mx-auto mb-4 opacity-80">
                  <g transform="translate(0, 2)">
                    <path d="M24 6 C15 6, 8 13, 8 22 C8 31, 15 38, 24 38 C31 38, 37 33, 39 27" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round"/>
                    <path d="M16 21 L21 26 L32 12" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <text x="48" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="20" fill="#FFFFFF" letterSpacing="-0.5">
                    Contract<tspan fill="#8ba888">Smart</tspan>
                  </text>
                </svg>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Salut! Sunt antrenat pe legislația la zi din România. Te pot ajuta cu redactarea clauzelor, explicații din Codul Civil sau proceduri auto. <br/><br/><span className="text-white font-medium">Cu ce începem astăzi?</span>
                </p>
              </div>
            ) : (
              aiChatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                  <div className={`max-w-[85%] px-4 py-3 text-[13px] shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-[#8ba888] to-[#7a9578] text-[#0B0F12] rounded-2xl rounded-tr-sm font-medium' 
                      : 'bg-[#16221A]/80 border border-[#8ba888]/20 text-slate-200 rounded-2xl rounded-tl-sm leading-relaxed whitespace-pre-wrap'
                  }`}>
                    {msg.role === 'user' ? msg.content : renderTextWithLinks(msg.content)}
                  </div>
                </div>
              ))
            )}
            
            {/* INDICATOR DE TASTARE (Loading) */}
            {aiLoading && (
              <div className="flex flex-col items-start gap-2 animate-fadeIn">
                <div className="bg-[#16221A]/80 border border-[#8ba888]/20 px-4 py-3.5 rounded-2xl rounded-tl-sm flex gap-1.5 items-center shadow-sm w-max">
                  <div className="w-1.5 h-1.5 bg-[#8ba888] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#8ba888] rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-[#8ba888] rounded-full animate-bounce delay-150"></div>
                </div>
                <span className="text-[10px] text-[#8ba888] font-medium px-2 animate-pulse">
                  ⏳ Se interoghează sursele oficiale, acest proces poate dura câteva secunde pentru acuratețe...
                </span>
              </div>
            )}
            
            {/* DIV INVIZIBIL PENTRU AUTO-SCROLL */}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT AREA */}
          <div className="p-3 bg-[#0B0F12] border-t border-slate-800/80">
            <form onSubmit={handleSendAiMessage} className="flex gap-2 items-end">
              <textarea
                rows="1"
                value={aiInputMessage}
                onChange={(e) => setAiInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendAiMessage(e);
                  }
                }}
                placeholder="Scrie o întrebare juridică..."
                className="flex-1 bg-[#12181D] border border-slate-700/60 rounded-xl px-4 py-3 text-xs text-white outline-none focus:ring-1 focus:ring-[#8ba888]/50 focus:border-[#8ba888] transition-all placeholder:text-slate-500 resize-none overflow-hidden max-h-24 custom-scrollbar"
                style={{ minHeight: '42px' }}
              />
              <button 
                type="submit" 
                disabled={aiLoading || !aiInputMessage.trim()} 
                className="bg-gradient-to-r from-[#8ba888] to-[#7a9578] text-[#0B0F12] h-[42px] px-4 rounded-xl flex items-center justify-center font-black disabled:opacity-30 hover:scale-105 active:scale-95 transition-all shadow-md shrink-0"
              >
                <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </form>
            <div className="text-center mt-2">
              <span className="text-[9px] text-slate-600 font-medium">Platformă asistată de Inteligență Artificială</span>
            </div>
          </div>
        </div>
      )}
      
      {/* BUTONUL PLUTITOR DE DESCHIDERE */}
      <button 
        onClick={() => setIsAiOpen(!isAiOpen)} 
        className="w-14 h-14 bg-gradient-to-r from-[#8ba888] to-[#6d8a6a] rounded-full shadow-[0_0_20px_rgba(139,168,136,0.3)] flex items-center justify-center hover:scale-110 hover:shadow-[0_0_25px_rgba(139,168,136,0.5)] active:scale-95 transition-all duration-300 border-[3px] border-[#0B0F12] text-black group relative"
      >
        {!isAiOpen && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-[#0B0F12]"></span>
          </span>
        )}
        {isAiOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
        ) : (
          <svg className="w-6 h-6 transform group-hover:-rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
        )}
      </button>
    </div>
  );
}