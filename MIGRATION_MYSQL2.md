# Migrasi dari Prisma ke MySQL2

Dokumentasi ini menjelaskan perubahan yang telah dilakukan untuk migrasi dari Prisma ke mysql2 sebagai driver database langsung.

## Perubahan yang Dibuat

### 1. Database Connection (`lib/db.js`)
- Mengganti Prisma Client dengan mysql2/promise
- Connection pool untuk performance lebih baik
- Konfigurasi melalui environment variables

### 2. Environment Variables
Ubah file `.env` sesuai format baru:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hibahpkm
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=your_key
```

### 3. API Routes yang Diupdate
Semua API routes telah diupdate untuk menggunakan mysql2 langsung:
- `app/api/users/route.js` - Manage users
- `app/api/decks/route.js` - Manage decks
- `app/api/flashcards/route.js` - Manage flashcards
- `app/api/auth/[...nextauth]/route.js` - Authentication

### 4. Landing Page (`app/page.js`)
- Menggunakan SQL JOIN untuk fetch data decks dengan guru info
- Menghilangkan dependency pada Prisma relations

## Setup Database

### Option 1: Manual SQL
Jalankan file `prisma/schema.sql` di MySQL:
```sql
mysql -u root -p hibahpkm < prisma/schema.sql
```

### Option 2: MySQL Workbench
1. Buka MySQL Workbench
2. Jalankan script dari `prisma/schema.sql`

### Option 3: CLI Tools
```bash
mysql -h localhost -u root -p -D hibahpkm < prisma/schema.sql
```

## Dependencies yang Dihapus
- `prisma`
- `@prisma/client`
- `@auth/prisma-adapter`

## Dependencies yang Ditambahkan
- `mysql2` (sudah ada)
- `uuid` (untuk generate ID)

## Testing Koneksi

Jalankan aplikasi:
```bash
npm run dev
```

Cek koneksi database dengan:
1. Buka http://localhost:3000
2. Coba login atau buat user baru
3. Cek console untuk error messages

## Catatan Penting

1. **UUID**: Menggunakan `uuid.v4()` untuk generate ID, bukan CUID seperti Prisma
2. **Dates**: Datetime di MySQL otomatis di-format oleh mysql2
3. **Connection Pool**: Limit 10 koneksi simultan (dapat diubah di `lib/db.js`)
4. **Query Strings**: Semua table names di-wrap dengan backtick untuk safety

## Migration dari Produksi

Jika Anda memiliki data existing di Prisma:
1. Export data dari Prisma database
2. Import ke database baru menggunakan schema di `prisma/schema.sql`
3. Mapping columns sesuai dengan struktur yang sama

## Troubleshooting

### Error: "connect ECONNREFUSED"
- Pastikan MySQL server running
- Check DB_HOST, DB_USER, DB_PASSWORD di .env

### Error: "Unknown database"
- Jalankan `CREATE DATABASE hibahpkm;` terlebih dahulu
- Atau ubah DB_NAME di .env

### Error: "Table doesn't exist"
- Jalankan schema.sql untuk create tables

## Development Tips

1. **Debugging**: Tambahkan `console.log()` di sekitar query untuk debugging
2. **Connection**: Pool otomatis manage koneksi, tidak perlu manual close
3. **Errors**: Selalu gunakan try-catch di API routes

---

Migrasi selesai! Aplikasi siap berjalan dengan mysql2. 🚀
