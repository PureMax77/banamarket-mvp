/*
  Warnings:

  - You are about to drop the column `bankAccountId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `BankAccount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BankAccount" DROP CONSTRAINT "BankAccount_userId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_bankAccountId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "bankAccountId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountHolder" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "bankName" TEXT;

-- DropTable
DROP TABLE "BankAccount";
