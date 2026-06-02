// import { PrismaClient } from "@prisma/client";

// const globalForPrisma = global;

// export const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient();

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

// Cek apakah sudah ada koneksi Prisma sebelumnya
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

// Jika sedang dalam mode development (bukan production), 
// simpan koneksi ini secara global agar tidak terduplikasi saat hot-reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}