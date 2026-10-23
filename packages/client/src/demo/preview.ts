import { analyzeCandidateCohort } from "@zixie/engine";
import type { CandidateSubmission } from "@zixie/engine";
import type { BatchReportPayload } from "../types/zixie";

const candidates: CandidateSubmission[] = [
  {
    id: "preview-alex",
    candidateName: "Alex Morgan",
    filename: "alex_binary_search.js",
    language: "javascript",
    sourceCode: `function binarySearch(values, target) {
  let low = 0;
  let high = values.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (values[middle] === target) return middle;
    if (values[middle] < target) low = middle + 1;
    else high = middle - 1;
  }
  return -1;
}`,
  },
  {
    id: "preview-jamie",
    candidateName: "Jamie Chen",
    filename: "jamie_search.js",
    language: "javascript",
    sourceCode: `function findValue(items, sought) {
  let left = 0;
  let right = items.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (items[mid] === sought) return mid;
    if (items[mid] < sought) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
  },
  {
    id: "preview-sam",
    candidateName: "Sam Rivera",
    filename: "sam_merge_sort.py",
    language: "python",
    sourceCode: `def merge_sort(values):
    if len(values) < 2:
        return values
    middle = len(values) // 2
    left = merge_sort(values[:middle])
    right = merge_sort(values[middle:])
    result = []
    while left and right:
        if left[0] < right[0]:
            result.append(left.pop(0))
        else:
            result.append(right.pop(0))
    return result + left + right`,
  },
];

const analysis = analyzeCandidateCohort(candidates);
const pairResults = analysis.pairwiseResults.map((pair) => ({
  ...pair,
  matchedTiles: pair.matchedTiles.map((tile) => ({
    sourceStartLine: tile.sourceStartLine,
    sourceEndLine: tile.sourceEndLine,
    targetStartLine: tile.targetStartLine,
    targetEndLine: tile.targetEndLine,
    tokenCount: tile.tokenCount,
  })),
}));

const aiResults = Object.values(analysis.aiResults).map((signal) => ({
  candidateId: signal.candidateId,
  aiProbability: signal.aiProbability,
  reasons: signal.reasons,
  flags: signal.heuristicIndicators,
  verdict: signal.verdict,
}));

export const localPreviewPayload: BatchReportPayload = {
  reportId: "local-preview",
  source: "demo",
  candidates,
  report: {
    generatedAt: new Date().toISOString(),
    pairResults,
    aiResults,
    clusters: analysis.collusionRings.map((ring) => {
      const memberIds = new Set(ring.candidateIds);
      const scores = pairResults
        .filter((pair) => memberIds.has(pair.candidateAId) && memberIds.has(pair.candidateBId))
        .map((pair) => pair.similarityScore);
      return {
        id: `preview-cluster-${ring.ringId}`,
        candidateIds: ring.candidateIds,
        maxSimilarity: Math.max(0, ...scores),
        averageSimilarity: ring.averageSimilarity,
      };
    }),
  },
};
