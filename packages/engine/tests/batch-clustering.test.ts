import { describe, it, expect } from 'vitest';
import { analyzeCandidateCohort, CandidateSubmission } from '../src/index.js';

describe('Cohort Batch Processing & Collusion Clustering', () => {
  const codeSolutionA = `
    function binarySearch(arr, target) {
      let left = 0;
      let right = arr.length - 1;
      while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
      }
      return -1;
    }
  `;

  // Renamed variables & comments (Bob)
  const codeSolutionB = `
    // Binary search algorithm
    function binarySearch(data, key) {
      let low = 0;
      let high = data.length - 1;
      while (low <= high) {
        let middle = Math.floor((low + high) / 2);
        if (data[middle] === key) return middle;
        if (data[middle] < key) low = middle + 1;
        else high = middle - 1;
      }
      return -1;
    }
  `;

  // Re-formatted (Dave)
  const codeSolutionD = `
    function binarySearch(elements, val) {
      let l = 0, r = elements.length - 1;
      while (l <= r) {
        let m = Math.floor((l + r) / 2);
        if (elements[m] === val) {
          return m;
        }
        if (elements[m] < val) {
          l = m + 1;
        } else {
          r = m - 1;
        }
      }
      return -1;
    }
  `;

  // Honest candidate Charlie: QuickSort
  const codeSolutionCharlie = `
    function quickSort(items) {
      if (items.length <= 1) return items;
      const pivot = items[items.length - 1];
      const left = [];
      const right = [];
      for (let i = 0; i < items.length - 1; i++) {
        if (items[i] < pivot) left.push(items[i]);
        else right.push(items[i]);
      }
      return [...quickSort(left), pivot, ...quickSort(right)];
    }
  `;

  // AI-generated submission Frank
  const codeSolutionFrank = `
    /**
     * Binary Search implementation.
     * Time Complexity: O(log n)
     * Space Complexity: O(1)
     */
    function search(nums, target) {
      // Initialize the pointers
      let leftPointer = 0;
      let rightPointer = nums.length - 1;

      // Iterate through the array
      while (leftPointer <= rightPointer) {
        const mid = Math.floor((leftPointer + rightPointer) / 2);
        // Base case check
        if (nums[mid] === target) {
          return mid;
        } else if (nums[mid] < target) {
          leftPointer = mid + 1;
        } else {
          rightPointer = mid - 1;
        }
      }
      return -1;
    }
  `;

  const cohort: CandidateSubmission[] = [
    { id: 'cand-alice', candidateName: 'Alice', filename: 'alice.js', language: 'javascript', sourceCode: codeSolutionA },
    { id: 'cand-bob', candidateName: 'Bob', filename: 'bob.js', language: 'javascript', sourceCode: codeSolutionB },
    { id: 'cand-dave', candidateName: 'Dave', filename: 'dave.js', language: 'javascript', sourceCode: codeSolutionD },
    { id: 'cand-charlie', candidateName: 'Charlie', filename: 'charlie.js', language: 'javascript', sourceCode: codeSolutionCharlie },
    { id: 'cand-frank', candidateName: 'Frank', filename: 'frank.js', language: 'javascript', sourceCode: codeSolutionFrank },
  ];

  it('detects collusion rings and separates honest candidates', () => {
    const report = analyzeCandidateCohort(cohort);

    expect(report.summary.totalCandidates).toBe(5);
    expect(report.summary.totalComparisons).toBe(10); // 5 * 4 / 2

    // Alice, Bob, and Dave should form a collusion ring
    expect(report.collusionRings.length).toBeGreaterThanOrEqual(1);
    const ring = report.collusionRings[0];
    expect(ring.candidateNames).toContain('Alice');
    expect(ring.candidateNames).toContain('Bob');
    expect(ring.candidateNames).toContain('Dave');

    // Charlie should be clear
    const charlieNode = report.nodes.find((n) => n.id === 'cand-charlie');
    expect(charlieNode?.riskLevel).toBe('LOW');
    expect(charlieNode?.clusterId).toBeUndefined();

    // Frank should be flagged by the AI detection pipeline
    const frankNode = report.nodes.find((n) => n.id === 'cand-frank');
    expect(frankNode?.aiVerdict).toBe('AI_GENERATED_LIKELY');
    expect(frankNode?.riskLevel).toBe('HIGH');
  });
});
