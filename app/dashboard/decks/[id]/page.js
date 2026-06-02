'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

export default function IsiDeckPage({ params }) {
  const unwrappedParams = use(params);
  const deckId = unwrappedParams.id;

  const [flashcards, setFlashcards] = useState([]);
  const [materi, setMateri] = useState('');
  const [previewCards, setPreviewCards] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingBulk, setIsSavingBulk] = useState(false);

  const fetchFlashcards = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/flashcards?deckId=${deckId}`);
      if (res.ok) setFlashcards(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (deckId) fetchFlashcards();
  }, [deckId]);

  const handleGenerateAI = async () => {
    if (!materi) return alert("Masukkan materi dasar terlebih dahulu!");
    setIsGenerating(true);
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materi }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setPreviewCards(data); 
      } else {
        alert("Gagal generate dari AI. Coba ubah susunan materinya.");
      }
    } catch (error) {
      console.error("Generate error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditPreview = (index, field, value) => {
    const newCards = [...previewCards];
    newCards[index][field] = value;
    setPreviewCards(newCards);
  };

  const handleDeletePreview = (index) => {
    setPreviewCards(previewCards.filter((_, i) => i !== index));
  };

  const handleSaveBulk = async () => {
    if (previewCards.length === 0) return;
    setIsSavingBulk(true);

    // Pemetaan: Kita ubah 'istilah' & 'deskripsi' menjadi format yang diterima database
    const mappedCards = previewCards.map(card => ({
      pertanyaan: card.istilah,
      jawaban: card.deskripsi
    }));

    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckId, cards: mappedCards }),
      });

      if (res.ok) {
        setPreviewCards([]); 
        setMateri(''); 
        fetchFlashcards(); 
        alert("Flashcard Istilah & Deskripsi berhasil disimpan!");
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSavingBulk(false);
    }
  };
  // Fungsi untuk menghapus kartu dari Database
const handleDeleteStored = async (id) => {
  if (!confirm("Hapus kartu ini secara permanen?")) return;
  
  try {
    const res = await fetch(`/api/flashcards?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchFlashcards(); // Refresh daftar
  } catch (error) {
    alert("Gagal menghapus");
  }
};

// Fungsi untuk mengupdate kartu ke Database
const handleUpdateStored = async (id, p, j) => {
  try {
    const res = await fetch('/api/flashcards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, pertanyaan: p, jawaban: j }),
    });
    if (res.ok) alert("Perubahan disimpan!");
  } catch (error) {
    alert("Gagal mengupdate");
  }
};

// Fungsi untuk menangani perubahan input pada kartu yang sudah tersimpan
const handleStoredChange = (index, field, value) => {
  const updated = [...flashcards];
  updated[index][field === 'istilah' ? 'pertanyaan' : 'jawaban'] = value;
  setFlashcards(updated);
};

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-6">
          <Link href="/dashboard/decks" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Kembali
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Pembuat Flashcard AI ✨</h1>

        {/* --- BAGIAN 1: INPUT MATERI --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-2">1. Masukkan Materi Dasar</h2>
          <p className="text-sm text-gray-500 mb-4">Tempel teks materi. AI akan mengekstrak istilah-istilah penting beserta deskripsinya otomatis.</p>
          <textarea
            rows="5"
            value={materi}
            onChange={(e) => setMateri(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all mb-4"
            placeholder="Misal: Fotosintesis adalah proses tumbuhan mengubah sinar matahari menjadi energi..."
          ></textarea>
          <button
            onClick={handleGenerateAI}
            disabled={isGenerating || !materi}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? '⏳ Mengekstrak Istilah...' : '✨ Generate Istilah dengan AI'}
          </button>
        </div>

        {/* --- BAGIAN 2: REVIEW --- */}
        {previewCards.length > 0 && (
          <div className="bg-indigo-50 p-6 rounded-2xl border-2 border-indigo-100 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-indigo-900">2. Review Istilah (Belum Tersimpan)</h2>
              </div>
              <button
                onClick={handleSaveBulk}
                disabled={isSavingBulk}
                className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSavingBulk ? 'Menyimpan...' : `💾 Simpan ${previewCards.length} Kartu`}
              </button>
            </div>

            <div className="space-y-4">
              {previewCards.map((card, index) => (
                <div key={index} className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-start border border-indigo-100">
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Istilah</label>
                      <textarea
                        value={card.istilah}
                        onChange={(e) => handleEditPreview(index, 'istilah', e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white outline-none font-semibold text-indigo-900"
                        rows="2"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Deskripsi</label>
                      <textarea
                        value={card.deskripsi}
                        onChange={(e) => handleEditPreview(index, 'deskripsi', e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white outline-none"
                        rows="2"
                      />
                    </div>
                  </div>
                  <button onClick={() => handleDeletePreview(index)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg mt-6">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              ))}

              
            </div>
          </div>



        )}

        

        {/* --- BAGIAN 3: DATABASE TERSIMPAN (EDITABLE) --- */}
<h2 className="text-xl font-bold text-gray-800 mb-4 font-sans">Kelola Kartu Tersimpan</h2>
{isLoading ? (
  <p className="text-gray-500">Memuat kartu...</p>
) : flashcards.length === 0 ? (
  <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
    <p className="text-gray-500">Belum ada flashcard tersimpan.</p>
  </div>
) : (
  <div className="space-y-4">
    {flashcards.map((card, index) => (
      <div key={card.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex gap-4 items-center group hover:border-indigo-300 transition-all">
        <div className="text-gray-300 font-bold text-lg">{index + 1}</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div>
            <input
              type="text"
              value={card.pertanyaan}
              onChange={(e) => handleStoredChange(index, 'istilah', e.target.value)}
              className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 outline-none font-semibold text-gray-800 py-1"
              placeholder="Istilah..."
            />
          </div>
          <div>
            <input
              type="text"
              value={card.jawaban}
              onChange={(e) => handleStoredChange(index, 'deskripsi', e.target.value)}
              className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 outline-none text-gray-600 py-1"
              placeholder="Deskripsi..."
            />
          </div>
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => handleUpdateStored(card.id, card.pertanyaan, card.jawaban)}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
            title="Simpan Perubahan"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </button>
          <button 
            onClick={() => handleDeleteStored(card.id)}
            className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
            title="Hapus Permanen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>
    ))}
  </div>
)}
      </div>
    </div>
  );
}