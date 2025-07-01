/*
  Warnings:

  - The values [COMPLETED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING_PAYMENT', 'PREPARING', 'SHIPPING', 'DELIVERED', 'CANCELED', 'REFUNDED');
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT';
COMMIT;

-- CreateTable
CREATE TABLE "TempProduct" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "photo" TEXT[],
    "description" TEXT,
    "final_description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "farmId" INTEGER NOT NULL,

    CONSTRAINT "TempProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TempProductOption" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "price" INTEGER,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "tempProductId" INTEGER NOT NULL,

    CONSTRAINT "TempProductOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TempProduct" ADD CONSTRAINT "TempProduct_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TempProductOption" ADD CONSTRAINT "TempProductOption_tempProductId_fkey" FOREIGN KEY ("tempProductId") REFERENCES "TempProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
