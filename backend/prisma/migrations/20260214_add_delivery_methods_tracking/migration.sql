-- AlterTable
ALTER TABLE "Quote" ADD COLUMN "deliveryMethods" TEXT[] DEFAULT ARRAY[]::TEXT[];
