Param()

Write-Host "Starting Expo mobile app (dev)..." -ForegroundColor Cyan

# Navigate to repo root (two levels up from dev/)
Push-Location (Resolve-Path "..")

Write-Host "Ensure you've installed root dependencies: 'yarn install' from repo root." -ForegroundColor Yellow

Write-Host "Starting Expo (yarn dev:mobile)..." -ForegroundColor Cyan
yarn dev:mobile

Pop-Location
