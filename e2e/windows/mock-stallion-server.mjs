import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((arg, index, all) => [arg.replace(/^--/, ''), all[index + 1]]));
const port = Number(args.port || 43119);
const artifactPath = resolve(args.artifact || 'bundle-b.zip');
const releaseHash = args.hash || 'e2e-release-b';
const appVersion = args['app-version'] || '1.0.0.0';
const state = {
  serverId: 'react-native-stallion-windows-e2e',
  metadataRequests: [],
  ranges: [],
  events: [],
  rollback: false,
  enabled: true,
};

const json = (response, status, value) => {
  const body = Buffer.from(JSON.stringify(value));
  response.writeHead(status, { 'content-type': 'application/json', 'content-length': body.length });
  response.end(body);
};
const body = request => new Promise((resolveBody, reject) => {
  const chunks = [];
  request.on('data', chunk => chunks.push(chunk));
  request.on('end', () => resolveBody(Buffer.concat(chunks)));
  request.on('error', reject);
});

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${port}`);
  if (request.method === 'POST' && url.pathname === '/api/v1/promoted/get-update-meta') {
    const payload = JSON.parse((await body(request)).toString() || '{}');
    state.metadataRequests.push({ payload, headers: request.headers });
    if (payload.platform !== 'windows') return json(response, 400, { success: false, error: 'expected windows platform' });
    const alreadyApplied = payload.appliedBundleHash === releaseHash;
    return json(response, 200, {
      success: true,
      data: {
        appliedBundleData: state.rollback && alreadyApplied ? { isRolledBack: true, targetAppVersion: appVersion } : null,
        newBundleData: state.enabled && !alreadyApplied ? {
          downloadUrl: `http://127.0.0.1:${port}/artifact`, checksum: releaseHash,
        } : null,
      },
    });
  }
  if (request.method === 'GET' && url.pathname === '/artifact') {
    const artifact = readFileSync(artifactPath);
    const range = request.headers.range;
    state.ranges.push(range || null);
    const start = range ? Number(/^bytes=(\d+)-$/.exec(range)?.[1] || 0) : 0;
    const selected = artifact.subarray(start);
    response.writeHead(start ? 206 : 200, {
      'content-type': 'application/zip', 'content-length': selected.length,
      ...(start ? { 'content-range': `bytes ${start}-${artifact.length - 1}/${artifact.length}` } : {}),
    });
    return response.end(selected);
  }
  if (request.method === 'POST' && url.pathname === '/__control') {
    Object.assign(state, JSON.parse((await body(request)).toString() || '{}'));
    return json(response, 200, state);
  }
  if (request.method === 'GET' && url.pathname === '/__state') return json(response, 200, state);
  return json(response, 404, { error: 'not found' });
});

server.listen(port, '127.0.0.1', () => process.stdout.write(`READY ${port}\n`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
