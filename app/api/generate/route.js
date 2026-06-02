import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { materi } = await req.json();

    if (!materi) {
      return NextResponse.json({ error: "Materi kosong" }, { status: 400 });
    }

    // --- SENJATA RAHASIA: MENGAKTIFKAN MODE JSON RESMI ---
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json", // Memaksa AI HANYA mengeluarkan JSON valid
      }
    });
    
    // Prompt sekarang jauh lebih sederhana karena formatnya sudah dikunci sistem
    const prompt = `Ekstrak istilah-istilah penting beserta deskripsinya dari materi berikut:\n\n"${materi}"\n\nKeluarkan sebagai array berisi objek dengan struktur persis seperti ini:\n[{"istilah": "nama istilah", "deskripsi": "penjelasan istilah tersebut"}]`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    // --- LAPISAN KEAMANAN EKSTRA ---
    // Membersihkan 'rogue backslash' (garis miring terbalik nyasar) yang sering bikin JSON error
    // Regex ini menghapus semua backslash (\) yang BUKAN merupakan escape character resmi JSON
    text = text.replace(/\\(?!["\\/bfnrtu])/g, "");

    const cards = JSON.parse(text);
    return NextResponse.json(cards);
    
  } catch (error) {
    console.error("AI Error detail:", error);
    return NextResponse.json({ error: "Gagal memproses data dari AI" }, { status: 500 });
  }
}