#!/usr/bin/env node
/* eslint-env node */
'use strict';

const fs = require('fs');
const path = require('path');

function fail(message) {
  process.stderr.write(`Stallion fingerprint: ${message}\n`);
  process.exit(1);
}

function resolveCreateFingerprint(loaded) {
  if (loaded && typeof loaded.createFingerprintAsync === 'function') {
    return loaded.createFingerprintAsync;
  }
  if (
    loaded &&
    loaded.default &&
    typeof loaded.default.createFingerprintAsync === 'function'
  ) {
    return loaded.default.createFingerprintAsync;
  }
  return null;
}

async function loadFingerprint() {
  try {
    return require('@expo/fingerprint');
  } catch (requireError) {
    try {
      return await import('@expo/fingerprint');
    } catch (importError) {
      const reason =
        (importError && importError.message) ||
        (requireError && requireError.message) ||
        String(importError || requireError);
      fail(`failed to load @expo/fingerprint (${reason})`);
    }
  }
  return null;
}

const STALLION_CONFIG = '.stallion.config.js';

function loadStallionConfig(appRoot) {
  const configPath = path.join(appRoot, STALLION_CONFIG);
  if (!fs.existsSync(configPath)) {
    return {};
  }
  try {
    const loaded = require(configPath);
    if (loaded && typeof loaded === 'object') {
      return loaded;
    }
  } catch (error) {
    process.stderr.write(
      `Stallion fingerprint: could not read ${STALLION_CONFIG} (${error.message})\n`
    );
  }
  return {};
}

function resolveFingerprintRoot(appRoot, config) {
  if (config && config.isExampleApp === true) {
    return path.resolve(appRoot, '..');
  }
  return appRoot;
}

function fingerprintOptions(config, SourceSkips) {
  const raw = config && config.fingerprint;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return undefined;
  }
  const options = { ...raw };
  if (Array.isArray(options.sourceSkips) && SourceSkips) {
    let mask = SourceSkips.None || 0;
    for (const key of options.sourceSkips) {
      if (typeof key === 'string' && SourceSkips[key] != null) {
        // sourceSkips is a bit mask, matching @expo/fingerprint.
        // eslint-disable-next-line no-bitwise
        mask |= SourceSkips[key];
      }
    }
    options.sourceSkips = mask;
  }
  return options;
}

async function main() {
  const projectRootArg = process.argv[2];
  if (!projectRootArg) {
    fail('project root argument is required');
  }

  const appRoot = path.resolve(projectRootArg);
  const stallionConfig = loadStallionConfig(appRoot);
  const projectRoot = resolveFingerprintRoot(appRoot, stallionConfig);
  const loaded = await loadFingerprint();
  const createFingerprintAsync = resolveCreateFingerprint(loaded);
  if (typeof createFingerprintAsync !== 'function') {
    fail('createFingerprintAsync is not exported by @expo/fingerprint');
  }
  const options = fingerprintOptions(
    stallionConfig,
    loaded.SourceSkips || (loaded.default && loaded.default.SourceSkips)
  );

  const stdoutChunks = [];
  const originalWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = (chunk, encoding, callback) => {
    stdoutChunks.push(
      Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))
    );
    if (typeof encoding === 'function') {
      encoding();
    } else if (typeof callback === 'function') {
      callback();
    }
    return true;
  };

  let fingerprint;
  try {
    fingerprint = await createFingerprintAsync(projectRoot, options);
  } catch (error) {
    process.stdout.write = originalWrite;
    fail(error && error.stack ? error.stack : String(error));
  }
  process.stdout.write = originalWrite;

  const leaked = Buffer.concat(stdoutChunks).toString('utf8').trim();
  if (leaked) {
    process.stderr.write(
      `Stallion fingerprint: ignored extra stdout from @expo/fingerprint\n${leaked}\n`
    );
  }

  const hash =
    fingerprint && typeof fingerprint.hash === 'string'
      ? fingerprint.hash.trim()
      : '';
  if (!hash) {
    fail('createFingerprintAsync returned no hash');
  }

  originalWrite(`${hash}\n`);
}

main().catch((error) => {
  fail(error && error.stack ? error.stack : String(error));
});
