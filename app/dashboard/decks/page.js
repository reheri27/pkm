'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DecksPage() {
  const [decks, setDecks] = useState([]);
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fungsi untuk mengambil data Deck dari API
  const fetchDecks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/decks');
      if (res.ok) {
        const data = await res.json();
        setDecks(data);
      }
    } catch (error) {
      console.error("Gagal mengambil deck", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Ambil data saat halaman pertama kali dimuat
  useEffect(() => {
    fetchDecks();
  }, []);

  // Fungsi untuk mengirim data Deck baru
  const handleCreateDeck = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ judul, deskripsi }),
      });

      if (res.ok) {
        setJudul('');
        setDeskripsi('');
        fetchDecks(); // Refresh daftar deck setelah berhasil menambah
      } else {
        alert("Gagal membuat deck");
      }
    } catch (error) {
      console.error("Terjadi kesalahan", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi untuk menghapus deck
  const handleDeleteDeck = async (id) => {
    if (!confirm('Yakin ingin menghapus deck ini? Semua kartu di dalamnya akan dihapus.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/decks?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDecks();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || 'Gagal menghapus deck');
      }
    } catch (error) {
      console.error('Gagal menghapus deck', error);
      alert('Terjadi kesalahan saat menghapus');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigasi Kembali */}
     

        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Kelola Deck Flashcard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Bagian Kiri: Form Buat Deck Baru (Create) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Buat Deck Baru</h2>
              <form onSubmit={handleCreateDeck} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Mata Pelajaran / Topik</label>
                  <input
                    type="text"
                    required
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                    placeholder="Contoh: Kosakata Bahasa Inggris"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Singkat</label>
                  <textarea
                    rows="3"
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                    placeholder="Materi kelas 7 pertemuan 2..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Deck'}
                </button>
              </form>
            </div>
          </div>

          {/* Bagian Kanan: Daftar Deck (Read) */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Daftar Deck Anda</h2>
              
              {isLoading ? (
                <div className="text-center py-10 text-gray-500">Memuat data...</div>
              ) : decks.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500">Belum ada deck yang dibuat.</p>
                  <p className="text-sm text-gray-400 mt-1">Gunakan form di samping untuk membuat deck pertama Anda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {decks.map((deck) => (
                    <div key={deck.id} className="p-5 border-2 border-gray-100 rounded-xl hover:border-indigo-200 transition-colors group">
                      <h3 className="font-bold text-lg text-gray-800 truncate">{deck.judul}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">
                        {deck.deskripsi || "Tidak ada deskripsi"}
                      </p>
                      <div className="mt-4 flex gap-2">
                        <Link href={`/dashboard/decks/${deck.id}`} className="block text-center px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-semibold rounded hover:bg-indigo-100 transition-colors w-full">
  Isi Kartu
</Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteDeck(deck.id)}
                          disabled={deletingId === deck.id}
                          className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-semibold rounded hover:bg-red-100 transition-colors disabled:opacity-60"
                        >
                          {deletingId === deck.id ? 'Menghapus...' : 'Hapus'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}