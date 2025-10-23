# Events API

Local dev

1. Copy `.env.example` to `.env` and adjust values.
2. Start Postgres + Meilisearch via docker-compose:

```powershell
docker-compose -f ../../docker-compose.dev.yml up -d
```

3. Install dependencies and run API:

```powershell
pnpm install
pnpm dev
```

Prisma

- Generate client: `pnpm prisma:generate`
- Create migrations: `pnpm prisma:migrate`
