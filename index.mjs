import path from 'path';
import { v4 as uuid } from 'uuid';

import {
  CLEAN_DIR,
  DEBUG_MODE,
  PROCESSING_DIR,
  SOURCE_DIR,
} from './src/constants.mjs';
import { ORIGINAL_SUFFIX, removeTags } from './src/exif.mjs';
import { copy, move, remove, traverse, write } from './src/file.mjs';
import { log } from './src/log.mjs';

if (DEBUG_MODE) {
  log('🐛', 'Debug mode enabled.');
}

const files = await traverse(SOURCE_DIR);
log('🤓', `Processing ${files.length} files from ${SOURCE_DIR}…`);
log('------------------------------------------------------------------------');

// Calculate padding for log output.
const lengths = files.map((file) => file.length);
const maxLength = Math.max(...lengths);
const padLength = maxLength - path.resolve(SOURCE_DIR).length;

let successCount = 0;
let errorCount = 0;

function count() {
  const processedCount = successCount + errorCount;
  return `(${processedCount}/${files.length})`;
}

let directoryIndex = -1;
let previousSourceDir = '';

// Create manifest for accounting.
const manifest = [['source', 'clean']];

for (let i = 0, n = files.length; i < n; i += 1) {
  // Original file info
  const sourceFile = files[i];
  const pathRelativeToSourceDirectory = path.relative(SOURCE_DIR, sourceFile);
  const sourceDir = path.dirname(pathRelativeToSourceDirectory);
  const sourceExt = path.extname(sourceFile);

  // The processing file is a temporary copy of the source file, used during
  // processing and removed afterward.
  const processingFile = path.format({
    dir: path.join(PROCESSING_DIR, sourceDir),
    name: uuid(),
    ext: sourceExt,
  });

  const backupFile = `${processingFile}${ORIGINAL_SUFFIX}`;

  // The clean file is the asset without its original metadata.
  if (sourceDir !== previousSourceDir) {
    previousSourceDir = sourceDir;
    directoryIndex = 0;
  } else {
    directoryIndex++;
  }

  const cleanFile = path.format({
    dir: path.join(CLEAN_DIR, sourceDir),
    name: directoryIndex.toString(),
    ext: sourceExt,
  });

  // Copy source file to a temporary processing directory.
  await copy(sourceFile, processingFile);

  try {
    // Remove tags.
    await removeTags(processingFile);

    // Increment success count.
    successCount++;

    // Move processed file to clean directory.
    await move(processingFile, cleanFile);

    // Remove backup file.
    await remove(backupFile);

    // Log status.
    const pathRelativeToCleanDirectory = path.relative(CLEAN_DIR, cleanFile);
    log(
      `🟢 ${count()}\t${pathRelativeToSourceDirectory.padEnd(
        padLength,
        ' ',
      )} ${pathRelativeToCleanDirectory}`,
    );

    // Add to manifest.
    manifest.push([
      pathRelativeToSourceDirectory,
      pathRelativeToCleanDirectory,
    ]);
  } catch (error) {
    // Increment error count.
    errorCount++;

    // Remove processing file.
    await remove(processingFile);

    // Log status.
    if (typeof error === 'string') {
      // Processing error.
      const exifError = error.split(' - ')[0];
      log(`🔴 ${count()}\t${pathRelativeToSourceDirectory}`);
      log(`\t\t${exifError}`);
    } else {
      // Misc. error.
      log('🟡', error.message.trim());
    }
  }
}

await remove(PROCESSING_DIR);

log('------------------------------------------------------------------------');

// Write manifest.csv.
const csvFile = path.join(CLEAN_DIR, 'manifest.csv');
const csvData = manifest
  .map((row) => row.map((str) => `"${str}"`).join(','))
  .join('\n');

await write(csvData, csvFile);
log('📝', 'manifest.csv written.');

// Done!
if (errorCount > 0) {
  const pluralized = errorCount > 1 ? 'errors' : 'error';
  log('✋', `Done. Encountered ${errorCount} ${pluralized}.`);
} else {
  log('🙌', 'Done! All files processed successfully.');
}
