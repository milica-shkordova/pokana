-- Rebrand Momentelo -> Pokanito: new defaults for Settings.
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'settings',
    "businessName" TEXT NOT NULL DEFAULT 'Pokanito',
    "contactEmail" TEXT NOT NULL DEFAULT 'hello@pokanito.mk',
    "phone" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT NOT NULL DEFAULT '',
    "logoMediaId" TEXT,
    "senderName" TEXT NOT NULL DEFAULT 'Pokanito покани',
    "fromAddress" TEXT NOT NULL DEFAULT 'rsvp@pokanito.mk',
    "subjectTemplate" TEXT NOT NULL DEFAULT 'Нова потврда: {гостин} — {настан}',
    "ccOwnerOnRsvp" BOOLEAN NOT NULL DEFAULT true,
    "clientDailyDigest" BOOLEAN NOT NULL DEFAULT false,
    "domain" TEXT NOT NULL DEFAULT 'pokanito.mk',
    "keepOnlineMonths" INTEGER NOT NULL DEFAULT 6,
    "defaultNoindex" BOOLEAN NOT NULL DEFAULT true,
    "defaultPassword" BOOLEAN NOT NULL DEFAULT false,
    "defaultLanguage" TEXT NOT NULL DEFAULT 'mk',
    "defaultRsvpDeadlineDays" INTEGER NOT NULL DEFAULT 14,
    "defaultMenuOptions" JSONB NOT NULL,
    "lastDigestAt" DATETIME
);
INSERT INTO "new_Settings" ("businessName", "ccOwnerOnRsvp", "clientDailyDigest", "contactEmail", "defaultLanguage", "defaultMenuOptions", "defaultNoindex", "defaultPassword", "defaultRsvpDeadlineDays", "domain", "fromAddress", "id", "instagram", "keepOnlineMonths", "lastDigestAt", "logoMediaId", "phone", "senderName", "subjectTemplate") SELECT "businessName", "ccOwnerOnRsvp", "clientDailyDigest", "contactEmail", "defaultLanguage", "defaultMenuOptions", "defaultNoindex", "defaultPassword", "defaultRsvpDeadlineDays", "domain", "fromAddress", "id", "instagram", "keepOnlineMonths", "lastDigestAt", "logoMediaId", "phone", "senderName", "subjectTemplate" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;


-- Existing rows that still hold the old Momentelo defaults get the new ones;
-- anything already customised is left alone.
UPDATE "Settings" SET "businessName" = 'Pokanito' WHERE "businessName" = 'Momentelo';
UPDATE "Settings" SET "contactEmail" = 'hello@pokanito.mk' WHERE "contactEmail" = 'hello@momentelo.mk';
UPDATE "Settings" SET "senderName" = 'Pokanito покани' WHERE "senderName" = 'Momentelo покани';
UPDATE "Settings" SET "fromAddress" = 'rsvp@pokanito.mk' WHERE "fromAddress" = 'rsvp@momentelo.mk';
UPDATE "Settings" SET "domain" = 'pokanito.mk' WHERE "domain" = 'momentelo.mk';
UPDATE "Event" SET "clientName" = 'Pokanito demo' WHERE "clientName" = 'Momentelo demo';
