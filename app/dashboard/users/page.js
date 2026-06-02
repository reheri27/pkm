'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';


export default function ManajemenUser() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Jika loading selesai dan ternyata bukan ADMIN, tendang ke dashboard
    if (status !== 'loading' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading' || session?.user?.role !== 'ADMIN') {
    return <p className="p-8 text-center font-bold">Memeriksa hak akses...</p>;
  }

  
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk form
  const [formData, setFormData] = useState({ id: '', nama: '', email: '', password: '', role: 'SISWA' });
  const [isEdit, setIsEdit] = useState(false);

  // --- STATE BARU UNTUK PENCARIAN & PAGINATION ---
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10; // Jumlah baris per halaman

  useEffect(() => { fetchUsers(); }, []);

  // Jika user mengetik di kotak pencarian, kembalikan ke halaman 1
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setIsEdit(true);
      setFormData({ id: user.id, nama: user.nama, email: user.email, password: '', role: user.role });
    } else {
      setIsEdit(false);
      setFormData({ id: '', nama: '', email: '', password: '', role: 'SISWA' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const method = isEdit ? 'PATCH' : 'POST';
    
    try {
      const res = await fetch('/api/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchUsers();
      } else {
        alert("Terjadi kesalahan. Pastikan email unik.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if(!confirm(`Hapus pengguna ${nama}?`)) return;
    const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchUsers();
  };

  // --- LOGIKA PENCARIAN & PAGINATION ---
  // 1. Filter data berdasarkan nama ATAU email
  const filteredUsers = users.filter(user => 
    user.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2. Hitung total halaman
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // 3. Potong array data sesuai halaman yang sedang aktif
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Tombol Tambah */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-800">Manajemen Pengguna 👥</h1>
            <p className="text-gray-500 mt-1">Kelola data {users.length} pengguna terdaftar.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 hover:-translate-y-1 transition-all"
          >
            + Tambah User
          </button>
        </div>

        {/* --- KOTAK PENCARIAN --- */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau email..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabel User */}
        <div className="bg-white rounded-t-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-5 text-sm font-bold text-gray-500">NAMA</th>
                <th className="p-5 text-sm font-bold text-gray-500">EMAIL</th>
                <th className="p-5 text-sm font-bold text-gray-500">ROLE</th>
                <th className="p-5 text-sm font-bold text-gray-500 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-500 font-medium">
                    Tidak ada pengguna yang ditemukan.
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-5 font-bold text-gray-800">{user.nama}</td>
                    <td className="p-5 text-gray-600">{user.email}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-5 flex justify-center gap-2">
                      <button onClick={() => handleOpenModal(user)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all" title="Edit Pengguna">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button onClick={() => handleDelete(user.id, user.nama)} disabled={user.role === 'ADMIN'} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30" title="Hapus Pengguna">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION CONTROLS --- */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center bg-white p-5 border border-t-0 border-gray-100 rounded-b-3xl shadow-sm">
            <span className="text-sm text-gray-500">
              Menampilkan <span className="font-bold text-gray-800">{indexOfFirstUser + 1}</span> hingga <span className="font-bold text-gray-800">{Math.min(indexOfLastUser, filteredUsers.length)}</span> dari <span className="font-bold text-gray-800">{filteredUsers.length}</span> hasil
            </span>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
              >
                Sebelumnya
              </button>
              
              <div className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-sm">
                Hal {currentPage} / {totalPages}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}

      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-black mb-6">{isEdit ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nama Lengkap</label>
                <input 
                  type="text" required
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</label>
                <input 
                  type="email" required disabled={isEdit}
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl mt-1 disabled:opacity-50"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {isEdit ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password'}
                </label>
                <input 
                  type="password" required={!isEdit}
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl mt-1"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Role</label>
                <select 
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl mt-1"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="SISWA">SISWA</option>
                  <option value="GURU">GURU</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit" disabled={isLoading}
                  className="flex-1 py-3 font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}