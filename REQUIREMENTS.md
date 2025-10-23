# Development prerequisites (local)

This file lists the tools and package steps you should install before running the monorepo locally.

System tools

- Node.js (LTS 18+ recommended)
- pnpm (v7+ recommended) — install via `npm i -g pnpm`
- Docker Desktop (for Postgres/PostGIS dev DB) — optional but recommended
- git

Global / handy tools

- npx (bundled with Node)
- ts-node (will be used by some scripts, installed as devDependency in services/api)

Repository setup steps

1. Clone repository and cd into workspace root.
2. Install workspace dependencies:

```powershell
pnpm install
```

3. Start dev DB (optional, uses docker-compose if `services/api/docker-compose.dev.yml` exists):

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
