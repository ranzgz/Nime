import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const Comments = ({ animeSlug, episodeId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const chatUserId = useMemo(() => {
    if (!user) return 'Anonim';
    let hash = 0;
    for (let i = 0; i < user.id.length; i++) {
        hash = user.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `User-${Math.abs(hash % 1000000)}`;
  }, [user]);

  useEffect(() => {
    const fetchComments = async () => {
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('anime_slug', animeSlug)
        .eq('episode_id', episodeId || 'general')
        .order('created_at', { ascending: false });
      setComments(data || []);
    };
    fetchComments();
  }, [animeSlug, episodeId]);

  const addComment = async () => {
    if (!newComment.trim() || !user) return;
    const { data, error } = await supabase.from('comments').insert({
      anime_slug: animeSlug,
      episode_id: episodeId || 'general',
      content: newComment,
      user_id: user.id,
      sender_id: chatUserId
    });
    if (!error) {
      setComments(prev => [{ content: newComment, sender_id: chatUserId, created_at: new Date() }, ...prev]);
      setNewComment('');
    }
  };

  return (
    <div className="mt-8 bg-[#16161a] p-6 rounded-2xl border border-white/5">
      <h3 className="font-black mb-4">Komentar</h3>
      {user ? (
        <div className="flex gap-2 mb-6">
          <input 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tulis komentar..."
            className="flex-1 bg-[#0a0a0c] p-3 rounded-xl outline-none text-sm"
          />
          <button onClick={addComment} className="bg-[#F6CF80] text-black px-4 py-2 rounded-xl font-bold text-sm">Kirim</button>
        </div>
      ) : <p className="text-white/50 text-xs mb-4">Login untuk berkomentar</p>}
      
      <div className="space-y-4">
        {comments.map((c, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-[#F6CF80]">{c.sender_id[0]}</div>
            <div>
              <p className="text-[#F6CF80] font-bold text-xs">{c.sender_id}</p>
              <p className="text-white/80 text-sm">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;