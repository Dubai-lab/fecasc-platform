-- AlterTable
ALTER TABLE "TeamMember" DROP COLUMN IF EXISTS "department",
ADD COLUMN "assignedServices" TEXT[] DEFAULT ARRAY[]::TEXT[];
