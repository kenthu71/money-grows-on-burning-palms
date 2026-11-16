// Money Grows on Burning Palms — ai-excited-01 entry.
//
// Copies the entry.png that sits beside this script into the output
// directory ($MAKEFUN_OUTPUT_DIR, default /output), streaming it in
// chunks so memory use stays flat no matter how large the image is,
// and hashing the source as it flows through. The source is resolved
// from this file's own URL, never from the process working directory.

import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const sourcePath = fileURLToPath(new URL('./entry.png', import.meta.url));

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outputDir, { recursive: true });

const destPath = join(outputDir, 'entry.png');

const hash = createHash('sha256');
let sourceBytes = 0;
const meter = new Transform({
  transform(chunk, _encoding, callback) {
    hash.update(chunk);
    sourceBytes += chunk.length;
    callback(null, chunk);
  },
});

await pipeline(createReadStream(sourcePath), meter, createWriteStream(destPath));

if (sourceBytes === 0) {
  throw new Error(`entry image is empty: ${sourcePath}`);
}

const sourceHash = hash.digest('hex');

// Verify end to end: hash the file that actually landed on disk, not
// just the bytes that left the source, so a truncated or corrupted
// write is caught here instead of surfacing downstream.
const verifyHash = createHash('sha256');
let writtenBytes = 0;
for await (const chunk of createReadStream(destPath)) {
  verifyHash.update(chunk);
  writtenBytes += chunk.length;
}
const writtenHash = verifyHash.digest('hex');

if (writtenBytes !== sourceBytes) {
  throw new Error(`byte count mismatch: source ${sourceBytes} bytes != written ${writtenBytes} bytes`);
}
if (writtenHash !== sourceHash) {
  throw new Error(`hash mismatch: source ${sourceHash} != written ${writtenHash}`);
}

console.log(`entry.png copied to ${destPath} (verified ${writtenBytes} bytes, sha256 ${writtenHash.slice(0, 12)}…)`);
