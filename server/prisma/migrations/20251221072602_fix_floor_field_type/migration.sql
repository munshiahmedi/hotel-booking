/*
  Warnings:

  - You are about to alter the column `floor` on the `rooms` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `rooms` MODIFY `floor` INTEGER NULL;
