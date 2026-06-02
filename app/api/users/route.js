import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';

// GET (Ambil Semua User)
export async function GET() {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT id, nama, email, role, createdAt FROM `User` ORDER BY createdAt DESC'
    );
    connection.release();
    return NextResponse.json(users);
  } catch (error) {
    console.error("GET User Error:", error);
    return NextResponse.json({ error: "Gagal memuat user" }, { status: 500 });
  }
}

// POST (Tambah User Baru)
export async function POST(request) {
  try {
    const { nama, email, password, role } = await request.json();
    
    // Hash password sebelum simpan
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const createdAt = new Date();

    const connection = await pool.getConnection();
    await connection.query(
      'INSERT INTO `User` (id, nama, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [id, nama, email, hashedPassword, role || "GURU", createdAt]
    );
    connection.release();

    return NextResponse.json({ id, nama, email, role: role || "GURU", createdAt }, { status: 201 });
  } catch (error) {
    console.error("POST User Error - Full Details:", {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      errno: error.errno
    });
    return NextResponse.json({ 
      error: "Gagal menambah user",
      details: process.env.NODE_ENV === 'development' ? error.message : "Email mungkin sudah terdaftar"
    }, { status: 500 });
  }
}

// PATCH (Edit User: Role, Nama, atau Password)
export async function PATCH(request) {
  try {
    const { id, nama, role, password } = await request.json();
    
    let updateQuery = 'UPDATE `User` SET ';
    let params = [];
    const updates = [];

    if (nama) {
      updates.push('nama = ?');
      params.push(nama);
    }
    if (role) {
      updates.push('role = ?');
      params.push(role);
    }
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      params.push(hashedPassword);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "Tidak ada data untuk diupdate" }, { status: 400 });
    }

    updateQuery += updates.join(', ') + ' WHERE id = ?';
    params.push(id);

    const connection = await pool.getConnection();
    await connection.query(updateQuery, params);
    const [updatedUser] = await connection.query('SELECT * FROM `User` WHERE id = ?', [id]);
    connection.release();

    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.error("PATCH User Error:", error);
    return NextResponse.json({ error: "Gagal memperbarui data" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const connection = await pool.getConnection();
    await connection.query('DELETE FROM `User` WHERE id = ?', [id]);
    connection.release();

    return NextResponse.json({ message: "Dihapus" });
  } catch (error) {
    console.error("DELETE User Error:", error);
    return NextResponse.json({ error: "Gagal menghapus user" }, { status: 500 });
  }
}