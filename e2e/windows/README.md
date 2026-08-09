# RNW rollout E2E

This fixture is a real RNW x64 app. Its embedded Release bundle renders `STALLION_RELEASE_A`; `build-bundle-b.mjs` creates an OTA archive whose bundle renders `STALLION_RELEASE_B`.

`run-ci.ps1` performs the non-visual safety assertions:

1. Build bundle B and the Release app containing A.
2. Start the controllable loopback Stallion server.
3. Launch A and wait until B is fully downloaded.
4. Assert the process remains alive and the active slot is still default.
5. Stop and relaunch the app.
6. Assert B is selected and its JS calls `onLaunch`, clearing `launchPending` and recording `lastSuccessfulHash`.

## Automated run

Run on a Windows CI worker after installing workspace dependencies:

```powershell
.\e2e\run-ci.ps1 -Node (Get-Command node).Source -MSBuild (Get-Command msbuild).Source
```

The fixture's `node_modules` is used by default. For a local equivalent RN/RNW 0.81 tree, pass `-NodeModules <path>` explicitly.

The runner deletes only `%LOCALAPPDATA%\StallionE2EApp`, builds bundle B and the unpackaged x64 Release executable, owns the mock server process, performs both launches, and cleans up child processes. A successful run ends with:

```text
PASS Stallion RNW A-to-B end-to-end rollout
```

The job requires exclusive use of TCP port `43119` and the fixture state directory. Do not run it concurrently on the same worker.

## Run the sample manually

Use a clean RNW 0.81 dependency install. From the package directory:

```powershell
$node = (Get-Command node).Source
$msbuild = (Get-Command msbuild).Source
$nodeModules = (Resolve-Path .\e2e\app\node_modules).Path
$env:STALLION_E2E_NODE_MODULES = $nodeModules
$env:NODE_PATH = $nodeModules

Remove-Item "$env:LOCALAPPDATA\StallionE2EApp" -Recurse -Force -ErrorAction SilentlyContinue
& $node .\e2e\build-bundle-b.mjs

$solution = (Resolve-Path .\e2e\app\windows\StallionE2EApp.sln).Path
$project = (Resolve-Path .\e2e\app\windows\StallionE2EApp\StallionE2EApp.vcxproj).Path
$rnw = Join-Path $nodeModules 'react-native-windows'
& $msbuild $project /restore /p:Configuration=Release /p:Platform=x64 `
  "/p:ReactNativeWindowsDir=$rnw\" `
  "/p:SolutionDir=$(Split-Path $solution)\" "/p:SolutionPath=$solution" `
  /p:SolutionFileName=StallionE2EApp.sln /p:SolutionName=StallionE2EApp `
  /p:SolutionExt=.sln /m /v:minimal
```

Start the mock server in terminal 1:

```powershell
node .\e2e\mock-stallion-server.mjs --artifact .\e2e\artifacts\bundle-b.zip
```

Wait for `READY 43119`. In terminal 2, launch the app:

```powershell
& .\e2e\app\windows\StallionE2EApp\bin\x64\Release\StallionE2EApp.exe
```

Verify the window displays `STALLION_RELEASE_A`. Wait until this command reports `prodTempHash` as `e2e-release-b`:

```powershell
Get-Content "$env:LOCALAPPDATA\StallionE2EApp\meta.json" -Raw
```

The same running window must still display A and `currentProdSlot` must remain `DEFAULT_SLOT`. Close the process naturally, launch the same executable again, and verify:

- The window displays `STALLION_RELEASE_B`.
- `currentProdSlot` is `NEW_SLOT`.
- `lastSuccessfulHash` is `e2e-release-b`.
- `launchPending` is `false`.

Inspect requests, range resumes, and server state at any time:

```powershell
Invoke-RestMethod http://127.0.0.1:43119/__state | ConvertTo-Json -Depth 10
```

## CI failure artifacts

Retain these on failure:

- MSBuild console output or binary log.
- `%LOCALAPPDATA%\StallionE2EApp\meta.json` and `events.json`.
- `GET /__state` output from the mock server.
- `e2e/artifacts/bundle-b.zip`.

Common failures:

- Metro resolves RNW 0.82: reinstall the fixture workspace and confirm `react-native-windows` is `0.81.20`.
- Port 43119 is occupied: serialize the job or terminate the previous mock server.
- First launch times out: inspect metadata requests in `/__state` and confirm loopback HTTP is not blocked by worker policy.
- Second launch times out: preserve `meta.json`; an uncleared `launchPending` is a real startup failure and must not be retried away in CI.

The visible `release-marker` accessibility label is available for an additional WinAppDriver/Appium assertion. The durable-state checks remain mandatory because they also verify the native slot transaction and crash marker.
