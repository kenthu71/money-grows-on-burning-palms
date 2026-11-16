// Money Grows on Burning Palms — ai-excited-01 entry.
//
// Copies the entry.png that sits beside this script into the output
// directory ($MAKEFUN_OUTPUT_DIR, default /output) and proves the copy
// is intact by comparing SHA-256 hashes. The source is resolved from
// this file's own URL, never from the process working directory.

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

const sourcePath = fileURLToPath(new URL('./entry.png', import.meta.url));
const source = readFileSync(sourcePath);

if (source.length === 0) {
  throw new Error(`entry image is empty: ${sourcePath}`);
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outputDir, { recursive: true });

const destPath = join(outputDir, 'entry.png');
writeFileSync(destPath, source);

const copied = readFileSync(destPath);
const sourceHash = sha256(source);
const copiedHash = sha256(copied);

if (sourceHash !== copiedHash) {
  throw new Error(`hash mismatch: source ${sourceHash} != copy ${copiedHash}`);
}

console.log(`entry.png copied to ${destPath} (${copied.length} bytes, sha256 ${copiedHash})`);
