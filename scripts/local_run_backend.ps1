# Backend launcher: http://localhost:8080 (needs JDK 21; repo targets Java 17, JDK 26 breaks the build)
. (Join-Path $PSScriptRoot "Load-LocalEnv.ps1")
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.11"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
Set-Location -LiteralPath (Join-Path (Split-Path -Parent $PSScriptRoot) "backend")
mvn spring-boot:run
