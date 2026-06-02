'use client'; 

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import LogoutButton from "../components/LogoutButton";

export default function Navbar() {
  const { data: session } = useSession();
  const userRole = session?.user?.role; // Ambil role dari session

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="p-2 bg-indigo-600 rounded-xl text-white group-hover:rotate-12 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <span className="font-black text-xl text-gray-800">Smart<span className="text-indigo-600">LMS</span></span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-bold text-gray-500 hover:text-indigo-600">Dashboard</Link>
          
          {/* Menu ini muncul untuk GURU dan ADMIN */}
          {(userRole === 'GURU' || userRole === 'ADMIN') && (
            <Link href="/dashboard/decks" className="text-sm font-bold text-gray-500 hover:text-indigo-600">Flashcard</Link>
          )}

          {/* PROTEKSI DI SINI: Menu Pengguna HANYA muncul jika role-nya ADMIN */}
          {userRole === 'ADMIN' && (
            <Link 
              href="/dashboard/users" 
              className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"
            >
              Pengguna
            </Link>
          )}
          
          <div className="h-6 w-[2px] bg-gray-200 rounded-full hidden md:block"></div>
                    
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}