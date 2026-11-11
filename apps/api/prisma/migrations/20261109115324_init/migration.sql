-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'editor',
    "passwordHash" TEXT,
    "inviteToken" TEXT,
    "inviteExpiresAt" DATETIME,
    "invitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "description" TEXT NOT NULL DEFAULT '',
    "demoEventId" TEXT,
    "previewMediaId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Template_demoEventId_fkey" FOREIGN KEY ("demoEventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
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
    "publishedAt" DATETIME,
    "expiresAt" DATETIME,
    "leadId" TEXT,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT,
    "kind" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalKey" TEXT NOT NULL,
    "optimizedKey" TEXT,
    "mime" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "bytes" INTEGER NOT NULL,
    "optimizedBytes" INTEGER,
    "durationSec" REAL,
    "focalX" REAL NOT NULL DEFAULT 0.5,
    "focalY" REAL NOT NULL DEFAULT 0.5,
    "alt" TEXT NOT NULL DEFAULT '',
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Media_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MediaUsage" (
    "mediaId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "slot" TEXT NOT NULL,

    PRIMARY KEY ("mediaId", "eventId", "slot"),
    CONSTRAINT "MediaUsage_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MediaUsage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Rsvp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "attending" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "guests" JSONB NOT NULL,
    "totalGuests" INTEGER NOT NULL,
    "adults" INTEGER,
    "children" INTEGER,
    "allergies" TEXT,
    "message" TEXT,
    "extra" JSONB NOT NULL,
    "locale" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailedAt" DATETIME,
    "emailError" TEXT,
    "emailAttempts" INTEGER NOT NULL DEFAULT 0,
    "nextEmailAt" DATETIME,
    "digestedAt" DATETIME,
    CONSTRAINT "Rsvp_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL DEFAULT 'contact-form',
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "templateId" TEXT,
    "eventDate" TEXT,
    "guestCount" INTEGER,
    "message" TEXT NOT NULL DEFAULT '',
    "stage" TEXT NOT NULL DEFAULT 'new',
    "unread" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Settings" (
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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_inviteToken_key" ON "User"("inviteToken");

-- CreateIndex
CREATE UNIQUE INDEX "Template_demoEventId_key" ON "Template"("demoEventId");

-- CreateIndex
CREATE INDEX "Template_sortOrder_idx" ON "Template"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Event_leadId_key" ON "Event"("leadId");

-- CreateIndex
CREATE INDEX "Event_status_eventDate_idx" ON "Event"("status", "eventDate");

-- CreateIndex
CREATE INDEX "Event_templateId_idx" ON "Event"("templateId");

-- CreateIndex
CREATE INDEX "Media_eventId_idx" ON "Media"("eventId");

-- CreateIndex
CREATE INDEX "MediaUsage_eventId_idx" ON "MediaUsage"("eventId");

-- CreateIndex
CREATE INDEX "Rsvp_eventId_createdAt_idx" ON "Rsvp"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "Rsvp_emailedAt_nextEmailAt_idx" ON "Rsvp"("emailedAt", "nextEmailAt");

-- CreateIndex
CREATE INDEX "Lead_stage_createdAt_idx" ON "Lead"("stage", "createdAt");
