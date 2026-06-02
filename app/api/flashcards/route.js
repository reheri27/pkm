import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import pool from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

// Ambil semua kartu dalam satu Deck tertentu
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const deckId = searchParams.get('deckId');

    if (!deckId) return NextResponse.json({ error: "ID Deck tidak ditemukan" }, { status: 400 });

    const connection = await pool.getConnection();
    const [flashcards] = await connection.query(
      'SELECT * FROM `Flashcard` WHERE deckId = ? ORDER BY createdAt ASC',
      [deckId]
    );
    connection.release();

    return NextResponse.json(flashcards);
  } catch (error) {
    console.error("GET Flashcard Error:", error);
    return NextResponse.json({ error: "Gagal mengambil flashcard" }, { status: 500 });
  }
}

// Simpan kartu (Bisa satuan atau masal)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "GURU") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const body = await request.json();
    const connection = await pool.getConnection();

    // JIKA MENYIMPAN MASAL (DARI AI)
    if (body.cards && Array.isArray(body.cards)) {
      const now = new Date();
      for (const card of body.cards) {
        const id = uuidv4();
        await connection.query(
          'INSERT INTO `Flashcard` (id, pertanyaan, jawaban, deckId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
          [id, card.pertanyaan, card.jawaban, body.deckId, now, now]
        );
      }
      connection.release();
      return NextResponse.json({ message: "Berhasil simpan masal" }, { status: 201 });
    }

    // JIKA MENYIMPAN SATUAN (MANUAL)
    const { deckId, pertanyaan, jawaban } = body;
    if (!deckId || !pertanyaan || !jawaban) {
      connection.release();
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const id = uuidv4();
    const now = new Date();

    await connection.query(
      'INSERT INTO `Flashcard` (id, pertanyaan, jawaban, deckId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [id, pertanyaan, jawaban, deckId, now, now]
    );

    const [newCard] = await connection.query('SELECT * FROM `Flashcard` WHERE id = ?', [id]);
    connection.release();

    return NextResponse.json(newCard[0], { status: 201 });
  } catch (error) {
    console.error("POST Flashcard Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan flashcard" }, { status: 500 });
  }
}

// EDIT KARTU YANG SUDAH ADA
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "GURU") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const { id, pertanyaan, jawaban } = await request.json();

    const connection = await pool.getConnection();
    const now = new Date();

    await connection.query(
      'UPDATE `Flashcard` SET pertanyaan = ?, jawaban = ?, updatedAt = ? WHERE id = ?',
      [pertanyaan, jawaban, now, id]
    );

    const [updatedCard] = await connection.query('SELECT * FROM `Flashcard` WHERE id = ?', [id]);
    connection.release();

    return NextResponse.json(updatedCard[0]);
  } catch (error) {
    console.error("PATCH Flashcard Error:", error);
    return NextResponse.json({ error: "Gagal mengupdate kartu" }, { status: 500 });
  }
}

// HAPUS KARTU
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "GURU") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const connection = await pool.getConnection();
    await connection.query('DELETE FROM `Flashcard` WHERE id = ?', [id]);
    connection.release();

    return NextResponse.json({ message: "Kartu dihapus" });
  } catch (error) {
    console.error("DELETE Flashcard Error:", error);
    return NextResponse.json({ error: "Gagal menghapus kartu" }, { status: 500 });
  }
}