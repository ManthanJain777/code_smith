# Frontend launcher: http://localhost:3000
. (Join-Path $PSScriptRoot "Load-LocalEnv.ps1")
Set-Location -LiteralPath (Join-Path (Split-Path -Parent $PSScriptRoot) "frontend")
npm run dev
