import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import * as BadWords from 'bad-words';
import { useAuth } from '../context/AuthContext';

const filter = new BadWords.Filter();

const Chat = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatContainerRef = React.useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*, profiles(username)').order('created_at', { ascending: true }).limit(50);
      setMessages(data || []);
    };
    fetchMessages();

    const channel = supabase.channel('public:messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
      setMessages(prev => [...prev, payload.new]);
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current && isOpen) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    const cleanContent = filter.clean(input);
    await supabase.from('messages').insert({ content: cleanContent, user_id: user.id });
    setInput('');
  };

  return (
    <div className="fixed top-0 left-0 h-full w-80 max-w-[90vw] bg-[#0a0a0c] z-[200] shadow-2xl border-r border-white/5 transition-transform duration-300 ease-out translate-x-0">
      <div className="bg-[#0a0a0c] p-4 h-full flex flex-col border-r border-white/5">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
          <h3 className="text-lg font-black text-[#F6CF80]">Global Chat</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white transition p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar mb-4 pr-2 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className="flex items-start gap-2">
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {(m.profiles?.username || 'Z')[0].toUpperCase()}
               </div>
               <div>
                  <span className="text-[#F6CF80] font-bold text-xs block">{(m.profiles?.username || 'Anonim')}</span>
                  <span className="text-white text-sm">{m.content}</span>
               </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 bg-black/50 p-2 rounded-xl">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyPress={e => e.key === 'Enter' && sendMessage()} 
            className="flex-1 bg-transparent p-2 outline-none text-sm"
            placeholder={user ? "Ketik pesan..." : "Login untuk chat"}
            disabled={!user}
          />
          <button onClick={sendMessage} disabled={!user} className="bg-[#F6CF80] p-2 rounded-lg text-black font-bold hover:bg-white transition disabled:opacity-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;