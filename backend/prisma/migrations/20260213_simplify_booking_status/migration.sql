-- Start transaction
BEGIN;

-- First, add new columns
ALTER TABLE "Booking" ADD COLUMN "bookingRef" TEXT;
ALTER TABLE "Booking" ADD COLUMN "clientConfirmEmailSent" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "internalNotes" TEXT;

-- Update existing bookings with unique booking references
UPDATE "Booking" SET "bookingRef" = "id" WHERE "bookingRef" IS NULL;

-- Add unique constraint
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_bookingRef_key" UNIQUE ("bookingRef");

-- Update status enum - First rename the old enum
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";

-- Create new enum with simplified values
CREATE TYPE "BookingStatus" AS ENUM ('NEW', 'ASSIGNED', 'AWAITING_CLIENT', 'COMPLETED');

-- Convert existing status values to new ones
ALTER TABLE "Booking" 
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "BookingStatus" USING (
    CASE 
      WHEN "status"::text = 'NEW' THEN 'NEW'::"BookingStatus"
      WHEN "status"::text = 'REVIEWING' THEN 'NEW'::"BookingStatus"
      WHEN "status"::text = 'ASSIGNED' THEN 'ASSIGNED'::"BookingStatus"
      WHEN "status"::text = 'IN_PROGRESS' THEN 'AWAITING_CLIENT'::"BookingStatus"
      WHEN "status"::text = 'PROPOSAL_SENT' THEN 'AWAITING_CLIENT'::"BookingStatus"
      WHEN "status"::text = 'COMPLETED' THEN 'COMPLETED'::"BookingStatus"
      WHEN "status"::text = 'CANCELLED' THEN 'COMPLETED'::"BookingStatus"
      ELSE 'NEW'::"BookingStatus"
    END
  ),
  ALTER COLUMN "status" SET DEFAULT 'NEW';

-- Drop old enum
DROP TYPE "BookingStatus_old";

-- Commit transaction
COMMIT;
