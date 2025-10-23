Param()

Write-Host "Starting API and Mobile concurrently (two terminals recommended)." -ForegroundColor Cyan
Write-Host "This script will launch API first, then mobile. For best results run them in separate terminals." -ForegroundColor Yellow

# Resolve paths to scripts
$apiScriptPath = Resolve-Path "..\dev\start-api.ps1"
$mobileScriptPath = Resolve-Path "..\dev\start-mobile.ps1"

Write-Host "Starting API..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList '-NoExit', '-Command', "& '$apiScriptPath'"

Start-Sleep -Seconds 2

Write-Host "Starting Mobile..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList '-NoExit', '-Command', "& '$mobileScriptPath'"
