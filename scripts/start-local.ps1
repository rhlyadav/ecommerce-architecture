$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$logs = Join-Path $root ".run-logs"

New-Item -ItemType Directory -Force -Path $logs | Out-Null

Write-Host "Starting Docker infrastructure..."
Set-Location $root
docker compose up -d mysql mongodb redis

Write-Host "Syncing Prisma schema..."
$env:DATABASE_URL = "mysql://user:userpass@localhost:3306/userdb"
Set-Location (Join-Path $root "services/user-service")
npm run prisma:push

Write-Host "Starting local services..."

$processes = @(
  @{
    Workdir = Join-Path $root "services/user-service"
    Command = "set PORT=4001&& set DATABASE_URL=mysql://user:userpass@localhost:3306/userdb&& npm run dev"
    Log = Join-Path $logs "user-service.log"
  },
  @{
    Workdir = Join-Path $root "services/product-service"
    Command = "set PORT=4002&& set MONGO_URL=mongodb://localhost:27017/productdb&& npm run dev"
    Log = Join-Path $logs "product-service.log"
  },
  @{
    Workdir = Join-Path $root "frontend/remote-app"
    Command = "npm run dev"
    Log = Join-Path $logs "remote-app.log"
  },
  @{
    Workdir = Join-Path $root "frontend/host-app"
    Command = "npm run dev"
    Log = Join-Path $logs "host-app.log"
  }
)

foreach ($proc in $processes) {
  $cmd = "/c $($proc.Command) > `"$($proc.Log)`" 2>&1"
  Start-Process -FilePath "cmd.exe" -ArgumentList $cmd -WorkingDirectory $proc.Workdir
}

Write-Host "Started local app stack."
Write-Host "Host app: http://localhost:3000"
Write-Host "Remote app: http://localhost:3001"
Write-Host "User service: http://localhost:4001/health"
Write-Host "Product service: http://localhost:4002/health"
