param(
  [ValidateSet("Debug", "Release")]
  [string]$Configuration = "Release",
  [ValidateSet("x64")]
  [string]$Platform = "x64",
  [string]$MSBuild,
  [string]$PublicSigningKeyFile,
  [switch]$BuildOnly,
  [switch]$CoverageBuild
)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function Resolve-MSBuild {
  if ($MSBuild) {
    return (Resolve-Path $MSBuild).Path
  }

  $command = Get-Command msbuild -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  $vswhere = Join-Path ${env:ProgramFiles(x86)} "Microsoft Visual Studio\Installer\vswhere.exe"
  if (Test-Path $vswhere) {
    $installation = & $vswhere -latest -products * -requires Microsoft.Component.MSBuild -property installationPath
    if ($installation) {
      $candidate = Join-Path $installation "MSBuild\Current\Bin\MSBuild.exe"
      if (Test-Path $candidate) {
        return $candidate
      }
    }
  }

  throw "MSBuild was not found. Run from a Visual Studio Developer PowerShell or pass -MSBuild."
}

$msbuildPath = Resolve-MSBuild
$nodePath = (Get-Command node -ErrorAction Stop).Source
$rnwPackage = & $nodePath -p "require.resolve('react-native-windows/package.json')"
if ($LASTEXITCODE -ne 0 -or -not $rnwPackage) {
  throw "react-native-windows could not be resolved from this package. Install dependencies first."
}
$rnw = Split-Path $rnwPackage -Parent
$solutionDir = (Join-Path $root "windows") + "\"
$project = Join-Path $root "windows\StallionTests\StallionTests.vcxproj"
$compilerCompatibilityProps = Join-Path $root "tools\stallion-test-compiler-compatibility.props"

$buildArguments = @(
  $project,
  "/restore",
  "/p:Configuration=$Configuration",
  "/p:Platform=$Platform",
  "/p:StallionPlatform=windows",
  "/p:ReactNativeWindowsDir=$rnw\",
  "/p:SolutionDir=$solutionDir",
  "/p:SolutionPath=${solutionDir}StallionTests.sln",
  "/p:SolutionFileName=StallionTests.sln",
  "/p:SolutionName=StallionTests",
  "/p:SolutionExt=.sln",
  "/p:ForceImportBeforeCppTargets=$compilerCompatibilityProps",
  "/p:StallionNodeExe=$nodePath",
  "/m",
  "/nr:false",
  "/v:minimal"
)

if ($PublicSigningKeyFile) {
  $buildArguments += "/p:StallionTestPublicSigningKeyFile=$((Resolve-Path $PublicSigningKeyFile).Path)"
}

if ($CoverageBuild) {
  $buildArguments += "/p:StallionCoverageBuild=true"
}

& $msbuildPath @buildArguments
if ($LASTEXITCODE -ne 0) {
  throw "MSBuild failed with exit code $LASTEXITCODE."
}

$testExecutable = Join-Path $root "windows\StallionTests\bin\$Platform\$Configuration\StallionTests.exe"
if (-not (Test-Path $testExecutable)) {
  throw "StallionTests executable was not produced at '$testExecutable'."
}

if ($BuildOnly) {
  Write-Output $testExecutable
  return
}

$moduleOutput = Join-Path $root "windows\ReactNativeStallionWindows\bin\$Platform\$Configuration"
$rnwOutput = Join-Path $rnw "target\$Platform\$Configuration\Microsoft.ReactNative"
$previousPath = $env:PATH
try {
  $env:PATH = "$moduleOutput;$rnwOutput;$env:PATH"
  & $testExecutable
  if ($LASTEXITCODE -ne 0) {
    throw "StallionTests failed with exit code $LASTEXITCODE."
  }
} finally {
  $env:PATH = $previousPath
}
