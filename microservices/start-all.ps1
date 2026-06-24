# Start all microservices (Windows PowerShell)
# Run: .\start-all.ps1

Write-Host "Starting Bus Booking Microservices..." -ForegroundColor Cyan

$services = @(
  @{ Name = "user-service";         Dir = "user-service";         Port = 5001 },
  @{ Name = "catalog-service";      Dir = "catalog-service";      Port = 5002 },
  @{ Name = "trip-service";         Dir = "trip-service";         Port = 5003 },
  @{ Name = "order-service";        Dir = "order-service";        Port = 5004 },
  @{ Name = "notification-service"; Dir = "notification-service"; Port = 5005 },
  @{ Name = "api-gateway";          Dir = "api-gateway";          Port = 5000 }
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

foreach ($svc in $services) {
  $svcPath = Join-Path $scriptDir $svc.Dir
  Write-Host "  Starting $($svc.Name) on port $($svc.Port)..." -ForegroundColor Yellow
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$svcPath'; npm run dev" -WindowStyle Normal
  Start-Sleep -Milliseconds 800
}

Write-Host ""
Write-Host "All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "Health check URLs:" -ForegroundColor Cyan
Write-Host "  API Gateway:           http://localhost:5000/health"
Write-Host "  User Service:          http://localhost:5001/health"
Write-Host "  Catalog Service:       http://localhost:5002/health"
Write-Host "  Trip Service:          http://localhost:5003/health"
Write-Host "  Order Service:         http://localhost:5004/health"
Write-Host "  Notification Service:  http://localhost:5005/health"
