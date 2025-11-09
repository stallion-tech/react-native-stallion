#!/usr/bin/env node

/**
 * Test script for bsdiff/bspatch C code implementation
 *
 * Usage: yarn test:patch:c-code <dir1> <dir2>
 *
 * This script:
 * 1. Generates a diff file between main.jsbundle in dir1 and dir2
 * 2. Applies the diff to dir1's main.jsbundle to generate a new file
 * 3. Verifies that the generated file equals dir2's main.jsbundle
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const BSDIFF_SOURCE = path.join(__dirname, '../shared-native/bsdiff/bsdiff.c');
const BSPATCH_SOURCE = path.join(
  __dirname,
  '../shared-native/bsdiff/bspatch.c'
);
const TEMP_DIR = path.join(__dirname, '../.test-temp');
const BSDIFF_BIN = path.join(TEMP_DIR, 'bsdiff');
const BSPATCH_BIN = path.join(TEMP_DIR, 'bspatch');

function ensureBinaries() {
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  // Check if binaries exist
  const bsdiffExists = fs.existsSync(BSDIFF_BIN);
  const bspatchExists = fs.existsSync(BSPATCH_BIN);

  if (!bsdiffExists || !bspatchExists) {
    console.log('Compiling bsdiff and bspatch...');

    // Check if bzip2 is available
    try {
      execSync('which bzip2', { stdio: 'ignore' });
    } catch (e) {
      throw new Error(
        'bzip2 not found. Please install bzip2 development libraries:\n' +
          '  macOS: brew install bzip2\n' +
          '  Linux: apt-get install libbz2-dev'
      );
    }

    // Compile bsdiff
    try {
      console.log('Compiling bsdiff...');
      execSync(
        `gcc -std=c99 -Wall -o "${BSDIFF_BIN}" "${BSDIFF_SOURCE}" -lbz2`,
        {
          stdio: 'inherit',
        }
      );
    } catch (e) {
      throw new Error(
        `Failed to compile bsdiff: ${e.message}\n` +
          'Make sure gcc and libbz2-dev (or bzip2 on macOS) are installed.'
      );
    }

    // Compile bspatch
    try {
      console.log('Compiling bspatch...');
      execSync(
        `gcc -std=c99 -Wall -o "${BSPATCH_BIN}" "${BSPATCH_SOURCE}" -lbz2`,
        {
          stdio: 'inherit',
        }
      );
    } catch (e) {
      throw new Error(
        `Failed to compile bspatch: ${e.message}\n` +
          'Make sure gcc and libbz2-dev (or bzip2 on macOS) are installed.'
      );
    }

    console.log('✓ Binaries compiled successfully\n');
  } else {
    console.log('✓ Using existing binaries\n');
  }
}

function getFileHash(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function filesAreEqual(file1, file2) {
  const hash1 = getFileHash(file1);
  const hash2 = getFileHash(file2);
  return hash1 === hash2;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length !== 2) {
    console.error('Usage: yarn test:patch:c-code <dir1> <dir2>');
    console.error('\nExample:');
    console.error(
      '  yarn test:patch:c-code stallion-temp-vIIYcEFJQiVC stallion-temp-XzK9GlEs4lEm'
    );
    process.exit(1);
  }

  const [dir1Arg, dir2Arg] = args;

  // Resolve paths - support both relative to example/ and absolute paths
  const exampleDir = path.join(__dirname, '../example');
  let dir1 = path.isAbsolute(dir1Arg)
    ? dir1Arg
    : path.join(exampleDir, dir1Arg);
  let dir2 = path.isAbsolute(dir2Arg)
    ? dir2Arg
    : path.join(exampleDir, dir2Arg);

  // Normalize paths
  dir1 = path.resolve(dir1);
  dir2 = path.resolve(dir2);

  const file1 = path.join(dir1, 'Stallion', 'main.jsbundle');
  const file2 = path.join(dir2, 'Stallion', 'main.jsbundle');
  const patchFile = path.join(TEMP_DIR, 'patch.diff');
  const file3 = path.join(TEMP_DIR, 'generated-main.jsbundle');

  console.log('='.repeat(60));
  console.log('bsdiff/bspatch C Code Test');
  console.log('='.repeat(60));
  console.log(`Directory 1: ${dir1}`);
  console.log(`Directory 2: ${dir2}`);
  console.log(`File 1: ${file1}`);
  console.log(`File 2: ${file2}`);
  console.log(`Patch file: ${patchFile}`);
  console.log(`Generated file: ${file3}`);
  console.log('');

  // Check if directories and files exist
  if (!fs.existsSync(dir1)) {
    console.error(`❌ Error: Directory 1 does not exist: ${dir1}`);
    process.exit(1);
  }

  if (!fs.existsSync(dir2)) {
    console.error(`❌ Error: Directory 2 does not exist: ${dir2}`);
    process.exit(1);
  }

  if (!fs.existsSync(file1)) {
    console.error(`❌ Error: File 1 does not exist: ${file1}`);
    process.exit(1);
  }

  if (!fs.existsSync(file2)) {
    console.error(`❌ Error: File 2 does not exist: ${file2}`);
    process.exit(1);
  }

  // Ensure binaries are compiled
  try {
    ensureBinaries();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }

  // Get file sizes for info
  const size1 = fs.statSync(file1).size;
  const size2 = fs.statSync(file2).size;
  console.log(`File 1 size: ${size1} bytes`);
  console.log(`File 2 size: ${size2} bytes`);
  console.log('');

  // Step 1: Generate diff file
  console.log('Step 1: Generating diff file...');
  try {
    execSync(`${BSDIFF_BIN} "${file1}" "${file2}" "${patchFile}"`, {
      stdio: 'inherit',
    });

    const patchSize = fs.statSync(patchFile).size;
    console.log(`✓ Diff generated successfully (${patchSize} bytes)`);
    console.log('');
  } catch (error) {
    console.error(`❌ Error generating diff: ${error.message}`);
    process.exit(1);
  }

  // Step 2: Apply diff to file 1 to generate file 3
  console.log('Step 2: Applying diff to file 1 to generate file 3...');
  try {
    execSync(`${BSPATCH_BIN} "${file1}" "${file3}" "${patchFile}"`, {
      stdio: 'inherit',
    });

    const size3 = fs.statSync(file3).size;
    console.log(
      `✓ Patch applied successfully (generated file: ${size3} bytes)`
    );
    console.log('');
  } catch (error) {
    console.error(`❌ Error applying patch: ${error.message}`);
    process.exit(1);
  }

  // Step 3: Verify file 2 equals file 3
  console.log('Step 3: Verifying file 2 equals file 3...');

  if (size2 !== fs.statSync(file3).size) {
    console.error(`❌ Files have different sizes!`);
    console.error(`   File 2: ${size2} bytes`);
    console.error(`   File 3: ${fs.statSync(file3).size} bytes`);
    process.exit(1);
  }

  if (filesAreEqual(file2, file3)) {
    console.log('✓ SUCCESS: File 2 and File 3 are identical!');
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ Test PASSED');
    console.log('='.repeat(60));
    process.exit(0);
  } else {
    console.error('❌ FAILURE: File 2 and File 3 are NOT identical!');
    console.error('');
    console.error('Hash comparison:');
    console.error(`  File 2 SHA256: ${getFileHash(file2)}`);
    console.error(`  File 3 SHA256: ${getFileHash(file3)}`);
    console.error('');
    console.error('='.repeat(60));
    console.error('❌ Test FAILED');
    console.error('='.repeat(60));
    process.exit(1);
  }
}

main();
