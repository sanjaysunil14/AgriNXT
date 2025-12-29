/*
  Warnings:

  - You are about to drop the column `total_amount` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `payments` table. All the data in the column will be lost.
  - Added the required column `collection_date` to the `collection_chits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyer_id` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyer_id` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farmer_id` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_date` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('UPI', 'BANK');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BookingStatus" ADD VALUE 'PENDING';
ALTER TYPE "BookingStatus" ADD VALUE 'CANCELLED';

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_invoice_id_fkey";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "quantity_kg" DOUBLE PRECISION,
ADD COLUMN     "vegetable_type" TEXT,
ALTER COLUMN "vegetables_summary" DROP NOT NULL,
ALTER COLUMN "estimated_weight" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "collection_chits" ADD COLUMN     "collection_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_priced" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location_lat" DOUBLE PRECISION,
ADD COLUMN     "location_lng" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "total_amount",
ADD COLUMN     "buyer_id" INTEGER NOT NULL,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "grand_total" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "line_items" JSONB,
ADD COLUMN     "pdf_url" TEXT;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "date",
ADD COLUMN     "buyer_id" INTEGER NOT NULL,
ADD COLUMN     "farmer_id" INTEGER NOT NULL,
ADD COLUMN     "payment_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "transaction_ref" TEXT,
ALTER COLUMN "invoice_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "payment_method" "PaymentMethod",
ADD COLUMN     "payment_value" TEXT;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
