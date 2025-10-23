# Development prerequisites (local - sqlite)

This file lists the tools and package steps you should install before running the monorepo locally using a local SQLite DB for development.

System tools

- Node.js (LTS 18+ recommended)
- pnpm (v7+ recommended) — install via `npm i -g pnpm`
- git

Local DB (recommended for quick dev)

By default the dev scripts use a local SQLite file so you can run the API without Docker. If you prefer Postgres/PostGIS you can still wire up Docker and set DATABASE_URL accordingly (see `services/api/docker-compose.dev.yml`).

Global / handy tools

- npx (bundled with Node)
- ts-node (will be used by some scripts, installed as devDependency in services/api)

Repository setup steps

1. Clone repository and cd into workspace root.
2. Install workspace dependencies:

```powershell
pnpm install
```

3. Initialize the local SQLite DB for the API (this creates `services/api/.env.local` with DATABASE_URL pointing to `file:./dev.db`):

```powershell
powershell -File dev/setup-db.ps1
```

4. Generate Prisma Client and apply migrations for the API service:

```powershell
cd services/api
npx prisma generate
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts   # optional
```

5. Start API and Mobile (in separate terminals):

```powershell
# Terminal 1 - API
powershell -File dev/start-api.ps1

# Terminal 2 - Mobile
powershell -File dev/start-mobile.ps1
```

Notes

- The start scripts are convenience helpers for development; they assume `pnpm` workspace commands `dev:api` and `dev:mobile` are defined in their respective `package.json` files.
- If you prefer a single terminal, use `dev/start-all.ps1` which opens two new PowerShell windows and runs the start scripts there.
