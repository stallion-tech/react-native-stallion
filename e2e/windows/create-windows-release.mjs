#!/usr/bin/env node

import { createHash, createSign } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((arg, index, all) => {
  if (!arg.startsWith('--')) return [arg, true];
  const name = arg.slice(2);
  const next = all[index + 1];
  return [name, next && !next.startsWith('--') ? next : true];
}));

const buildDir = resolve(String(args['build-dir'] || 'build'));
const output = resolve(String(args.output || 'stallion-windows.zip'));
const privateKeyPath = args['private-key'] ? resolve(String(args['private-key'])) : null;

if (!existsSync(join(buildDir, 'index.windows.bundle'))) {
  throw new Error(`Missing ${join(buildDir, 'index.windows.bundle')}`);
}

const ignored = new Set(['.DS_Store', '.stallionsigned']);
const files = [];
function visit(directory) {
  for (const name of readdirSync(directory).sort()) {
    const path = join(directory, name);
    const relativePath = relative(buildDir, path).split(sep).join('/');
    if (ignored.has(name) || relativePath.startsWith('__MACOSX/')) continue;
    if (statSync(path).isDirectory()) visit(path);
    else files.push({ path, relativePath });
  }
}
visit(buildDir);

const sha256 = value => createHash('sha256').update(value).digest('hex');
const manifest = files.map(file => `${file.relativePath}:${sha256(readFileSync(file.path))}`).sort();
const packageHash = sha256(Buffer.from(JSON.stringify(manifest)));

if (privateKeyPath) {
  const base64url = value => Buffer.from(value).toString('base64url');
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({ packageHash }));
  const content = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');
  signer.update(content);
  signer.end();
  const signature = signer.sign(readFileSync(privateKeyPath)).toString('base64url');
  writeFileSync(join(buildDir, '.stallionsigned'), `${content}.${signature}`);
  files.push({ path: join(buildDir, '.stallionsigned'), relativePath: '.stallionsigned' });
}

let crcTable;
function crc32(buffer) {
  crcTable ||= Array.from({ length: 256 }, (_, index) => {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
    return value >>> 0;
  });
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

const localParts = [];
const centralParts = [];
let offset = 0;
for (const file of files.sort((a, b) => a.relativePath.localeCompare(b.relativePath))) {
  const data = readFileSync(file.path);
  const name = Buffer.from(`build/${file.relativePath}`);
  const crc = crc32(data);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0, 6);
  local.writeUInt16LE(0, 8); // STORE: required by the native extractor.
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(data.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(name.length, 26);
  localParts.push(local, name, data);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0, 8);
  central.writeUInt16LE(0, 10);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(data.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(name.length, 28);
  central.writeUInt32LE(offset, 42);
  centralParts.push(central, name);
  offset += local.length + name.length + data.length;
}

const centralDirectory = Buffer.concat(centralParts);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(centralDirectory.length, 12);
end.writeUInt32LE(offset, 16);
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, Buffer.concat([...localParts, centralDirectory, end]));
process.stdout.write(`${JSON.stringify({ output, packageHash, files: files.length, signed: Boolean(privateKeyPath) })}\n`);
