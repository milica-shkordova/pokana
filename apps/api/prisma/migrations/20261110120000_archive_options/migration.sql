-- Archive options: keep the invitation online while archived, and remember
-- the status before archiving so Restore can put it back.
ALTER TABLE "Event" ADD COLUMN "archivedOnline" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Event" ADD COLUMN "statusBeforeArchive" TEXT;
