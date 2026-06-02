import { useState } from 'react';
import './flashcard.css';

export default function Flashcard({ term, definition, onDelete, onEdit }) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // State untuk mode edit
  const [isEditing, setIsEditing] = useState(false);
  const [editTerm, setEditTerm] = useState(term);
  const [editDef, setEditDef] = useState(definition);

  const handleSave = (e) => {
    e.stopPropagation(); // Cegah kartu berputar
    onEdit(editTerm, editDef); // Kirim data baru ke page.js
    setIsEditing(false); // Matikan mode edit
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    // Kembalikan isian ke teks awal jika batal
    setEditTerm(term);
    setEditDef(definition);
    setIsEditing(false);
  };

  // --- TAMPILAN MODE EDIT ---
  if (isEditing) {
    return (
      <div className="flashcard-container cursor-default">
        {/* Desain Kotak Edit (mirip bagian depan kartu tapi statis) */}
        <div className="w-full h-full bg-white rounded-[20px] p-6 border-3 border-indigo-300 shadow-xl flex flex-col justify-center relative z-20">
          <input
            type="text"
            value={editTerm}
            onChange={(e) => setEditTerm(e.target.value)}
            className="w-full mb-3 p-2 border-b-2 border-indigo-100 focus:border-indigo-500 outline-none font-bold text-gray-800 text-center"
            placeholder="Istilah..."
          />
          <textarea
            value={editDef}
            onChange={(e) => setEditDef(e.target.value)}
            className="w-full h-24 p-3 border-2 border-indigo-100 rounded-lg focus:border-indigo-500 outline-none resize-none text-sm text-gray-700"
            placeholder="Definisi..."
          />
          <div className="flex gap-2 mt-4 justify-end">
            <button onClick={handleCancel} className="px-4 py-2 text-xs font-bold bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors">Batal</button>
            <button onClick={handleSave} className="px-4 py-2 text-xs font-bold bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white transition-colors">Simpan</button>
          </div>
        </div>
      </div>
    );
  }

  // --- TAMPILAN KARTU NORMAL ---
  return (
    <div className="flashcard-container" onClick={() => setIsFlipped(!isFlipped)}>
      
      {/* Wadah untuk tombol aksi*/}
      <div className="absolute bottom-1 right-1 z-20 flex gap-2">
        
        {/* TOMBOL EDIT (PENSIL) - Desain Elegan */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); 
            setIsEditing(true);
          }}
          className="bg-white text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 border border-gray-100 p-2 rounded-full shadow-md transition-all duration-200 hover:scale-110 active:scale-95"
          title="Edit kartu ini"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>

        {/* TOMBOL HAPUS (SAMPAH) - Desain Elegan */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="bg-white text-gray-300 hover:text-red-500 hover:bg-red-50 border border-gray-100 p-2 rounded-full shadow-md transition-all duration-200 hover:scale-110 active:scale-95"
          title="Hapus kartu ini"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}>
        {/* Sisi Depan */}
        <div className="flashcard-front">
          {/* <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Istilah</span> */}
          <h3 className="text-xl font-bold text-gray-800">{term}</h3>
          {/* <p className="mt-6 text-sm text-indigo-300 font-medium">Klik untuk melihat arti</p> */}
        </div>

        {/* Sisi Belakang */}
        <div className="flashcard-back">
          {/* <span className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-4">Definisi</span> */}
          <p className="text-lg leading-relaxed">{definition}</p>
        </div>
      </div>
    </div>
  );
}