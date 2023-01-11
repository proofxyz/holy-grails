import { exec } from 'child_process';
import exiftool from 'dist-exiftool';

export const ORIGINAL_SUFFIX = '_original';

export async function removeTags(file) {
  return new Promise((resolve, reject) => {
    exec(`${exiftool} -all:all= ${file}`, (error, stdout, stderr) => {
      if (error) {
        return reject(stderr);
      }
      resolve(stdout);
    });
  });
}
