Param()

Write-Host "Local DB setup for development (SQLite)" -ForegroundColor Cyan

# Ensure services/api directory exists
$apiPath = (Resolve-Path "..\services\api")
Push-Location $apiPath

# Create .env.local with DATABASE_URL if not present
$envFile = ".env.local"
if (Test-Path $envFile) {
    Write-Host "Found existing $envFile - leaving unchanged." -ForegroundColor Yellow
} else {
    Write-Host "Creating $envFile with SQLite DATABASE_URL pointing to './dev.db'" -ForegroundColor Green
    $line = 'DATABASE_URL="file:./dev.db"'
    $line | Out-File -FilePath $envFile -Encoding UTF8
}

Write-Host "Local SQLite DB file will live at: $apiPath\dev.db" -ForegroundColor Cyan

Pop-Location

Write-Host "Done. You can now run the API start script which will use the local SQLite DB by default." -ForegroundColor Green
