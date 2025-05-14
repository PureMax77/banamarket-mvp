/*
  Warnings:

  - You are about to drop the `TempProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TempProductOption` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TempProduct" DROP CONSTRAINT "TempProduct_farmId_fkey";

-- DropForeignKey
ALTER TABLE "TempProductOption" DROP CONSTRAINT "TempProductOption_tempProductId_fkey";

-- DropTable
DROP TABLE "TempProduct";

-- DropTable
DROP TABLE "TempProductOption";
