import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import pool from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

// --- METHOD GET ---
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "GURU") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const connection = await pool.getConnection();
    const [user] = await connection.query(
      'SELECT id FROM `User` WHERE email = ?',
      [session.user.email]
    );

    if (!user || user.length === 0) {
      connection.release();
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const [decks] = await connection.query(
      'SELECT * FROM `Deck` WHERE guruId = ? ORDER BY createdAt DESC',
      [user[0].id]
    );
    connection.release();

    return NextResponse.json(decks);
  } catch (error) {
    console.error("GET Decks Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// --- METHOD POST ---
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "GURU") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const body = await request.json();
    const { judul, deskripsi } = body;

    if (!judul) {
      return NextResponse.json({ error: "Judul wajib diisi" }, { status: 400 });
    }

    const connection = await pool.getConnection();
    const [user] = await connection.query(
      'SELECT id FROM `User` WHERE email = ?',
      [session.user.email]
    );

    if (!user || user.length === 0) {
      connection.release();
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const id = uuidv4();
    const now = new Date();

    console.log("Creating deck with:", { id, judul, deskripsi, guruId: user[0].id, now });

    await connection.query(
      'INSERT INTO `Deck` (id, judul, deskripsi, guruId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [id, judul, deskripsi || "", user[0].id, now, now]
    );

    const [newDeck] = await connection.query('SELECT * FROM `Deck` WHERE id = ?', [id]);
    connection.release();

    if (!newDeck || newDeck.length === 0) {
      console.error("Deck created but not found in SELECT");
      return NextResponse.json({ error: "Deck created but not found" }, { status: 500 });
    }

    return NextResponse.json(newDeck[0], { status: 201 });
  } catch (error) {
    console.error("POST Deck Error - Full Details:", {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      errno: error.errno,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: "Gagal membuat deck",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// --- METHOD DELETE ---
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "GURU") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID Deck tidak ditemukan" }, { status: 400 });
    }

    const connection = await pool.getConnection();

    // Hapus semua flashcard yang terkait terlebih dahulu, lalu hapus deck
    await connection.query('DELETE FROM `Flashcard` WHERE deckId = ?', [id]);
    await connection.query('DELETE FROM `Deck` WHERE id = ?', [id]);
    connection.release();

    return NextResponse.json({ message: "Deck dihapus" });
  } catch (error) {
    console.error("DELETE Deck Error:", error);
    return NextResponse.json({ error: "Gagal menghapus deck" }, { status: 500 });
  }
}