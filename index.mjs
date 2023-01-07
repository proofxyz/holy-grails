import { exiftool } from 'exiftool-vendored';
import path from 'path';
import { exit } from 'process';
import { v4 as uuid } from 'uuid';

import { copy, makeDir, move, remove, traverse } from './src/file.mjs';
import { log } from './src/log.mjs';
import { discoveredUnwritableTags, unwritableTags } from './src/tags.mjs';

// Constants
const ASSET_DIR = './assets';
const DIRTY_DIR = `${ASSET_DIR}/dirty`;
const PROCESSING_DIR = `${ASSET_DIR}/processing`;
const PROCESSED_DIR = `${ASSET_DIR}/processed`;
const CLEAN_DIR = `${ASSET_DIR}/clean`;

// Config
const DEBUG_MODE = false;

// Version
const version = await exiftool.version();
log('🏆', `Holy Grails is running ExifTool v${version}`);

if (DEBUG_MODE) {
  log('🐛', 'Debug mode enabled.');
}

const files = await traverse(DIRTY_DIR);

log('🤓', `Reading ${files.length} files from ${DIRTY_DIR}…`);

for (let i = 0, n = files.length; i < n; i += 1) {
  const file = files[i];
  const filepath = path.relative(DIRTY_DIR, file);
  const filename = path.basename(filepath);
  const dirtyFilepath = path.join(DIRTY_DIR, filepath);
  const processingFilepath = path.join(PROCESSING_DIR, filepath);
  const backupFilepath = `${processingFilepath}_original`;
  const parsedFilepath = path.parse(filepath);
  const obfuscatedFilepath = path.format({
    dir: parsedFilepath.dir,
    name: uuid(),
    ext: parsedFilepath.ext,
  });
  const cleanFilepath = path.join(CLEAN_DIR, obfuscatedFilepath);
  const processedFilepath = path.join(PROCESSED_DIR, filepath);

  log('🖼 ', dirtyFilepath, filepath);

  // Create nested processing directory, if it doesn't exist.
  await makeDir(path.dirname(processingFilepath));

  // Copy dirty file to processing file. ExifTool will back up the file, but
  // it adds a suffix to the filename, which is "destructive".
  await copy(dirtyFilepath, processingFilepath);

  // Read tags from file.
  const tags = await exiftool.read(processingFilepath);
  const entries = Object.entries(tags);

  if (DEBUG_MODE) {
    entries.forEach(([key, value]) => {
      log('🔍', `${key}: ${value}`);
    });
  }

  // Attempt to delete tags, one at a time.
  // TODO check to see if we can delete all tags at once.
  for (const [key] of entries) {
    // Skip unwritable tags.
    if (unwritableTags.has(key)) continue;

    try {
      await exiftool.write(processingFilepath, { [key]: null });
      log('🟢', `Removed ${key} from ${filename}`);
    } catch (error) {
      log('⛔️', `Unable to remove ${key} from ${filename}`);
      unwritableTags.add(key);
      discoveredUnwritableTags.add(key);
    }
  }

  // Delete backup file.
  await remove(backupFilepath);

  // Create nested clean directory, if it doesn't exist.
  await makeDir(path.dirname(cleanFilepath));

  // Move processing file to clean directory.
  await move(processingFilepath, cleanFilepath);

  // Create nested processed directory, if it doesn't exist.
  await makeDir(path.dirname(processedFilepath));

  // Move dirty file to processed directory.
  await move(dirtyFilepath, processedFilepath);

  // Report status
  const remaining = files.length - i - 1;
  if (remaining > 0) {
    log('💪', `${remaining}/${files.length} files remaining…`);
  } else {
    log('🙌', 'Done!');
  }
}

// Log discovered unwritable tags so that they can be added to tags.txt.
if (discoveredUnwritableTags.size > 0) {
  const newTags = Array.from(discoveredUnwritableTags);
  log('🚫', `Discovered new unwritable tags: ${newTags.join(', ')}`);
}

exit(0);
