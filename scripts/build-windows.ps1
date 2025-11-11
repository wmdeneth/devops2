# PowerShell helper to build with Docker Compose
Set-StrictMode -Version Latest
Push-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Path)
Write-Host "Running docker compose build from PowerShell..."
docker compose build
Write-Host "Build finished."
Pop-Location