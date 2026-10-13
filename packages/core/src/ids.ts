/** Small random id, good enough for a single-device local database. */
export function newId(prefix = ''): string {
  const bytes = new Uint8Array(12);
  const g = (globalThis as { crypto?: Crypto }).crypto;
  if (g && typeof g.getRandomValues === 'function') {
    g.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return prefix ? `${prefix}_${out}` : out;
}
