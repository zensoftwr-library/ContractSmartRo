'use client';
import { useState } from 'react';

export default function GlobalAIAssistant({ user }) {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState([]);
  const [aiInputMessage, setAiInputMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isAiOpen && (
        <div className="bg-[#12181D] border border-slate-800 shadow-lg rounded-lg w-[320px] sm:w-[380px] h-[500px] mb-4 flex flex-col overflow-hidden animate-fadeIn">
          <div className="bg-[#16221A] border-b border-[#8ba888]/20 p-4 flex justify-between items-center">
            <div>
              <h3 className="text-white font-bold text-sm">Consilier Smart AI</h3>
              <span className="text-[10px] text-[#8ba888]">Asistent Juridic & Comercial</span>
            </div>
            <button onClick={() => setIsAiOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B0F12]">
            {aiChatMessages.length === 0 ? (
              <div className="text-center text-slate-500 text-xs mt-10">
                <svg viewBox="0 0 240 40" className="w-[150px] h-[26px] block mx-auto">
                  <g transform="translate(0, 2)">
                    <path d="M24 6 C15 6, 8 13, 8 22 C8 31, 15 38, 24 38 C31 38, 37 33, 39 27" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round"/>
                    <path d="M16 21 L21 26 L32 12" fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <text x="48" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="20" fill="#FFFFFF" letterSpacing="-0.5">
                    Contract<tspan fill="#8ba888">Smart</tspan>
                  </text>
                </svg>
                <p className="mt-3">Salut! Te pot ajuta cu redactarea clauzelor, explicații din Codul Civil sau proceduri auto. Cu ce începem?</p>
              </div>
            ) : (
              aiChatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 text-xs shadow-md ${
                    msg.role === 'user' 
                      ? 'bg-[#8ba888] text-[#0B0F12] rounded-lg rounded-tr-sm' 
                      : 'bg-[#12181D] border border-slate-800 text-slate-300 rounded-lg rounded-tl-sm'
                  }`}>
                    {msg.role === 'user' ? msg.content : renderTextWithLinks(msg.content)}
                  </div>
                </div>
              ))
            )}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-[#12181D] border border-slate-800 text-slate-400 p-3 rounded text-xs flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-[#12181D] border-t border-slate-800">
            <form onSubmit={handleSendAiMessage} className="flex gap-2">
              <input
                type="text"
                value={aiInputMessage}
                onChange={(e) => setAiInputMessage(e.target.value)}
                placeholder="Scrie o întrebare..."
                className="flex-1 bg-[#0B0F12] border border-slate-700 rounded px-3 py-2 text-xs text-white outline-none focus:border-[#8ba888]"
              />
              <button type="submit" disabled={aiLoading || !aiInputMessage.trim()} className="bg-[#8ba888] text-black px-3 py-2 rounded font-bold disabled:opacity-50 hover:opacity-90">
                ➤
              </button>
            </form>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setIsAiOpen(!isAiOpen)} 
        className="w-14 h-14 bg-[#8ba888] rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform border-4 border-[#0B0F12]"
      >
        <span className="text-2xl">{isAiOpen ? '✕' : '💬'}</span>
      </button>
    </div>
  );
}