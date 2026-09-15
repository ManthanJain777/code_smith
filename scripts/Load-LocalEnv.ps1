# Loads KEY=VALUE pairs from the repo root .env into process env (no secret on command line).
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root ".env"
if (Test-Path -LiteralPath $envFile) {
  Get-Content -LiteralPath $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#\s][^=]*?)\s*=\s*(.*)\s*$') {
      $k = $matches[1].Trim()
      $v = $matches[2].Trim()
      [System.Environment]::SetEnvironmentVariable($k, $v, "Process")
    }
  }
}
