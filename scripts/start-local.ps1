$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$logs = Join-Path $root ".run-logs"

New-Item -ItemType Directory -Force -Path $logs | Out-Null

function Wait-ForPort {
  param(
    [Parameter(Mandatory = $true)]
    [string]$HostName,
    [Parameter(Mandatory = $true)]
    [int]$Port,
    [Parameter(Mandatory = $true)]
    [string]$Label,
    [int]$TimeoutSeconds = 90
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  while ((Get-Date) -lt $deadline) {
    if (Test-NetConnection -ComputerName $HostName -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue) {
      Write-Host "$Label is reachable on $HostName`:$Port"
      return
    }

    Start-Sleep -Seconds 2
  }

  throw "$Label did not become reachable on $HostName`:$Port within $TimeoutSeconds seconds."
}

Write-Host "Starting Docker infrastructure..."
Set-Location $root
docker compose up -d mysql mongodb redis
if ($LASTEXITCODE -ne 0) {
  throw "Docker infrastructure failed to start. Make sure Docker Desktop is running, then retry."
}

Write-Host "Waiting for infrastructure to become reachable..."
Wait-ForPort -HostName "localhost" -Port 3306 -Label "MySQL"
Wait-ForPort -HostName "localhost" -Port 27017 -Label "MongoDB"
Wait-ForPort -HostName "localhost" -Port 6379 -Label "Redis"

Write-Host "Syncing Prisma schema..."
$env:DATABASE_URL = "mysql://user:userpass@localhost:3306/userdb"
Set-Location (Join-Path $root "services/user-service")
cmd /c npm.cmd run prisma:push
if ($LASTEXITCODE -ne 0) {
  throw "Prisma schema sync failed after MySQL became reachable."
}

Write-Host "Starting local services..."

$processes = @(
  @{
    Workdir = Join-Path $root "services/user-service"
    Command = "set PORT=4001&& set DATABASE_URL=mysql://user:userpass@localhost:3306/userdb&& set REDIS_URL=redis://localhost:6379&& set PRODUCT_EVENTS_CHANNEL=product-events&& npm run dev"
    Log = Join-Path $logs "user-service.log"
  },
  @{
    Workdir = Join-Path $root "services/product-service"
    Command = "set PORT=4002&& set MONGO_URL=mongodb://localhost:27017/productdb&& set REDIS_URL=redis://localhost:6379&& set PRODUCT_EVENTS_CHANNEL=product-events&& npm run dev"
    Log = Join-Path $logs "product-service.log"
  },
  @{
    Workdir = Join-Path $root "services/chat-service"
    Command = "set PORT=4003&& set MONGO_URL=mongodb://localhost:27017/chatdb&& npm run dev"
    Log = Join-Path $logs "chat-service.log"
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
Write-Host "Chat service: http://localhost:4003/health"
