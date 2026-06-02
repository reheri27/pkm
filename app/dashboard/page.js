import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route"; 
import { redirect } from "next/navigation";
//import LogoutButton from "../components/LogoutButton"; 
import Link from "next/link";

// 1. KITA BUAT KOMPONEN KARTU DI SINI
// Komponen ini menerima "props" (data dinamis) seperti href, title, dll.
const DashboardCard = ({ href, title, subtitle, description, actionText, icon }) => {
  return (
    <Link 
      href={href} 
      className="group relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:border-indigo-200"
    >
      {/* Dekorasi Latar Belakang */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-50 rounded-full transition-transform duration-500 group-hover:scale-150 group-hover:bg-indigo-100/50" />

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          {/* Icon Container */}
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-3">
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-800 transition-colors duration-300 group-hover:text-indigo-600">
              {title}
            </h3>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300">
              {subtitle}
            </span>
          </div>
        </div>
        
        <p className="text-gray-500 leading-relaxed">
          {description}
        </p>

        {/* Indikator Panah */}
        <div className="mt-6 flex items-center text-indigo-600 font-bold text-sm opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
          {actionText} 
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </div>
      </div>
    </Link>
  );
};

// 2. HALAMAN UTAMA MENJADI SANGAT BERSIH
export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        
        <header className="flex justify-between items-center mb-10 border-b pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 mt-1">Platform Cerdas Manajemen Media Pembelajaran</p>
          </div>
          
        </header>

        <main>
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-8 text-indigo-900">
            <h2 className="text-xl font-bold mb-2">Selamat datang kembali, {session.user.nama}! 👋</h2>
            <p>Anda login menggunakan email: <strong>{session.user.email}</strong></p>
            <p className="mt-2">
              Hak Akses Anda saat ini adalah: 
              <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-200 text-indigo-800">
                {session.user.role}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Panggil Kartu untuk GURU */}
            {(session.user.role === "GURU" || session.user.role === "ADMIN") && (
              <DashboardCard 
                href="/dashboard/decks"
                title="Kelola Deck Flashcard"
                subtitle="Teacher Area"
                description="Buat, edit, atau hapus kumpulan kartu materi Anda untuk dipelajari oleh para siswa."
                actionText="Buka Materi"
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                }
              />
            )}
            
            {/* Panggil Kartu untuk ADMIN */}
            {session.user.role === "ADMIN" && (
              <DashboardCard 
                href="/dashboard/users"
                title="Manajemen Pengguna"
                subtitle="Admin Only"
                description="Kelola seluruh database user, ubah peran (role), atau hapus akun pengguna yang tidak aktif."
                actionText="Buka Pengaturan"
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                }
              />
            )}

          </div>
        </main>
      </div>
    </div>
  );
}