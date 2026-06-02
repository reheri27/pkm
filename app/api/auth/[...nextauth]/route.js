import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "../../../../lib/db";
import bcrypt from "bcryptjs";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "budi@sekolah.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // 1. Cari user di database berdasarkan email
          const connection = await pool.getConnection();
          const [users] = await connection.query(
            'SELECT * FROM `User` WHERE email = ?',
            [credentials.email]
          );
          connection.release();

          if (!users || users.length === 0) {
            throw new Error("Email tidak terdaftar!");
          }

          const user = users[0];

          // 2. Cocokkan password yang diketik dengan yang ada di database (terenkripsi)
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error("Password salah!");
          }

          // 3. Jika benar, kembalikan data user (jangan sertakan password!)
          return {
            id: user.id,
            nama: user.nama,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          throw new Error(error.message || "Autentikasi gagal");
        }
      }
    })
  ],
  callbacks: {
    // Memasukkan Role dan ID ke dalam token (JWT) agar bisa dibaca di seluruh halaman
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };