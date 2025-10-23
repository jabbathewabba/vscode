# Events Monorepo (mobile-first)

This monorepo contains a mobile-first event app (Expo React Native) and a NestJS API backend. The structure is:

- apps/mobile - Expo React Native app (TypeScript, Expo Router, EAS-ready)
- services/api - NestJS REST API with Prisma and Postgres
- packages/* - shared packages (utilities, types)

Quick start

1. Install dependencies (requires pnpm):

```powershell
pnpm install
```

2. Start API (see `services/api/README.md` for details):

```powershell
pnpm dev:api
```

3. Start mobile app:

```powershell
pnpm dev:mobile
```

Environment variables

Create `.env.development` and `.env.production` in `apps/mobile` and `.env` in `services/api` with:

- API_URL
- STRIPE_PUBLISHABLE_KEY
- MAPS_PROVIDER

EAS build

Create EAS profiles in `apps/mobile/eas.json` (example in that folder). Use `eas build --platform android` and `eas build --platform ios` to create builds.


Conventions

- Commit messages: Conventional Commits (feat|fix|chore|docs|refactor)
- Branching: main for production, develop for integration, feature/* for features

Dev scripts

- `pnpm dev:mobile` - runs the Expo dev server for the mobile app (uses dev client)
- `pnpm dev:api` - runs the NestJS API in watch mode
- `pnpm db:migrate` - runs Prisma migrations for the API service

EAS notes

- To build an Android APK/AAB: run `eas build --platform android --profile production` from `apps/mobile`.
- To build an iOS build: run `eas build --platform ios --profile production` (requires Apple account and EAS setup).
- Use `eas submit` to submit to stores and `eas update` to publish OTA updates.

Environment overview

Place sensitive keys in the platform secrets (EAS secrets) or CI environment; do not commit `.env.production` to source control.

Contributing

- Use `pnpm install` at the repo root to install workspace dependencies.
- Follow Conventional Commits for commit messages. Pull requests should target `develop` and be reviewed before merging to `main`.

## DataModel (Postgres + PostGIS + Prisma)

This repo uses Prisma to model domain entities for events. Key models: `User`, `Organization`, `Venue`, `Event`, `TicketType`, `Order`, `Ticket`, `Promotion`, `WaitlistEntry`, `Media`, `Follow`, `Review`.

Highlights and conventions:

- Slugs: human-friendly slugs are stored on `Organization`, `Venue`, `Event` and must be unique. Slug generation should use a canonicalizer (lowercase, replace spaces with '-') and append a short unique suffix on collisions.
- Soft-delete: `deletedAt` timestamp field is present on entities where appropriate (User, Venue, Event). Use `deletedAt IS NULL` in queries to filter out soft-deleted rows.
- PostGIS: the `Venue` model stores `latitude` and `longitude` in Prisma. A DB-level `geom` geometry(POINT,4326) column is created via migration and indexed with a GIST index. Keep lat/lon in sync with `geom` via DB trigger or application logic when writing.
- Full-text & fuzzy search: trigram GIN indexes are created for `Event.title` and `Venue.name` using `pg_trgm` for fast fuzzy matching.
- Indexes: `Event.startAt` and `Event.status` have B-tree indexes for fast filtering.
- Uniqueness: `Ticket.serial` and `Ticket.qrPayload` are unique to avoid duplicates. `Order.paymentIntentId` is unique when present.
- Soft/Hard delete strategy: soft-delete by setting `deletedAt`; periodically run cleanup tasks to hard-delete older soft-deleted records if required.

Spatial query examples (Postgres SQL):

- Radius search (events by venue within 5 km):

```sql
SELECT v.*, e.*
FROM "Venue" v
JOIN "Event" e ON e."venueId" = v.id
WHERE ST_DWithin(v.geom, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radius_meters);
```

- Ordering by distance:

```sql
SELECT v.*, ST_Distance(v.geom::geography, ST_SetSRID(ST_MakePoint(:lng, :lat),4326)::geography) as distance_m
FROM "Venue" v
ORDER BY distance_m ASC
LIMIT 50;
```

Migration notes:

- A migration is included that enables `postgis` and `pg_trgm`, adds a `geom` column to `Venue`, populates it from lat/lon where available and creates trigram and spatial indexes. After running `prisma migrate dev`, consider adding a DB trigger to keep `geom` and lat/lon in sync on updates.

Seeding:

- A minimal seed script is included under `services/api/prisma/seed.ts`. Run it with `pnpm --filter ./services/api prisma:seed` after generating the Prisma client.

## Event Flow & Uploads

Endpoints (examples):

- POST /events  (protected, roles ORGANIZER/ADMIN) — create draft event
	- body JSON example:
	```json
	{
		"title": "My Event",
		"description": "...",
		"startAt": "2025-11-10T19:00:00.000Z",
		"endAt": "2025-11-10T22:00:00.000Z",
		"capacity": 200,
		"venueId": "..."
	}
	```

- PATCH /events/:id — update draft
- POST /events/:id/publish — validate and set status=PUBLISHED (must have at least one TicketType)
- POST /events/:id/archive — set status=ARCHIVED

Uploads:

- POST /uploads (form-data, field `file`) — stores file in `services/api/uploads/events/{eventId}` and returns `{ path: "/static/events/{eventId}/{filename}" }`.
- Static files are served under `/static/*` mapping to `services/api/uploads`.
- File size limit: 2MB by default (configurable in `local.storage.ts`).

Storage cleanup:

- Script to remove uploads: `node services/api/scripts/clean_uploads.ts` (or run via ts-node).

Prisma migration commands (apply schema changes and run migrations):

```powershell
cd services/api
npx prisma migrate dev --name add_event_cover
npx prisma generate
npx ts-node prisma/seed.ts

## Ticketing

Local ticketing features:

- Models: `TicketType`, `Order`, `Ticket`, `Promotion`, `WaitlistEntry`, `Reservation`.
- QR generation: server creates PNG under `services/api/uploads/qr/{ticketId}.png` and PDF under `.../qr/{ticketId}.pdf`.
- QR payload structure: `{ ticketId, nonce, sig }` where `sig` = HMAC_SHA256(JSON(payload), JWT_SECRET). Server signs payload on ticket creation and regenerates nonce on opening ticket detail.
- Reservation window: manual endpoint `POST /waitlist/:eventId/notify-next` creates a Reservation valid 10 minutes for the next waitlist user.
- Anti-screenshot: client rotates nonce and server issues signed payloads; recommend using short-lived nonce and rotating on each view.

Testing orders:

- Use `/tickets/order` to create fake orders. The server will create tickets, generate QR PNG/PDF and populate `qrPayload` with signed payload.

## Pagamenti (MockPay)

Questo progetto include un processore fittizio locale chiamato MockPay.

- Endpoint per checkout session (server crea `Order` con status `PENDING`):
	- POST `/checkout/session` body: `{ items: [{ ticketTypeId, qty }], promo?: code }` → returns `{ orderId, amount }`.
- Simulare pagamento:
	- POST `/mockpay/pay` body: `{ orderId, force?: 'success'|'fail', delayMs?: number, successRate?: number }`.
	- MockPay dopo un delay chiama internamente il webhook `POST /webhooks/mockpay` con payload `{ orderId, status: 'payment_succeeded'|'payment_failed' }`.
- Webhook handling:
	- `POST /webhooks/mockpay` aggiorna lo stato `Order` e alla conferma `PAID` crea ticket e genera QR PNG/PDF.
- Refunds:
	- POST `/orders/:id/refund` imposta order.status = REFUNDED e marca i ticket legati come `REFUNDED`.

Configurazione & test:

- Variabile `MOCKPAY_SUCCESS_RATE` o passare `successRate` al chiamare `/mockpay/pay` per probabilità.
- Per test chargeback: POST `/webhooks/mockpay` con body `{ orderId, type: 'DISPUTE_OPENED' }` per simulare disputa.

## Mappa & Ricerca

Client-side map + discovery:

- Mobile usa `react-native-maps` per mostrare marker degli eventi (provider di default). Se la chiave Google non è impostata i marker vengono comunque mostrati in dev.
- La schermata Map carica eventi con `/events?from=today&to=+7d` e calcola la distanza client-side usando la formula Haversine (`apps/mobile/src/lib/geo.ts`).
- Ricerca full-text locale con `Fuse.js` via `apps/mobile/src/features/search/useLocalSearch.ts`. L'indice viene inizializzato all'apertura della tab e aggiornato al cambiamento di query o filter.
- Filtri disponibili client-side: 7 giorni (default), categoria, fascia prezzo (client), distanza (slider km).
- Fallback se GPS non disponibile: la mappa centra su New York (40.7128, -74.0060) — puoi cambiare la città di sviluppo nel file `map.tsx`.
- Server ha endpoint opzionale `GET /search/suggest?q=` che ritorna fino a 5 suggerimenti cached in memoria (ricarica ogni 60s).

Testing offline:

- Puoi testare la mappa anche senza internet: popola il DB con eventi (seed) e avvia server localmente; la mobile app fetcherà `/events` dal localhost se `API_URL` punta al dev server.

## Media (Local galleries)

This project supports local-only media galleries stored on the filesystem under `services/api/uploads/org/{orgId}/events/{eventId}/`.

Storage & variants
- On upload the server generates three variants using `sharp`:
	- `thumb_320` (320px width)
	- `medium_800` (800px width)
	- `full` (original rotated/normalized JPEG)
- Files are saved as `{cuid}_{originalName}_thumb_320.jpg` etc and recorded in Prisma `Media` table with: `id, orgId, eventId, path, variant, width, height, face, status, metadata, createdAt`.

API
- POST `/media/upload` (roles ORGANIZER/ADMIN) — multipart form-data `file`, optional `orgId` and `eventId`. Returns created media records (one per variant).
- POST `/media/propose` (ATTENDEE) — submit UGC; limited to 5 pending items per event; records are created with `status=PENDING`.
- POST `/media/:id/approve` (ORGANIZER) — approve a pending media record.
- POST `/media/:id/reject` — reject and mark `status=REJECTED`.
- POST `/events/:id/media/link` — associate an existing media set to an event (admin/organizer helper endpoint).
- GET `/media/events/:id` — public listing of approved media for the event.

Limits & safety
- Accepted formats: jpg, jpeg, png. Max size: 3MB per file.
- No automatic face detection is performed; there is a manual boolean `face` flag in metadata that organizers can set when moderating.
- All media is stored locally—no CDN or external bucket is used.

Maintenance
- Cleanup orphan files with `node services/api/scripts/cleanup_media.ts` (requires DB access and will delete files not referenced in the `Media` table).

Mobile
- The mobile app includes a gallery view that lazy-loads thumbnails and shows a fullscreen viewer with pinch-to-zoom and native share. Thumbnails are loaded from `/static/{path}` where the server serves files from `services/api/uploads` under `/static`.

Cross-platform
- Paths and storage are local and cross-platform; ensure the server process has write permission to `services/api/uploads`.

## Growth & Promo (local)

This project includes a lightweight local growth toolkit for referrals, deep links and simulated push notifications.

Referrals
- `ReferralCode` model stores `code`, `ownerUserId`, `redeemedCount`.
- Endpoints:
	- `POST /referrals/generate` (authenticated) — creates a code for the user.
	- `POST /referrals/redeem` (authenticated) — redeems a code; grants local credit to redeemer and code owner (stored in `User.creditBalance`).
- Redemption rows are recorded in `Redemption`.

Deep links
- App deep link scheme: `partyapp://event/{slug}` and `partyapp://org/{slug}`.
- On web dev you can redirect to the scheme (if the client supports it) or show a lightweight preview page.
- Testing deep links on emulators:
	- Android (emulator or device):

```powershell
adb shell am start -a android.intent.action.VIEW -d "partyapp://event/my-event-slug"
```

	- iOS Simulator:

```powershell
xcrun simctl openurl booted "partyapp://event/my-event-slug"
```

Notifications (simulated push)
- A scheduler script (`services/api/scripts/schedule_notifications.ts`) can write Notification rows to the DB.
- The mobile app polls `/notifications` to show an in-app feed and uses `expo-notifications` to schedule local notifications (no external push provider required for testing).

Promo metrics & CSV export
- Minimal funnel metrics to track locally: views -> add-to-cart -> purchase. Store counts in a simple analytics table or export logs.
- You can export `Promotion`, `ReferralCode`, `Redemption`, and `Notification` tables to CSV using `psql` or a small Node script that queries and writes CSV.

Testing & local dev
- Everything is local-first: referrals, promo feed and notifications are stored in Postgres and served by the API. Use the scheduler script to create test notifications and `pnpm dev:api` + `pnpm dev:mobile` to exercise flows.

## Check-in (Staff offline)

This repo includes an offline-first check-in flow for staff devices (scanner tablets/phones) that works on LAN without cloud.

Server side
- Endpoint `POST /checkin/snapshot/:eventId` — returns a JSON snapshot containing minimal ticket info: `{ eventId, tickets: [{ id, serial, status, owner: { name } }], ts }` plus an HMAC signature. The signature is produced with `JWT_SECRET` and allows staff devices to validate authenticity.
- Endpoint `POST /checkin/sync` — accepts an array of outbox results `{ ticketId, status, scannedAt, deviceId }`, server de-duplicates and applies updates safely (skip already USED tickets or resolve by last-write-wins).
- Job `services/api/src/jobs/snapshot.job.ts` can write snapshot files to `services/api/snapshots` for manual download (USB/HTTP) or local file share.

Client (mobile staff)
- Download snapshot before event and import into local SQLite DB `tickets_snapshot.db` (table `tickets`).
- Staff app screens under `apps/mobile/app/staff/`:
	- `index.tsx` — main panel with Scan, Search, Sync buttons
	- `scan.tsx` — QR scanner (expo-camera or vision-camera) that parses QR payload `{ ticketId, nonceTs }` and checks local DB to validate serial and status. If valid, writes a row to `outbox` marking as USED locally.
	- `search.tsx` — manual search by serial using the local SQLite DB.
- Anti-replay: QR payload includes `nonceTs`; device checks difference with local clock. If difference > 15 minutes, shows a warning but allows 'panic' override.
- Feedback: torch toggle, vibration/sound on success/fail, and clear success/failure UI.
- Sync: when on the same LAN as the server, a sync worker POSTs `/checkin/sync` with outbox rows; server updates ticket statuses and returns results. Client removes synced outbox rows on success.

Conflict handling
- If two devices mark the same ticket as USED, the server will accept the first update and ignore subsequent (idempotent by ticketId), but will record audit logs for manual reconciliation.
- Recommended pre-event procedure: generate snapshot (`/checkin/snapshot/:eventId`), transfer to staff devices, run a quick scan test (simulate scans), and perform a final sync after event.

Export
- After event, use `psql` or small Node script to export check-in logs and tickets to CSV for reconciliation.

## Analytics (local)

This project provides local analytics computed from in-db tracking tables (`EventView`, `AddToCart`, `Purchase`). Data is computed server-side and can be exported to CSV.

Available endpoints
- `GET /analytics/events/:id/overview` — returns: sales per TicketType, total gross, total net (platform fee default 5%), counts for views/addToCart/purchases, conversion rate (purchases/views), and a no-show estimate (tickets not marked USED after event end).
- `GET /analytics/events/:id/timeseries?granularity=15m` — returns bucketed sums of purchases by the requested granularity (default 15 minutes).
- `GET /analytics/export.csv?eventId=...` — creates a CSV under `services/api/exports` and returns its path.

Formulas
- gross = sum(purchase.amount)
- net = gross * (1 - platformFee)
- conversion rate = purchases / views
- no-show estimate = count(tickets where status != USED) after event end

Notes on performance and accuracy
- Tracking tables are append-only. Add indexes on `createdAt`, `eventId`, and `ticketTypeId` (see Prisma schema) to keep queries fast.
- Data is near-real-time. For very large datasets, implement roll-ups or materialized views.

Demo data
- Seed demo traffic for charts and testing with:

```powershell
pnpm --filter ./services/api ts-node services/api/scripts/demo_traffic.ts
```

This script will populate `EventView`, `AddToCart`, and `Purchase` rows for the first two events in the DB.

Reset logs
- To reset tracking logs, you can truncate the tables or run a small script to delete rows older than a threshold:

```powershell
psql $DATABASE_URL -c "TRUNCATE event_view, add_to_cart, purchase;"
```

## Legal & Privacy (Local - Dev only)

This project includes a minimal, development-only compliance toolkit to demonstrate data portability and basic anonymization flows. It is NOT a production-ready privacy implementation.

What is stored locally (data matrix):

| Data | Purpose (demo) | Retention | Mock legal basis |
|---|---|---:|---|
| User profile (id, email, name, role) | Authentication, personalization | Until wipe or `prisma migrate reset` | Legitimate interest (demo)
| Orders (id, amount, status) | Accounting & ticket issuance | Indefinite (kept for accounting in demo) | Contract performance (demo)
| Tickets (serial, qrPayload, status) | Access control & check-in | Indefinite (kept with Orders) | Contract performance (demo)
| Media uploads (files) | Event galleries & moderation | Until deleted via cleanup script | Consent (demo)
| Analytics logs (views, addToCart, purchase) | Reporting & demo charts | Retain for demo analysis; periodically truncated | Legitimate interest (demo)

How to export your data (dev):

- From the mobile app profile screen tap "Export my data (dev)" which calls `GET /me/export` and downloads a JSON with `user`, `orders`, and `tickets`.

How to wipe/anonymize (dev):

- From the mobile app profile screen tap "Wipe my profile (dev)" which calls `POST /me/wipe` and will replace your email/name with placeholders while keeping orders/tickets for demo accounting reasons.
- To fully reset your local DB and files: from the API service run:

```powershell
cd services/api
npx prisma migrate reset --force
rm -rf uploads/*
```

Notes & limitations:

- These features are intended for local development and demos only. They implement a minimal anonymization flow for UX testing and do not delete financial records (orders/tickets) to preserve demo accounting flows.
- There is a built-in rate limiter on `/me/export` and `/me/wipe` to avoid abuse in local dev: exports are limited to 2/min and wipes to 1/min per user.
- No cookie banners or third-party trackers are included in this demo.








```




