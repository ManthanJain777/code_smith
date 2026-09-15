# AI service launcher: http://localhost:8000
. (Join-Path $PSScriptRoot "Load-LocalEnv.ps1")
Set-Location -LiteralPath (Join-Path (Split-Path -Parent $PSScriptRoot) "ai-service")
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
