param(
  [ValidateSet("Debug", "Release")]
  [string]$Configuration = "Release",
  [ValidateSet("x64")]
  [string]$Platform = "x64",
  [string]$MSBuild,
  [string]$CoverageTool,
  [string]$Output = "coverage\stallion-tests.cobertura.xml",
  [string]$HtmlOutput = "coverage\html"
)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$projectSourceRoot = Join-Path $root "windows\ReactNativeStallionWindows"

function Update-CoverageRates {
  param(
    [Parameter(Mandatory = $true)]
    [System.Xml.XmlElement]$Element
  )

  $lineNodes = @($Element.SelectNodes(".//line"))
  $lineCount = $lineNodes.Count
  $coveredLineCount = @($lineNodes | Where-Object { [int]$_.hits -gt 0 }).Count
  $lineRate = if ($lineCount -gt 0) { $coveredLineCount / $lineCount } else { 1.0 }

  $methodNodes = @($Element.SelectNodes("./methods/method"))
  foreach ($methodNode in $methodNodes) {
    Update-CoverageRates -Element $methodNode
  }

  if ($Element.HasAttribute("line-rate")) {
    $Element.SetAttribute("line-rate", [System.Xml.XmlConvert]::ToString([double]$lineRate))
  }
  if ($Element.HasAttribute("branch-rate")) {
    $Element.SetAttribute("branch-rate", [System.Xml.XmlConvert]::ToString([double]1.0))
  }
}

function Filter-CoberturaToProjectSources {
  param(
    [Parameter(Mandatory = $true)]
    [xml]$CoverageReport,
    [Parameter(Mandatory = $true)]
    [string]$ProjectSourceRoot
  )

  $normalizedRoot = ($ProjectSourceRoot -replace '/', '\').TrimEnd('\') + '\'
  $packageNodes = @($CoverageReport.SelectNodes("/coverage/packages/package"))
  foreach ($packageNode in $packageNodes) {
    $classNodes = @($packageNode.SelectNodes("./classes/class"))
    foreach ($classNode in $classNodes) {
      $filename = $classNode.GetAttribute("filename")
      $normalizedFilename = ($filename -replace '/', '\')
      $keep = $normalizedFilename.StartsWith($normalizedRoot, [System.StringComparison]::OrdinalIgnoreCase) -and
        ($normalizedFilename.IndexOf("\obj\", [System.StringComparison]::OrdinalIgnoreCase) -lt 0)

      if (-not $keep) {
        [void]$packageNode.SelectSingleNode("./classes").RemoveChild($classNode)
      }
    }

    $remainingClasses = @($packageNode.SelectNodes("./classes/class"))
    if ($remainingClasses.Count -eq 0) {
      [void]$packageNode.ParentNode.RemoveChild($packageNode)
      continue
    }

    Update-CoverageRates -Element $packageNode
  }

  Update-CoverageRates -Element $CoverageReport.DocumentElement
}

function Remove-DuplicateCoverageClasses {
  param(
    [Parameter(Mandatory = $true)]
    [xml]$CoverageReport
  )

  $keptClasses = @{}
  foreach ($classNode in @($CoverageReport.SelectNodes("/coverage/packages/package/classes/class"))) {
    $key = (($classNode.GetAttribute("filename") -replace '/', '\').ToLowerInvariant()) + "`0" +
      $classNode.GetAttribute("name")
    $coveredLines = @($classNode.SelectNodes("./lines/line") | Where-Object { [int]$_.hits -gt 0 }).Count
    if (-not $keptClasses.ContainsKey($key)) {
      $keptClasses[$key] = @{ Node = $classNode; CoveredLines = $coveredLines }
      continue
    }

    $kept = $keptClasses[$key]
    if ($coveredLines -gt $kept.CoveredLines) {
      [void]$kept.Node.ParentNode.RemoveChild($kept.Node)
      $keptClasses[$key] = @{ Node = $classNode; CoveredLines = $coveredLines }
    } else {
      [void]$classNode.ParentNode.RemoveChild($classNode)
    }
  }

  foreach ($packageNode in @($CoverageReport.SelectNodes("/coverage/packages/package"))) {
    if (@($packageNode.SelectNodes("./classes/class")).Count -eq 0) {
      [void]$packageNode.ParentNode.RemoveChild($packageNode)
    } else {
      Update-CoverageRates -Element $packageNode
    }
  }
  Update-CoverageRates -Element $CoverageReport.DocumentElement
}

function Move-CoveragePackageClasses {
  param(
    [Parameter(Mandatory = $true)]
    [xml]$CoverageReport,
    [Parameter(Mandatory = $true)]
    [string]$SourcePackage,
    [Parameter(Mandatory = $true)]
    [string]$TargetPackage
  )

  $source = @($CoverageReport.SelectNodes("/coverage/packages/package")) | Where-Object {
    [System.IO.Path]::GetFileNameWithoutExtension($_.GetAttribute("name")) -ieq $SourcePackage
  } | Select-Object -First 1
  if (-not $source) { return }
  $target = @($CoverageReport.SelectNodes("/coverage/packages/package")) | Where-Object {
    [System.IO.Path]::GetFileNameWithoutExtension($_.GetAttribute("name")) -ieq $TargetPackage
  } | Select-Object -First 1
  if (-not $target) { throw "Coverage package '$TargetPackage' was not found." }
  $target.SetAttribute("name", $TargetPackage)

  $targetClasses = $target.SelectSingleNode("./classes")
  foreach ($classNode in @($source.SelectNodes("./classes/class"))) {
    [void]$targetClasses.AppendChild($classNode)
  }
  [void]$source.ParentNode.RemoveChild($source)
}

function Resolve-CoverageTool {
  if ($CoverageTool) {
    return (Resolve-Path $CoverageTool).Path
  }

  $command = Get-Command Microsoft.CodeCoverage.Console.exe -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  $vswhere = Join-Path ${env:ProgramFiles(x86)} "Microsoft Visual Studio\Installer\vswhere.exe"
  if (Test-Path $vswhere) {
    $installation = & $vswhere -latest -products * -property installationPath
    if ($installation) {
      $candidate = Join-Path $installation "Common7\IDE\Extensions\Microsoft\CodeCoverage.Console\Microsoft.CodeCoverage.Console.exe"
      if (Test-Path $candidate) {
        return $candidate
      }
    }
  }

  throw "Microsoft.CodeCoverage.Console.exe was not found. Install Visual Studio code coverage tools or pass -CoverageTool."
}

$testScript = Join-Path $PSScriptRoot "run-stallion-tests.ps1"
& $testScript -Configuration $Configuration -Platform $Platform -MSBuild $MSBuild -BuildOnly -CoverageBuild
if ($LASTEXITCODE -ne 0) {
  throw "The coverage build failed with exit code $LASTEXITCODE."
}

$coverage = Resolve-CoverageTool
$rnwPackage = & node -p "require.resolve('react-native-windows/package.json')"
$rnw = Split-Path $rnwPackage -Parent
$testExecutable = Join-Path $root "windows\StallionTests\bin\$Platform\$Configuration\StallionTests.exe"
$moduleOutput = Join-Path $root "windows\ReactNativeStallionWindows\bin\$Platform\$Configuration"
$rnwOutput = Join-Path $rnw "target\$Platform\$Configuration\Microsoft.ReactNative"
$outputPath = if ([System.IO.Path]::IsPathRooted($Output)) {
  [System.IO.Path]::GetFullPath($Output)
} else {
  [System.IO.Path]::GetFullPath((Join-Path $root $Output))
}
New-Item -ItemType Directory -Force -Path (Split-Path $outputPath -Parent) | Out-Null
$htmlOutputPath = if ([System.IO.Path]::IsPathRooted($HtmlOutput)) {
  [System.IO.Path]::GetFullPath($HtmlOutput)
} else {
  [System.IO.Path]::GetFullPath((Join-Path $root $HtmlOutput))
}

$previousPath = $env:PATH
try {
  $env:PATH = "$moduleOutput;$rnwOutput;$env:PATH"
  $coverageSettings = Join-Path $root "tools\stallion-coverage.runsettings"
  if (-not (Test-Path $coverageSettings) -or (Get-Item $coverageSettings).Length -eq 0) {
    throw "Coverage settings are missing or empty at '$coverageSettings'."
  }
  & $coverage collect --settings $coverageSettings --output $outputPath --output-format cobertura $testExecutable
  if ($LASTEXITCODE -ne 0) {
    throw "Code coverage collection failed with exit code $LASTEXITCODE."
  }
} finally {
  $env:PATH = $previousPath
}

try {
  [xml]$coverageReport = Get-Content -Raw $outputPath
} catch {
  throw "Coverage collector produced invalid XML at '$outputPath': $($_.Exception.Message)"
}
Filter-CoberturaToProjectSources -CoverageReport $coverageReport -ProjectSourceRoot $projectSourceRoot
Move-CoveragePackageClasses -CoverageReport $coverageReport -SourcePackage "StallionTests" -TargetPackage "ReactNativeStallionWindows"
Remove-DuplicateCoverageClasses -CoverageReport $coverageReport
$coverageReport.Save($outputPath)
if (-not $coverageReport.SelectSingleNode("/coverage/packages/package")) {
  throw "Coverage collector produced no package data. Check the DLL/PDB pair and coverage filters; HTML generation was skipped."
}
$toolManifest = Join-Path $root ".config\dotnet-tools.json"
if (-not (Test-Path -LiteralPath $toolManifest -PathType Leaf)) {
  throw "The .NET tool manifest is missing at '$toolManifest'."
}
& dotnet tool restore --tool-manifest $toolManifest
if ($LASTEXITCODE -ne 0) {
  throw "ReportGenerator restore failed with exit code $LASTEXITCODE."
}

Push-Location $root
try {
  & dotnet tool run reportgenerator "-reports:$outputPath" "-targetdir:$htmlOutputPath" "-reporttypes:Html"
  if ($LASTEXITCODE -ne 0) {
    throw "HTML coverage generation failed with exit code $LASTEXITCODE."
  }
} finally {
  Pop-Location
}

Write-Output "Cobertura report: $outputPath"
Write-Output "HTML report: $(Join-Path $htmlOutputPath 'index.html')"
