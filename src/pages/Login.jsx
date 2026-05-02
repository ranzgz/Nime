import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const { signInWithGoogle, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [searchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(searchParams.get('mode') === 'register');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/home', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Registrasi berhasil! Silakan cek email Anda untuk konfirmasi.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-white p-4">
      <div className="bg-[#16161a] border border-white/5 p-8 rounded-3xl w-full max-w-sm shadow-2xl flex flex-col items-center">
        <img src="https://raw.githubusercontent.com/alip-jmbd/alipp/main/icon-rbg.png" alt="Logo" className="w-16 h-16 mb-6" />
        <h2 className="text-2xl font-black mb-6">{isRegister ? 'Daftar Akun' : 'Masuk ke ZaruSoft'}</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <input type="email" placeholder="Email" className="bg-black p-3 rounded-xl outline-none border border-white/5 focus:border-[#F6CF80]" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="bg-black p-3 rounded-xl outline-none border border-white/5 focus:border-[#F6CF80]" onChange={(e) => setPassword(e.target.value)} />
          <button className="bg-[#F6CF80] text-black font-black p-3 rounded-xl hover:bg-white transition">{isRegister ? 'Daftar Sekarang' : 'Masuk'}</button>
        </form>

        <div className="my-6 w-full flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-white/10"></div>
          <span className="text-xs text-white/40 font-bold">ATAU</span>
          <div className="flex-1 h-[1px] bg-white/10"></div>
        </div>

        <button onClick={signInWithGoogle} className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl font-bold hover:bg-white/10 transition">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.24 10.28V14.4h6.77c-.3 1.63-1.63 4.29-6.77 4.29-4.08 0-7.4-3.32-7.4-7.4s3.32-7.4 7.4-7.4c2.25 0 3.75.95 4.6 1.76l3.18-3.07C18.15 1.51 15.55 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c7.05 0 11.72-4.96 11.72-11.96 0-.81-.09-1.42-.2-2.04H12.24z"/></svg>
          Google
        </button>

        <p className="mt-6 text-sm text-white/50 cursor-pointer" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
        </p>
      </div>
    </div>
  );
};

export default Login;
