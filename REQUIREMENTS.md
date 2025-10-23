# Development prerequisites (local)

This file lists the tools and package steps you should install before running the monorepo locally.

System tools

- Node.js (LTS 18+ recommended)
- Yarn (v1.22+ recommended) — install via `npm i -g yarn`
- git

Global / handy tools

- npx (bundled with Node)
- ts-node (will be used by some scripts, installed as devDependency in services/api)

Repository setup steps

1. Clone repository and cd into workspace root.
2. Install workspace dependencies:

```powershell
yarn install
```

3. Setup local SQLite database (creates `.env.local` with DATABASE_URL):

```powershell
powershell -File dev/setup-db.ps1
```

4. The start script will automatically generate Prisma Client, push schema and seed the database.

5. Start API and Mobile (in separate terminals):

```powershell
# Terminal 1 - API
powershell -File dev/start-api.ps1

# Terminal 2 - Mobile
powershell -File dev/start-mobile.ps1
```

Notes

- The start scripts are convenience helpers for development; they use Yarn workspace commands `dev:api` and `dev:mobile`.
- If you prefer a single terminal, use `dev/start-all.ps1` which opens two new PowerShell windows for API and Mobile.
- The API uses SQLite by default (no Docker required). Database file is created at `services/api/dev.db`.
