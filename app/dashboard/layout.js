import Navbar from '@/components/Navbar'; // Pastikan path import sesuai

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar akan selalu muncul di atas secara otomatis */}
      <Navbar />
      
      {/* Konten halaman (kotak animasi dsb) akan dirender di sini */}
      <main className="pt-8">
        {children}
      </main>
    </div>
  );
}