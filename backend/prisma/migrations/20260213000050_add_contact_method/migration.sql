/*
  Warnings:

  - Made the column `bookingRef` on table `Booking` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "lastContactMethod" TEXT,
ALTER COLUMN "bookingRef" SET NOT NULL;
