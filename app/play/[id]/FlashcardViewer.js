'use client';

import { useState } from 'react';
import Link from 'next/link';

// Komponen mini agar setiap kartu bisa berputar secara mandiri
function FlashcardItem({ card }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      // TAMBAHAN ANIMASI DI SINI:
      // transition-all duration-300 hover:-translate-y-3 hover:scale-[1.02]
      className="perspective-1000 w-full aspect-[4/3] cursor-pointer group transition-all duration-300 ease-out hover:-translate-y-3 hover:scale-[1.02]" 
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* Sisi Depan (Istilah) */}
        {/* Tambahan: group-hover:shadow-2xl agar bayangannya membesar saat terapung */}
        <div className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-sm border-2 border-indigo-50 p-6 flex flex-col items-center justify-center backface-hidden group-hover:shadow-2xl transition-all duration-300">
          <span className="absolute top-4 left-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Istilah</span>
          <p className="text-xl md:text-2xl font-extrabold text-gray-800 text-center leading-snug">
            {card.pertanyaan}
          </p>
          <p className="absolute bottom-4 text-xs text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            Klik untuk melihat deskripsi
          </p>
        </div>

        {/* Sisi Belakang (Deskripsi) */}
        {/* Tambahan: group-hover:shadow-2xl */}
        <div className="absolute inset-0 w-full h-full bg-indigo-600 rounded-2xl shadow-lg border-2 border-indigo-700 p-6 flex flex-col items-center justify-center backface-hidden rotate-y-180 text-white group-hover:shadow-2xl transition-all duration-300">
          <span className="absolute top-4 left-4 text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Deskripsi</span>
          <p className="text-base font-medium text-center leading-relaxed overflow-y-auto w-full max-h-full scrollbar-hide">
            {card.jawaban}
          </p>
        </div>

      </div>
    </div>
  );
}
// Komponen Utama
export default function FlashcardViewer({ deck, flashcards }) {
  // Jika guru belum mengisi kartu sama sekali
  if (flashcards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Deck ini masih kosong</h2>
        <p className="text-gray-500 mb-8">Guru belum menambahkan flashcard ke dalam deck ini.</p>
        <Link href="/" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      
      {/* Header Info */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-800 mb-3">{deck.judul}</h1>
       <h2 className="text-2xl font-black text-gray-800 mb-3">
                    {deck.deskripsi || "Tidak ada deskripsi untuk deck ini."}
                  </h2>
        <p className="text-gray-500 font-medium">Oleh: {deck.guru.nama}</p>
        <div className="mt-4 inline-block px-5 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-full text-sm border border-indigo-100">
          Total {flashcards.length} Kartu
        </div>
      </div>

      {/* Area Papan Kartu (Grid) */}
      {/* Di HP: 1 Kolom, Tablet: 2 Kolom, Laptop: 3 Kolom */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {flashcards.map((card, index) => (
          <FlashcardItem key={card.id || index} card={card} />
        ))}
      </div>

      {/* Tombol Keluar di Bawah */}
      <div className="mt-16 text-center">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali ke Beranda
        </Link>
      </div>

    </div>
  );
}