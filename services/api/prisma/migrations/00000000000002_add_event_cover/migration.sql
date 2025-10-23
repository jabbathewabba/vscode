-- Add coverImagePath and organizationId to Event
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "coverImagePath" text;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "organizationId" varchar;
ALTER TABLE "Event" ADD CONSTRAINT IF NOT EXISTS fk_event_organization FOREIGN KEY ("organizationId") REFERENCES "Organization"(id) ON DELETE SET NULL;
