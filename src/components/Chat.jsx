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
    <div className="bg-[#16161a] p-4 rounded-xl border border-white/10 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-black">Global Chat</h3>
        <button onClick={onClose} className="text-white/50 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar mb-4 pr-2">
        {messages.map((m, i) => (
          <div key={i} className="mb-2">
            <span className="text-[#F6CF80] font-bold text-sm">{(m.profiles?.username || m.user_id?.substring(0, 8))}: </span>
            <span className="text-white text-sm">{m.content}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyPress={e => e.key === 'Enter' && sendMessage()} 
          className="flex-1 bg-black p-3 rounded-lg outline-none border border-white/10 focus:border-[#F6CF80]"
          placeholder={user ? "Ketik pesan..." : "Login untuk chat"}
          disabled={!user}
        />
        <button onClick={sendMessage} disabled={!user} className="bg-[#F6CF80] px-4 py-2 rounded-lg text-black font-bold hover:bg-white transition disabled:opacity-50">
          Kirim
        </button>
      </div>
    </div>
  );
};

export default Chat;