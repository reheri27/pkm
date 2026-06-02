-- Database schema for Hibah PKM LMS Sekolah
-- This file should be run on your MySQL database to set up the required tables

-- Drop tables if they exist (careful with this!)
-- DROP TABLE IF EXISTS `Flashcard`;
-- DROP TABLE IF EXISTS `Deck`;
-- DROP TABLE IF EXISTS `User`;

-- Create User table
CREATE TABLE IF NOT EXISTS `User` (
  `id` VARCHAR(36) PRIMARY KEY,
  `nama` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN', 'KEPALA_SEKOLAH', 'GURU') NOT NULL DEFAULT 'GURU',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Deck table
CREATE TABLE IF NOT EXISTS `Deck` (
  `id` VARCHAR(36) PRIMARY KEY,
  `judul` VARCHAR(255) NOT NULL,
  `deskripsi` LONGTEXT,
  `guruId` VARCHAR(36) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`guruId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
  INDEX `idx_guruId` (`guruId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Flashcard table
CREATE TABLE IF NOT EXISTS `Flashcard` (
  `id` VARCHAR(36) PRIMARY KEY,
  `pertanyaan` LONGTEXT NOT NULL,
  `jawaban` LONGTEXT NOT NULL,
  `deckId` VARCHAR(36) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`deckId`) REFERENCES `Deck`(`id`) ON DELETE CASCADE,
  INDEX `idx_deckId` (`deckId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
