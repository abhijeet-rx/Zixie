import { Token, Fingerprint } from '../types.js';

const MOD = 1_000_000_007;
const BASE = 313;

/**
 * Computes polynomial rolling hash for an array of token strings
 */
function hashTokens(tokens: Token[], start: number, k: number): number {
  let h = 0;
  for (let i = 0; i < k; i++) {
    const val = tokens[start + i].value;
    for (let charIdx = 0; charIdx < val.length; charIdx++) {
      h = (h * BASE + val.charCodeAt(charIdx)) % MOD;
    }
  }
  return h;
}

/**
 * Computes Winnowed fingerprints from token stream (Stanford MOSS algorithm)
 * @param tokens Stream of normalized tokens
 * @param k Noise threshold / k-gram size (default: 8 tokens)
 * @param w Window size (default: 6)
 */
export function winnow(tokens: Token[], k = 8, w = 6): Fingerprint[] {
  if (tokens.length < k) {
    return [];
  }

  // 1. Calculate all k-gram hashes
  const n = tokens.length - k + 1;
  const hashes: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    hashes[i] = hashTokens(tokens, i, k);
  }

  // 2. Sliding window minimum selection
  const fingerprints: Fingerprint[] = [];
  let minIndex = -1;

  for (let i = 0; i <= n - w; i++) {
    let windowMin = Infinity;
    let windowMinIdx = -1;

    for (let j = 0; j < w; j++) {
      const idx = i + j;
      // In case of tie, pick the rightmost minimum (<=)
      if (hashes[idx] <= windowMin) {
        windowMin = hashes[idx];
        windowMinIdx = idx;
      }
    }

    if (windowMinIdx !== minIndex) {
      minIndex = windowMinIdx;
      fingerprints.push({
        hash: windowMin,
        position: minIndex,
        line: tokens[minIndex].line,
      });
    }
  }

  return fingerprints;
}

/**
 * Calculates similarity coefficient between two sets of fingerprints
 */
export function calculateFingerprintSimilarity(
  fpA: Fingerprint[],
  fpB: Fingerprint[]
): number {
  if (fpA.length === 0 || fpB.length === 0) {
    return 0;
  }

  const setB = new Map<number, number>();
  for (const fp of fpB) {
    setB.set(fp.hash, (setB.get(fp.hash) || 0) + 1);
  }

  let intersectionCount = 0;
  for (const fp of fpA) {
    const count = setB.get(fp.hash);
    if (count && count > 0) {
      intersectionCount++;
      setB.set(fp.hash, count - 1);
    }
  }

  // Sorensen-Dice coefficient
  return (2 * intersectionCount) / (fpA.length + fpB.length);
}
