import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const appRoot = join(packageRoot, 'app');
const outputRoot = join(packageRoot, 'artifacts');
const build = join(outputRoot, 'build');
rmSync(build, { recursive: true, force: true }); mkdirSync(build, { recursive: true });
const cli = process.env.STALLION_E2E_NODE_MODULES
  ? join(process.env.STALLION_E2E_NODE_MODULES, '@react-native-community', 'cli', 'build', 'bin.js')
  : requireResolve('@react-native-community/cli/build/bin.js', appRoot);
execFileSync(process.execPath, [cli, 'bundle', '--platform', 'windows', '--entry-file', 'index.bundle-b.js',
  '--bundle-output', join(build, 'index.windows.bundle'), '--assets-dest', build, '--dev', 'false', '--minify', 'false'],
  { cwd: appRoot, stdio: 'inherit' });
const bundle = join(build, 'index.windows.bundle');
const lock = JSON.parse(readFileSync(join(appRoot, 'windows', 'StallionE2EApp', 'packages.lock.json'), 'utf8'));
const nativeDependencies = lock.dependencies['native,Version=v0.0'];
const hermesVersion = nativeDependencies['Microsoft.JavaScript.Hermes']?.resolved;
if (!hermesVersion) throw new Error('Microsoft.JavaScript.Hermes is missing from packages.lock.json');
const hermes = join(homedir(), '.nuget', 'packages', 'microsoft.javascript.hermes', hermesVersion,
  'tools', 'native', 'release', 'x86', 'hermes.exe');
if (!existsSync(hermes)) throw new Error(`RNW Hermes compiler was not restored: ${hermes}`);
const bytecode = `${bundle}.hbc`;
execFileSync(hermes, ['-emit-binary', '-out', bytecode, bundle, '-O'], { stdio: 'inherit' });
rmSync(bundle);
renameSync(bytecode, bundle);
const packer = join(import.meta.dirname, 'create-windows-release.mjs');
execFileSync(process.execPath, [packer, '--build-dir', build, '--output', join(outputRoot, 'bundle-b.zip')], { stdio: 'inherit' });

function requireResolve(name, cwd) {
  const script = `process.stdout.write(require.resolve(${JSON.stringify(name)}))`;
  return execFileSync(process.execPath, ['-e', script], { cwd, encoding: 'utf8' });
}
