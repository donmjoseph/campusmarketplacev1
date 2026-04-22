$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$zipPath = Join-Path $repoRoot "campus-marketplace-submission.zip"
$stagingRoot = Join-Path $env:TEMP ("campus-marketplace-submission-" + [Guid]::NewGuid().ToString("N"))

New-Item -ItemType Directory -Path $stagingRoot | Out-Null

$excludeDirectories = @(
  (Join-Path $repoRoot ".git"),
  (Join-Path $repoRoot ".claude"),
  (Join-Path $repoRoot "node_modules"),
  (Join-Path $repoRoot "client\node_modules"),
  (Join-Path $repoRoot "server\node_modules"),
  (Join-Path $repoRoot "client\dist")
)

$excludeFiles = @(
  "campus-marketplace-submission.zip",
  "npm-debug.log",
  "npm-debug.log.*",
  ".DS_Store"
)

$robocopyArguments = @(
  $repoRoot,
  $stagingRoot,
  "/E",
  "/R:1",
  "/W:1",
  "/NFL",
  "/NDL",
  "/NJH",
  "/NJS",
  "/XD"
) + $excludeDirectories + @("/XF") + $excludeFiles

& robocopy @robocopyArguments | Out-Null

if ($LASTEXITCODE -ge 8) {
  throw "Robocopy failed with exit code $LASTEXITCODE."
}

$envFile = Join-Path $stagingRoot "server\.env"
if (Test-Path $envFile) {
  Remove-Item -LiteralPath $envFile -Force
}

if (Test-Path $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

Compress-Archive -Path (Join-Path $stagingRoot "*") -DestinationPath $zipPath -Force
Remove-Item -LiteralPath $stagingRoot -Recurse -Force

Write-Host "Created submission zip: $zipPath"
