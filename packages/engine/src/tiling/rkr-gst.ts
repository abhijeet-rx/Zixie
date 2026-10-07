import { Token, MatchTile } from '../types.js';

interface RawMatch {
  aStart: number;
  bStart: number;
  length: number;
}

/**
 * Greedy String Tiling (RKR-GST / JPlag algorithm)
 * Finds maximal non-overlapping matching tiles between two token sequences.
 */
export function greedyStringTiling(
  tokensA: Token[],
  tokensB: Token[],
  minMatchLength = 5
): { tiles: MatchTile[]; similarity: number } {
  if (tokensA.length === 0 || tokensB.length === 0) {
    return { tiles: [], similarity: 0 };
  }

  const markedA = new Uint8Array(tokensA.length);
  const markedB = new Uint8Array(tokensB.length);
  const tiles: MatchTile[] = [];

  let searchLength = Math.min(tokensA.length, tokensB.length);

  while (searchLength >= minMatchLength) {
    let maxmatch = searchLength;
    const matches: RawMatch[] = [];

    // Scan for all maximal matches of length >= searchLength
    for (let a = 0; a < tokensA.length; a++) {
      if (markedA[a]) continue;

      for (let b = 0; b < tokensB.length; b++) {
        if (markedB[b]) continue;

        let k = 0;
        while (
          a + k < tokensA.length &&
          b + k < tokensB.length &&
          !markedA[a + k] &&
          !markedB[b + k] &&
          tokensA[a + k].value === tokensB[b + k].value
        ) {
          k++;
        }

        if (k > maxmatch) {
          matches.length = 0; // reset, found longer match
          maxmatch = k;
          matches.push({ aStart: a, bStart: b, length: k });
        } else if (k === maxmatch && k >= minMatchLength) {
          matches.push({ aStart: a, bStart: b, length: k });
        }
      }
    }

    // Mark matched tokens and create tiles
    for (const match of matches) {
      let isOverlapping = false;
      for (let i = 0; i < match.length; i++) {
        if (markedA[match.aStart + i] || markedB[match.bStart + i]) {
          isOverlapping = true;
          break;
        }
      }

      if (!isOverlapping) {
        for (let i = 0; i < match.length; i++) {
          markedA[match.aStart + i] = 1;
          markedB[match.bStart + i] = 1;
        }

        const aStartToken = tokensA[match.aStart];
        const aEndToken = tokensA[match.aStart + match.length - 1];
        const bStartToken = tokensB[match.bStart];
        const bEndToken = tokensB[match.bStart + match.length - 1];

        tiles.push({
          sourceStartLine: aStartToken.line,
          sourceEndLine: aEndToken.line,
          targetStartLine: bStartToken.line,
          targetEndLine: bEndToken.line,
          tokenCount: match.length,
          sourceTokenIndex: match.aStart,
          targetTokenIndex: match.bStart,
        });
      }
    }

    if (maxmatch > searchLength) {
      searchLength = maxmatch - 1;
    } else {
      searchLength = maxmatch - 1;
    }
  }

  // Calculate total matched tokens
  let totalMatched = 0;
  for (let i = 0; i < markedA.length; i++) {
    if (markedA[i]) totalMatched++;
  }
  let totalMatchedB = 0;
  for (let i = 0; i < markedB.length; i++) {
    if (markedB[i]) totalMatchedB++;
  }

  const similarity = (totalMatched + totalMatchedB) / (tokensA.length + tokensB.length);

  return { tiles, similarity };
}
