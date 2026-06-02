import pool from '@/lib/db';
import { notFound } from 'next/navigation';
import FlashcardViewer from './FlashcardViewer';

export default async function PlayDeckPage({ params }) {
  // 1. PERBAIKAN: Kita harus 'await' params terlebih dahulu di Next.js versi baru
  const resolvedParams = await params;
  const deckId = resolvedParams.id;

  // Pastikan ID ada
  if (!deckId) {
    notFound();
  }

  try {
    const connection = await pool.getConnection();

    // 2. Tarik data Deck dengan guru info
    const [deckResults] = await connection.query(
      `SELECT d.id, d.judul, d.deskripsi, d.createdAt, d.updatedAt, u.nama as guru_nama
       FROM \`Deck\` d
       JOIN \`User\` u ON d.guruId = u.id
       WHERE d.id = ?`,
      [deckId]
    );

    // Jika URL ngawur atau deck dihapus
    if (!deckResults || deckResults.length === 0) {
      connection.release();
      notFound();
    }

    const deckData = deckResults[0];

    // 3. Tarik seluruh flashcards untuk deck ini
    const [flashcards] = await connection.query(
      `SELECT id, pertanyaan, jawaban, deckId, createdAt, updatedAt
       FROM \`Flashcard\`
       WHERE deckId = ?
       ORDER BY createdAt ASC`,
      [deckId]
    );

    connection.release();

    // Transform data ke format yang sesuai dengan komponen
    const deck = {
      id: deckData.id,
      judul: deckData.judul,
      deskripsi: deckData.deskripsi,
      createdAt: deckData.createdAt,
      updatedAt: deckData.updatedAt,
      guru: { nama: deckData.guru_nama },
      flashcards: flashcards
    };

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-6">
        <FlashcardViewer deck={deck} flashcards={flashcards} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching deck:", error);
    notFound();
  }
}