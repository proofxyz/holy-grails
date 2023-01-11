import path from 'path';
import { v4 as uuid } from 'uuid';

import {
  CLEAN_DIR,
  DEBUG_MODE,
  ERROR_DIR,
  PROCESSING_DIR,
  SOURCE_DIR,
} from './src/constants.mjs';
import { ORIGINAL_SUFFIX, removeTags } from './src/exif.mjs';
import { copy, move, remove, traverse } from './src/file.mjs';
import { log } from './src/log.mjs';

if (DEBUG_MODE) {
  log('🐛', 'Debug mode enabled.');
}

const files = await traverse(SOURCE_DIR);
log('🤓', `Processing ${files.length} files from ${SOURCE_DIR}…`);

let successCount = 0;
let errorCount = 0;

function count() {
  const processedCount = successCount + errorCount;
  return `(${processedCount}/${files.length})`;
}

for (let i = 0, n = files.length; i < n; i += 1) {
  // Original file info
  const sourceFile = files[i];
  const pathRelativeToSourceDirectory = path.relative(SOURCE_DIR, sourceFile);
  const sourceDir = path.dirname(pathRelativeToSourceDirectory);
  const sourceExt = path.extname(sourceFile);
  const sourceName = path.basename(sourceFile, sourceExt);

  // The processing file is a temporary copy of the source file, used during
  // processing and removed afterward.
  const processingFile = path.format({
    dir: path.join(PROCESSING_DIR, sourceDir),
    name: uuid(),
    ext: sourceExt,
  });

  const backupFile = `${processingFile}${ORIGINAL_SUFFIX}`;

  // The clean file is the asset without its original metadata.
  const cleanFile = path.format({
    dir: path.join(CLEAN_DIR, sourceDir),
    name: uuid(),
    ext: sourceExt,
  });

  // The error file is a copy of the original asset.
  const errorFile = path.format({
    dir: path.join(ERROR_DIR, sourceDir),
    name: sourceName,
    ext: sourceExt,
  });

  // Begin!
  if (DEBUG_MODE) {
    log('🖼 ', pathRelativeToSourceDirectory);
  }

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
    log('🟢', count(), pathRelativeToSourceDirectory);
  } catch (error) {
    // Increment error count.
    errorCount++;

    // Remove processing file.
    await remove(processingFile);

    // Copy unprocessed file to error directory.
    await copy(sourceFile, errorFile);

    // Log status.
    if (typeof error === 'string') {
      // Processing error.
      log('🔴', count(), error.trim());
    } else {
      // Misc. error.
      log('🟡', error.message.trim());
    }
  }

  // Report status

  const remaining = files.length - i - 1;
  if (remaining > 0) {
    if (DEBUG_MODE) {
      log('💪', `${remaining}/${files.length} files remaining…`);
    }
  } else {
    log('------------------------------------');
    if (errorCount > 0) {
      const pluralized = errorCount > 1 ? 'errors' : 'error';
      log('✋', `Done. Encountered ${errorCount} ${pluralized}.`);
    } else {
      log('🙌', 'Done! All files processed successfully.');
    }
  }
}
