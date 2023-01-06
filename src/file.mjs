import { promises as fs } from 'fs';
import mkdirp from 'mkdirp';

import { log } from './log.mjs';

export async function dirp(dirpath) {
  log('dirp?', dirpath);
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
