import { analyzeCandidateCohort, type CandidateSubmission as EngineCandidate } from '@zixie/engine';
import { toAnalysisReport, type StoredReport } from '../lib/api';

export const sampleCandidates: EngineCandidate[] = [
  {
    id: 'sample-student-01',
    candidateName: 'Student 01',
    filename: 'two_sum_scan.ts',
    language: 'typescript',
    sourceCode: `function findPair(values: number[], target: number): number[] | null {
  const positions = new Map<number, number>();
  for (let index = 0; index < values.length; index += 1) {
    const needed = target - values[index];
    if (positions.has(needed)) {
      return [positions.get(needed)!, index];
    }
    positions.set(values[index], index);
  }
  return null;
}`,
  },
  {
    id: 'sample-student-02',
    candidateName: 'Student 02',
    filename: 'pair_lookup.ts',
    language: 'typescript',
    sourceCode: `function findIndices(numbers: number[], sum: number): number[] | null {
  const seenValues = new Map<number, number>();
  for (let position = 0; position < numbers.length; position += 1) {
    const complement = sum - numbers[position];
    if (seenValues.has(complement)) {
      return [seenValues.get(complement)!, position];
    }
    seenValues.set(numbers[position], position);
  }
  return null;
}`,
  },
  {
    id: 'sample-student-03',
    candidateName: 'Student 03',
    filename: 'two_sum_explained.ts',
    language: 'typescript',
    sourceCode: `// Time complexity: O(n log n), including the initial ordering step.
// Helper function to iterate through the sorted array elements.
function findTargetPair(inputValues: number[], desiredTotal: number): number[] | null {
  const indexedValues = inputValues.map((value, originalIndex) => ({ value, originalIndex }));
  indexedValues.sort((first, second) => first.value - second.value);
  let leftPointer = 0;
  let rightPointer = indexedValues.length - 1;
  while (leftPointer < rightPointer) {
    const currentSum = indexedValues[leftPointer].value + indexedValues[rightPointer].value;
    if (currentSum === desiredTotal) {
      // Return the result after both values meet the target.
      return [indexedValues[leftPointer].originalIndex, indexedValues[rightPointer].originalIndex];
    }
    if (currentSum < desiredTotal) leftPointer += 1;
    else rightPointer -= 1;
  }
  return null;
}`,
  },
];

export async function createLocalSampleReport() {
  const createdAt = new Date().toISOString();
  const stored: StoredReport = {
    reportId: 'sample-two-sum-review',
    ownerId: 'local-preview',
    createdAt,
    candidates: sampleCandidates,
    report: analyzeCandidateCohort(sampleCandidates),
  };
  const report = await toAnalysisReport(stored);
  return { ...report, batchName: 'Sample batch · Two Sum review' };
}
