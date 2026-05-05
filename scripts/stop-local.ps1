$ErrorActionPreference = "SilentlyContinue"

$root = Split-Path -Parent $PSScriptRoot

Write-Host "Stopping local Node processes for this project..."
Get-CimInstance Win32_Process |
  Where-Object {
    ($_.Name -eq "cmd.exe" -or $_.Name -eq "node.exe" -or $_.Name -eq "powershell.exe") -and
    $_.CommandLine -match [regex]::Escape($root)
  } |
  ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force
  }

Write-Host "Stopping Docker infrastructure..."
Set-Location $root
docker compose stop mysql mongodb redis

Write-Host "Stopped local app stack."
