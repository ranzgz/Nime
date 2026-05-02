import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState({ username: '', avatar_url: '', bio: '' });
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setLoading(true);
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (prof) setProfile(prof);

      const { data: favs } = await supabase.from('favorites').select('*').eq('user_id', user.id);
      setFavorites(favs || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    
    setLoading(true);
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
    
    if (!uploadError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await supabase.from('profiles').upsert({ id: user.id, avatar_url: data.publicUrl });
      setProfile(p => ({ ...p, avatar_url: data.publicUrl }));
    }
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-[#F6CF80]">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <Navbar />
      <div className="pt-24 max-w-sm mx-auto px-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                <img src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username || 'Z'}`} className="w-24 h-24 rounded-full object-cover border-2 border-[#F6CF80]" />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold uppercase">Ganti</span>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
            </div>
            <h1 className="text-xl font-black mt-4">{profile.username || 'User ZaruSoft'}</h1>
            <p className="text-xs text-white/50 mt-1">{profile.bio || 'Anime lover.'}</p>
            
            <div className="flex justify-center gap-8 mt-6 w-full">
                <div className="flex flex-col items-center">
                    <span className="font-black text-lg">{favorites.length}</span>
                    <span className="text-[10px] text-white/50 uppercase">Koleksi</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="font-black text-lg">0</span>
                    <span className="text-[10px] text-white/50 uppercase">Followers</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="font-black text-lg">0</span>
                    <span className="text-[10px] text-white/50 uppercase">Following</span>
                </div>
            </div>
            <button onClick={() => setShowSettings(!showSettings)} className="mt-6 w-full bg-white/5 py-2 rounded-lg text-xs font-bold hover:bg-white/10 transition">Edit Profil</button>
        </div>

        {/* Settings Modal (Simplified) */}
        {showSettings && (
            <div className="mt-6 p-4 bg-[#16161a] rounded-xl border border-white/5">
                <h3 className="font-bold text-sm mb-4">Pengaturan</h3>
                <div className="space-y-3">
                    <label className="flex items-center justify-between text-xs">
                        Auto Next Episode
                        <input type="checkbox" className="accent-[#F6CF80]" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between text-xs">
                        Skip Intro/Outro
                        <input type="checkbox" className="accent-[#F6CF80]" defaultChecked />
                    </label>
                    <button onClick={signOut} className="w-full mt-4 text-red-500 font-bold text-xs">Keluar</button>
                </div>
            </div>
        )}

        {/* Content Tabs */}
        <div className="mt-8 border-t border-white/5 pt-4">
            <h2 className="text-xs font-bold uppercase text-white/50 mb-4 text-center">Koleksi Terakhir</h2>
            <div className="grid grid-cols-3 gap-1">
            {favorites.map(f => (
                <div key={f.anime_slug} className="aspect-[3/4] bg-[#16161a] overflow-hidden rounded-sm">
                <img src={f.poster_url} className="w-full h-full object-cover" />
                </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;