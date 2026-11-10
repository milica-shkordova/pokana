-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "variantId" TEXT,
    "name" TEXT NOT NULL,
    "clientName" TEXT NOT NULL DEFAULT '',
    "clientContact" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "eventDate" DATETIME NOT NULL,
    "languages" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "theme" JSONB NOT NULL,
    "sections" JSONB NOT NULL,
    "rsvpEmails" JSONB NOT NULL,
    "rsvpDeadline" DATETIME,
    "rsvpTestedAt" DATETIME,
    "expectedGuests" INTEGER,
    "accessCode" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT true,
    "clientApproved" BOOLEAN NOT NULL DEFAULT false,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "isDefaults" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "expiresAt" DATETIME,
    "leadId" TEXT,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("accessCode", "clientApproved", "clientContact", "clientName", "content", "createdAt", "createdById", "eventDate", "expectedGuests", "expiresAt", "id", "isDemo", "languages", "leadId", "name", "noindex", "publishedAt", "rsvpDeadline", "rsvpEmails", "rsvpTestedAt", "sections", "slug", "status", "templateId", "theme", "updatedAt") SELECT "accessCode", "clientApproved", "clientContact", "clientName", "content", "createdAt", "createdById", "eventDate", "expectedGuests", "expiresAt", "id", "isDemo", "languages", "leadId", "name", "noindex", "publishedAt", "rsvpDeadline", "rsvpEmails", "rsvpTestedAt", "sections", "slug", "status", "templateId", "theme", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
CREATE UNIQUE INDEX "Event_leadId_key" ON "Event"("leadId");
CREATE INDEX "Event_status_eventDate_idx" ON "Event"("status", "eventDate");
CREATE INDEX "Event_templateId_idx" ON "Event"("templateId");
CREATE TABLE "new_Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'settings',
    "businessName" TEXT NOT NULL DEFAULT 'Momentelo',
    "contactEmail" TEXT NOT NULL DEFAULT 'hello@momentelo.mk',
    "phone" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT NOT NULL DEFAULT '',
    "logoMediaId" TEXT,
    "senderName" TEXT NOT NULL DEFAULT 'Momentelo покани',
    "fromAddress" TEXT NOT NULL DEFAULT 'rsvp@momentelo.mk',
    "subjectTemplate" TEXT NOT NULL DEFAULT 'Нова потврда: {гостин} — {настан}',
    "ccOwnerOnRsvp" BOOLEAN NOT NULL DEFAULT true,
    "clientDailyDigest" BOOLEAN NOT NULL DEFAULT false,
    "domain" TEXT NOT NULL DEFAULT 'momentelo.mk',
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
CREATE TABLE "new_Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "description" TEXT NOT NULL DEFAULT '',
    "demoEventId" TEXT,
    "defaultsEventId" TEXT,
    "layoutId" TEXT,
    "thumbLabel" TEXT,
    "thumbBg" TEXT,
    "thumbInk" TEXT,
    "previewMediaId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Template_demoEventId_fkey" FOREIGN KEY ("demoEventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Template_defaultsEventId_fkey" FOREIGN KEY ("defaultsEventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Template" ("category", "createdAt", "demoEventId", "description", "id", "name", "previewMediaId", "sortOrder", "status", "updatedAt") SELECT "category", "createdAt", "demoEventId", "description", "id", "name", "previewMediaId", "sortOrder", "status", "updatedAt" FROM "Template";
DROP TABLE "Template";
ALTER TABLE "new_Template" RENAME TO "Template";
CREATE UNIQUE INDEX "Template_demoEventId_key" ON "Template"("demoEventId");
CREATE UNIQUE INDEX "Template_defaultsEventId_key" ON "Template"("defaultsEventId");
CREATE INDEX "Template_sortOrder_idx" ON "Template"("sortOrder");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

