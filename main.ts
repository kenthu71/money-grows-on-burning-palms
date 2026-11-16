// Money Grows on Burning Palms — ai-excited-01 entry.
//
// Copies the entry.png that sits beside this script into the output
// directory ($MAKEFUN_OUTPUT_DIR, default /output), streaming it in
// chunks so memory use stays flat no matter how large the image is,
// and hashing the source as it flows through. The source is resolved
// from this file's own URL, never from the process working directory.

import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream, mkdirSync, renameSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const sourcePath = fileURLToPath(new URL('./entry.png', import.meta.url));

// Preflight: fail fast, before writing anything, if the entry image is
// missing, empty, or over the competition's 1 MiB cap for entry images.
const MAX_IMAGE_BYTES = 1_048_576;
let sourceStat;
try {
  sourceStat = statSync(sourcePath);
} catch {
  throw new Error(`entry image is missing: ${sourcePath}`);
}
if (!sourceStat.isFile() || sourceStat.size === 0) {
  throw new Error(`entry image is empty: ${sourcePath}`);
}
if (sourceStat.size > MAX_IMAGE_BYTES) {
  throw new Error(`entry image is ${sourceStat.size} bytes, over the ${MAX_IMAGE_BYTES}-byte cap: ${sourcePath}`);
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outputDir, { recursive: true });

const destPath = join(outputDir, 'entry.png');

// Publish atomically: stream to a temp file in the same directory,
// verify the temp file end to end, and only then rename it over
// entry.png. A failed run deletes the temp file instead, so a partial
// entry.png is never left behind.
const tempPath = join(outputDir, `.entry.png.tmp-${process.pid}`);

try {
  const hash = createHash('sha256');
  let sourceBytes = 0;
  const meter = new Transform({
    transform(chunk, _encoding, callback) {
      hash.update(chunk);
      sourceBytes += chunk.length;
      callback(null, chunk);
    },
  });

  await pipeline(createReadStream(sourcePath), meter, createWriteStream(tempPath));

  if (sourceBytes === 0) {
    throw new Error(`entry image is empty: ${sourcePath}`);
  }

  const sourceHash = hash.digest('hex');

  // Verify end to end: hash the temp file that actually landed on
  // disk, not just the bytes that left the source, so a truncated or
  // corrupted write is caught here instead of surfacing downstream.
  const verifyHash = createHash('sha256');
  let writtenBytes = 0;
  for await (const chunk of createReadStream(tempPath)) {
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

  renameSync(tempPath, destPath);

  console.log(`entry.png copied to ${destPath} (verified ${writtenBytes} bytes, sha256 ${writtenHash.slice(0, 12)}…)`);
} catch (err) {
  try {
    unlinkSync(tempPath);
  } catch {
    // Temp file already gone; nothing to clean up.
  }
  throw err;
}
