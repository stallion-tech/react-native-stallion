import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = mkdtempSync(join(tmpdir(), 'stallion-e2e-contract-'));
const build = join(root, 'build'); mkdirSync(build); writeFileSync(join(build, 'index.windows.bundle'), 'B');
const artifact = join(root, 'bundle-b.zip');
const packer = fileURLToPath(new URL('./create-windows-release.mjs', import.meta.url));
await import('node:child_process').then(({ execFileSync }) => execFileSync(process.execPath, [packer, '--build-dir', build, '--output', artifact]));
const serverPath = fileURLToPath(new URL('./mock-stallion-server.mjs', import.meta.url));
const server = spawn(process.execPath, [serverPath, '--artifact', artifact], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((resolveReady, reject) => {
  const timer = setTimeout(() => reject(new Error('mock server did not start')), 5000);
  server.stdout.on('data', data => { if (data.toString().includes('READY')) { clearTimeout(timer); resolveReady(); } });
});
try {
  const metadata = await fetch('http://127.0.0.1:43119/api/v1/promoted/get-update-meta', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-app-token': 'test' },
    body: JSON.stringify({ platform: 'windows', appVersion: '1.0.0.0', projectId: 'e2e', appliedBundleHash: '' }),
  }).then(response => response.json());
  if (metadata.data.newBundleData.checksum !== 'e2e-release-b') throw new Error('release response mismatch');
  const partial = await fetch(metadata.data.newBundleData.downloadUrl, { headers: { range: 'bytes=4-' } });
  if (partial.status !== 206 || !(await partial.arrayBuffer()).byteLength) throw new Error('range response mismatch');
  const state = await fetch('http://127.0.0.1:43119/__state').then(response => response.json());
  if (state.metadataRequests[0].payload.platform !== 'windows' || state.ranges[0] !== 'bytes=4-') throw new Error('request capture mismatch');
  process.stdout.write('mock Stallion contract test passed\n');
} finally {
  server.kill();
}
