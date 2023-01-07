import fss, { promises as fs } from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';

import { log } from './log.mjs';

export async function makeDir(dirpath) {
  const madeDir = await mkdirp(dirpath);
  if (madeDir) {
    log('📁', `Created ${madeDir}`);
  }
}

export async function copy(origin, destination) {
  await fs.copyFile(origin, destination);
  log('🚚', `Moved ${origin} to ${destination}`);
}

export async function move(origin, destination) {
  await fs.rename(origin, destination);
  log('🚚', `Moved ${origin} to ${destination}`);
}

export async function remove(filepath) {
  await fs.rm(filepath);
  log('🗑 ', `Deleted ${filepath}`);
}

const ignoredFilenames = new Set(['.DS_Store']);

export async function traverse(filepath) {
  const stats = fss.lstatSync(filepath);

  if (!stats.isDirectory()) {
    return path.resolve(filepath);
  }

  // Read filenames from directory.
  const filenames = await fs.readdir(filepath);

  // Filter out ignored filenames.
  const filtered = filenames.filter(
    (filename) => !ignoredFilenames.has(filename),
  );

  // Traverse each file.
  const promises = filtered.map(async (filename) => {
    return traverse(path.join(filepath, filename));
  });

  const filepaths = await Promise.all(promises);

  return filepaths.flat();
}
