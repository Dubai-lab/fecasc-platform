-- DropForeignKey
ALTER TABLE "Quote" DROP CONSTRAINT "Quote_createdById_fkey";

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "adminCreatedById" TEXT,
ALTER COLUMN "createdById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_adminCreatedById_fkey" FOREIGN KEY ("adminCreatedById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
