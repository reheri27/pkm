'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // Bersihkan error sebelumnya

    try {
      // Memanggil fungsi signIn bawaan NextAuth
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false, // Kita matikan redirect otomatis agar bisa menangkap error
      });

      if (res?.error) {
        setError(res.error);
      } else {
        
        router.push('/dashboard');
        router.refresh(); // Segarkan state agar profil pengguna terbaca
      }
    } catch (err) {
      setError('Terjadi kesalahan pada server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800">Selamat Datang</h2>
          <p className="text-gray-500 mt-2">Silakan masuk ke akun Anda</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm font-medium animate-pulse">
            {error}
          </div>
        )}

        {/* Form Section */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Alamat Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-gray-700 bg-gray-50 focus:bg-white"
              placeholder="guru@sekolah.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Kata Sandi</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-gray-700 bg-gray-50 focus:bg-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all transform duration-200 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 hover:shadow-lg hover:-translate-y-1 active:translate-y-0'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Memeriksa Akun...
              </span>
            ) : (
              'Masuk Sekarang'
            )}
          </button>
        </form>

      </div>
    </div>
  );
}