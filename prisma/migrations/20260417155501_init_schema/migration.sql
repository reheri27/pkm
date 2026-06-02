-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'KEPALA_SEKOLAH', 'GURU') NOT NULL DEFAULT 'GURU',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Deck` (
    `id` VARCHAR(191) NOT NULL,
    `judul` VARCHAR(191) NOT NULL,
    `guruId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Flashcard` (
    `id` VARCHAR(191) NOT NULL,
    `term` VARCHAR(191) NOT NULL,
    `definition` TEXT NOT NULL,
    `deckId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Deck` ADD CONSTRAINT `Deck_guruId_fkey` FOREIGN KEY (`guruId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flashcard` ADD CONSTRAINT `Flashcard_deckId_fkey` FOREIGN KEY (`deckId`) REFERENCES `Deck`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
