# Install dependencies for all microservices
# Run: .\install-all.ps1

Write-Host "Installing dependencies for all services..." -ForegroundColor Cyan
Write-Host ""

$services = @(
  "api-gateway",
  "user-service",
  "catalog-service",
  "trip-service",
  "order-service",
  "notification-service"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

foreach ($svc in $services) {
  $svcPath = Join-Path $scriptDir $svc
  Write-Host "  [npm install] $svc ..." -ForegroundColor Yellow
  Push-Location $svcPath
  npm install --silent
  if ($LASTEXITCODE -eq 0) {
    Write-Host "     OK" -ForegroundColor Green
  } else {
    Write-Host "     ERROR: Failed to install $svc!" -ForegroundColor Red
  }
  Pop-Location
}

Write-Host ""
Write-Host "Done! Now run .\start-all.ps1 to start all services." -ForegroundColor Green
