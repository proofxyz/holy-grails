let started;

export function log(...args) {
  const ts = new Date().toLocaleString();

  if (!started) {
    started = Date.now();
  }

  const elapsed = Date.now() - started;
  const seconds = elapsed / 1000;

  console.log(ts, `(${seconds.toFixed(1)}s)`, ...args);
}
