/*
  Warnings:

  - You are about to drop the column `biometrickey` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "biometrickey",
ADD COLUMN     "biometricKey" TEXT;
