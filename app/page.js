import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import pool from '@/lib/db';

export default async function LandingPage() {
  // 1. Cek sesi login untuk tombol Navbar
  const session = await getServerSession(authOptions);

  // 2. Ambil data Deck asli dari database dengan join ke guru
  let decks = [];
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query(`
      SELECT d.id, d.judul, d.deskripsi, d.createdAt, u.nama as guru_nama
      FROM \`Deck\` d
      JOIN \`User\` u ON d.guruId = u.id
      ORDER BY d.createdAt DESC
    `);
    connection.release();
    
    // Transform results ke format yang sesuai dengan JSX
    decks = results.map(row => ({
      id: row.id,
      judul: row.judul,
      deskripsi: row.deskripsi,
      createdAt: row.createdAt,
      guru: { nama: row.guru_nama }
    }));
  } catch (error) {
    console.error("Error fetching decks:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* --- Navbar Section --- */}
      <nav className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="text-2xl font-extrabold text-indigo-600 tracking-tight flex items-center gap-2">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          LMS<span className="text-gray-800">Sekolah</span>
        </div>
        <div>
          {session ? (
            <Link href="/dashboard" className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              Masuk ke Dashboard
            </Link>
          ) : (
            <Link href="/login" className="px-5 py-2 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors">
              Login Guru / Admin
            </Link>
          )}
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-20 px-6 text-center border-b border-gray-100">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
          Belajar Lebih Interaktif dengan <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
            Flashcard Cerdas
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Jelajahi berbagai koleksi kartu belajar interaktif yang dirancang khusus oleh guru-guru kami. Tersedia untuk umum, bebas diakses kapan saja!
        </p>
      </header>

      {/* --- Content Section --- */}
      <main className="flex-grow max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Koleksi Flashcard Terbaru</h2>
        </div>

        {/* Cek jika belum ada data di database */}
        {decks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 text-lg">Belum ada koleksi flashcard yang dipublikasikan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {decks.map((deck) => (
              <div key={deck.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 text-xl font-bold">
                    {deck.judul.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{deck.judul}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                    {deck.deskripsi || "Tidak ada deskripsi untuk deck ini."}
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <p className="text-xs text-gray-400 mb-4">Oleh: {deck.guru.nama}</p>
                  <Link href={`/play/${deck.id}`} className="block w-full text-center py-2.5 bg-gray-50 text-indigo-600 font-semibold rounded-xl border border-indigo-100 hover:bg-indigo-50 transition-colors">
                    Mulai Belajar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} LMS Sekolah - Sistem Manajemen Flashcard
      </footer>
    </div>
  );
}