Param()

Write-Host "Starting API (NestJS) in development..." -ForegroundColor Cyan

# Setup DATABASE_URL for local SQLite before anything else
if (-not $env:DATABASE_URL) {
    Write-Host "No DATABASE_URL found in environment. Setting DATABASE_URL to local sqlite file './dev.db' for this session." -ForegroundColor Yellow
    $env:DATABASE_URL = "file:./dev.db"
} else {
    Write-Host "Using DATABASE_URL from environment." -ForegroundColor Cyan
}

# Navigate to services/api directory for Prisma setup
Push-Location (Resolve-Path "..\services\api")

Write-Host "Installing API dependencies (if needed)..." -ForegroundColor Yellow
if (Test-Path "..\..\node_modules") { Write-Host "Root node_modules exists, skipping install." } else { Write-Host "Run 'pnpm install' at repo root first if you haven't." }

Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "Pushing schema to dev DB (using db push for SQLite)..." -ForegroundColor Yellow
# Delete old dev.db if exists to start fresh
if (Test-Path "dev.db") {
    Write-Host "Removing old dev.db file to reset schema..." -ForegroundColor Yellow
    Remove-Item "dev.db" -Force
}

npx prisma db push --skip-generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "DB push failed; check schema errors." -ForegroundColor Red
}

Write-Host "Seeding DB (if seed script exists)..." -ForegroundColor Yellow
if (Test-Path "prisma/seed.ts") { npx ts-node prisma/seed.ts } else { Write-Host "No seed script found" }

Write-Host "Starting NestJS API (nest start --watch)..." -ForegroundColor Cyan
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host "tsconfig.json exists: $(Test-Path 'tsconfig.json')" -ForegroundColor Yellow
# Stay in services/api directory to run nest command
npx nest start --watch

# Cleanup: return to original directory when done
Pop-Location
