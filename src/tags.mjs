import { promises as fs } from 'fs';
import os from 'os';

const file = await fs.readFile('./unwritable-tags.txt', 'utf8');

// Split file on newlines.
const lines = file.split(os.EOL);

// Normalize and filter valid tags.
const tags = lines.map(normalize).filter(isValid);

// Keep track of unwritable tags so we can skip them in subsequent runs.
export const unwritableTags = new Set(tags);

// Keep track of discovered tags so we can add them to the list of unwritable tags.
export const discoveredUnwritableTags = new Set();

function normalize(line) {
  return line.trim();
}

function isValid(line) {
  return line.length > 0 && !isComment(line);
}

function isComment(line) {
  return line.startsWith('#');
}
