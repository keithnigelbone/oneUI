/**
 * hammingDistance — bit-popcount over the XOR of two 16-char hex pHashes.
 *
 * Promoted from @jds/kb-web to @jds/kb-core so every SDK (web / rn / ios /
 * android / flutter) compares pHashes against the same canonical
 * implementation. Pairs with PHASH_HAMMING_THRESHOLD from this directory's
 * sibling `thresholds.ts`.
 */

export function hammingDistance(a: string, b: string): number {
  if (a.length !== b.length) {
    throw new Error('hammingDistance: hex lengths differ');
  }
  let total = 0;
  for (let i = 0; i < a.length; i++) {
    const xor = parseInt(a[i]!, 16) ^ parseInt(b[i]!, 16);
    let v = xor;
    while (v !== 0) {
      v &= v - 1;
      total += 1;
    }
  }
  return total;
}
