/*
  Warnings:

  - You are about to drop the column `bankName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "bankName",
ADD COLUMN     "bankType" TEXT NOT NULL DEFAULT '011';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bankName",
ADD COLUMN     "bankType" TEXT;
