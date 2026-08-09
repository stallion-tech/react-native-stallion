#!/usr/bin/env node

import { createHash, createPublicKey } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((arg, index, all) => {
  if (!arg.startsWith('--')) return [arg, true];
  const next = all[index + 1];
  return [arg.slice(2), next && !next.startsWith('--') ? next : true];
}));

if (!args.output) throw new Error('--output is required');
if (args['public-key-file'] && args['public-key-base64']) {
  throw new Error('Set either StallionPublicSigningKeyFile or StallionPublicSigningKey, not both');
}

let key;
if (args['public-key-file']) {
  const path = resolve(String(args['public-key-file']));
  if (!existsSync(path)) throw new Error(`Public signing key file does not exist: ${path}`);
  const contents = readFileSync(path);
  if (contents.toString('utf8').includes('PRIVATE KEY')) throw new Error('StallionPublicSigningKeyFile must contain a public key, not a private key');
  key = createPublicKey(contents);
} else if (args['public-key-base64']) {
  const value = String(args['public-key-base64']).replace(/\s/g, '');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) throw new Error('StallionPublicSigningKey is not valid base64');
  key = createPublicKey({ key: Buffer.from(value, 'base64'), format: 'der', type: 'spki' });
}

let base64 = '';
let fingerprint = '';
if (key) {
  if (key.asymmetricKeyType !== 'rsa') throw new Error('Stallion signing requires an RSA public key');
  const bits = key.asymmetricKeyDetails?.modulusLength || 0;
  if (bits < 2048) throw new Error('Stallion signing requires an RSA key of at least 2048 bits');
  const der = key.export({ format: 'der', type: 'spki' });
  base64 = der.toString('base64');
  fingerprint = createHash('sha256').update(der).digest('hex');
}

const content = `#pragma once
namespace ReactNativeStallionWindows {
inline constexpr char GeneratedPublicSigningKey[] = "${base64}";
inline constexpr char GeneratedPublicSigningKeyFingerprint[] = "${fingerprint}";
}
`;
const output = resolve(String(args.output));
mkdirSync(dirname(output), { recursive: true });
if (!existsSync(output) || readFileSync(output, 'utf8') !== content) writeFileSync(output, content);
process.stdout.write(fingerprint ? `Stallion signing key SHA-256: ${fingerprint}\n` : 'Stallion package signing is disabled\n');
