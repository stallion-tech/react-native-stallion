param(
  [Parameter(Mandatory = $true)][string]$Node,
  [string]$MSBuild,
  [string]$NodeModules = (Join-Path $PSScriptRoot 'app\node_modules'),
  [string]$ProjectId = 'stallion-windows-e2e',
  [string]$AppToken = 'e2e-app-token',
  [string]$BaseUrl = 'http://127.0.0.1:43119',
  [string]$AppVersion = '1.0.0.0',
  [int]$TimeoutSeconds = 60
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($MSBuild)) {
  $msbuildCommand = Get-Command msbuild.exe -ErrorAction SilentlyContinue
  if ($msbuildCommand) {
    $MSBuild = $msbuildCommand.Source
  } else {
    $vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
    if (-not (Test-Path -LiteralPath $vswhere -PathType Leaf)) {
      throw 'Could not find MSBuild on PATH or locate Visual Studio Installer\vswhere.exe.'
    }

    $matches = @(& $vswhere -latest -products * -requires Microsoft.Component.MSBuild -find 'MSBuild\**\Bin\MSBuild.exe')
    if ($matches.Count -eq 0) {
      throw 'Visual Studio is installed, but no instance containing the MSBuild component was found.'
    }
    $MSBuild = $matches[0]
  }
}

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$app = Join-Path $PSScriptRoot 'app'
$stateRoot = Join-Path $env:LOCALAPPDATA 'StallionE2EApp'
$artifact = Join-Path $PSScriptRoot 'artifacts\bundle-b.zip'
$serverScript = Join-Path $PSScriptRoot 'mock-stallion-server.mjs'
$solution = Join-Path $app 'windows\StallionE2EApp.sln'
$project = Join-Path $app 'windows\StallionE2EApp\StallionE2EApp.vcxproj'

function Invoke-Native([string]$FilePath, [string[]]$ArgumentList, [string]$Description) {
  & $FilePath @ArgumentList
  if ($LASTEXITCODE -ne 0) {
    throw "$Description failed with exit code $LASTEXITCODE"
  }
}

function Resolve-BuiltExecutable {
  $expected = Join-Path $app 'windows\StallionE2EApp\bin\x64\Release\StallionE2EApp.exe'
  if (Test-Path -LiteralPath $expected -PathType Leaf) {
    return (Resolve-Path -LiteralPath $expected).Path
  }

  $matches = @(Get-ChildItem -LiteralPath (Join-Path $app 'windows') -Filter 'StallionE2EApp.exe' -File -Recurse |
    Where-Object { $_.FullName -match '[\\/]x64[\\/]Release[\\/]' })
  if ($matches.Count -eq 1) { return $matches[0].FullName }
  if ($matches.Count -gt 1) {
    throw "Build produced multiple x64 Release executables: $($matches.FullName -join ', ')"
  }
  throw "MSBuild succeeded but did not produce StallionE2EApp.exe. Expected: $expected"
}

function Wait-State([scriptblock]$predicate, [string]$description, [System.Diagnostics.Process]$process) {
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  do {
    if ($process -and $process.HasExited) {
      throw "Process exited with code $($process.ExitCode) while waiting for $description"
    }
    $metaPath = Join-Path $stateRoot 'meta.json'
    if (Test-Path $metaPath) {
      try {
        $meta = Get-Content -Raw $metaPath | ConvertFrom-Json
        if (& $predicate $meta) { return $meta }
      } catch { }
    }
    Start-Sleep -Milliseconds 250
  } while ((Get-Date) -lt $deadline)
  throw "Timed out waiting for $description"
}

function Wait-MockServer([System.Diagnostics.Process]$process) {
  $deadline = (Get-Date).AddSeconds(10)
  do {
    if ($process.HasExited) {
      throw "Mock server exited with code $($process.ExitCode). Port 43119 may already be in use."
    }
    try {
      Invoke-RestMethod "$BaseUrl/__state" -TimeoutSec 1 | Out-Null
      return
    } catch {
      Start-Sleep -Milliseconds 100
    }
  } while ((Get-Date) -lt $deadline)
  throw "Mock server did not become ready at $BaseUrl"
}

function Stop-StaleMockServer {
  try {
    $state = Invoke-RestMethod "$BaseUrl/__state" -TimeoutSec 1
  } catch {
    return
  }

  $isCurrentServer = $state.serverId -eq 'react-native-stallion-windows-e2e'
  $isLegacyServer = $null -ne $state.metadataRequests -and $null -ne $state.ranges -and
    $null -ne $state.rollback -and $null -ne $state.enabled
  if (-not $isCurrentServer -and -not $isLegacyServer) {
    throw "Port $(([uri]$BaseUrl).Port) is occupied by a service that is not the Stallion E2E mock server."
  }

  $port = ([uri]$BaseUrl).Port
  $processIds = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique)
  if ($processIds.Count -eq 0) {
    throw "The stale Stallion mock server responded at $BaseUrl, but its listener process could not be resolved."
  }

  foreach ($processId in $processIds) {
    Write-Host "Stopping stale Stallion mock server process $processId"
    Stop-Process -Id $processId -Force
  }

  $deadline = (Get-Date).AddSeconds(5)
  do {
    $listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if (-not $listener) { return }
    Start-Sleep -Milliseconds 100
  } while ((Get-Date) -lt $deadline)
  throw "Stale Stallion mock server did not release port $port"
}

Stop-StaleMockServer

if (Test-Path $stateRoot) {
  $resolved = Resolve-Path $stateRoot
  $local = Resolve-Path $env:LOCALAPPDATA
  if (-not $resolved.Path.StartsWith($local.Path, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to remove state outside LOCALAPPDATA: $resolved"
  }
  Remove-Item -LiteralPath $resolved.Path -Recurse -Force
}

$env:STALLION_E2E_NODE_MODULES = (Resolve-Path $NodeModules).Path
$env:NODE_PATH = $env:STALLION_E2E_NODE_MODULES
Invoke-Native -FilePath $Node -ArgumentList @((Join-Path $PSScriptRoot 'build-bundle-b.mjs')) -Description 'Bundle B build'
if (-not (Test-Path -LiteralPath $artifact -PathType Leaf)) {
  throw "Bundle build succeeded but did not produce the expected artifact: $artifact"
}
$rnw = Join-Path $env:STALLION_E2E_NODE_MODULES 'react-native-windows'
$buildArguments = @(
  $project, '/restore', '/p:Configuration=Release', '/p:Platform=x64',
  "/p:ReactNativeWindowsDir=$rnw\", "/p:SolutionDir=$(Split-Path $solution)\",
  "/p:SolutionPath=$solution", '/p:SolutionFileName=StallionE2EApp.sln',
  '/p:SolutionName=StallionE2EApp', '/p:SolutionExt=.sln', '/m', '/v:minimal',
  '/p:StallionEnabled=true', "/p:StallionProjectId=$ProjectId", "/p:StallionAppToken=$AppToken",
  "/p:StallionBaseUrl=$BaseUrl", "/p:StallionAppVersion=$AppVersion"
)
Invoke-Native -FilePath $MSBuild -ArgumentList $buildArguments -Description 'RNW E2E app build'
$exe = Resolve-BuiltExecutable
Write-Host "Using E2E executable: $exe"

$server = Start-Process -FilePath $Node -ArgumentList @($serverScript, '--artifact', $artifact) -WindowStyle Hidden -PassThru
try {
  Wait-MockServer $server
  $first = Start-Process -FilePath $exe -WindowStyle Hidden -PassThru
  try {
    Wait-State { param($meta) $meta.prodTempHash -eq 'e2e-release-b' } 'bundle B download' $first
    if ($first.HasExited) { throw 'Embedded bundle A exited during background download' }
    $meta = Get-Content -Raw (Join-Path $stateRoot 'meta.json') | ConvertFrom-Json
    if ($meta.currentProdSlot -ne 'DEFAULT_SLOT') { throw 'Bundle changed before restart' }
  } finally {
    if (-not $first.HasExited) { Stop-Process -Id $first.Id -Force }
  }

  $second = Start-Process -FilePath $exe -WindowStyle Hidden -PassThru
  try {
    Wait-State { param($meta) $meta.currentProdSlot -eq 'NEW_SLOT' -and $meta.lastSuccessfulHash -eq 'e2e-release-b' -and -not $meta.launchPending } 'bundle B successful launch' $second
    if ($second.HasExited) { throw 'Redeployed bundle B exited before successful launch' }
  } finally {
    if (-not $second.HasExited) { Stop-Process -Id $second.Id -Force }
  }
  Write-Host 'PASS Stallion RNW A-to-B end-to-end rollout'
} finally {
  if (-not $server.HasExited) { Stop-Process -Id $server.Id -Force }
}
