import { describe, it, expect } from 'vitest';
import {
  tokenizeAndNormalize,
  winnow,
  calculateFingerprintSimilarity,
  greedyStringTiling,
  compareSubmissions,
  detectAiGeneratedCode,
  CandidateSubmission,
} from '../src/index.js';

describe('Lexical Normalizer & Tokenizer', () => {
  it('strips comments and normalizes variables', () => {
    const code = `
      // Calculate sum of array
      int calculateSum(int arr[], int n) {
        /* loop through elements */
        int total = 0;
        for (int i = 0; i < n; i++) {
          total += arr[i];
        }
        return total;
      }
    `;
    const normalized = tokenizeAndNormalize(code);

    // Comments should not be present
    expect(normalized.tokenString).not.toContain('Calculate');
    expect(normalized.tokenString).not.toContain('loop');

    // Keywords should be preserved
    expect(normalized.tokenString).toContain('int');
    expect(normalized.tokenString).toContain('for');
    expect(normalized.tokenString).toContain('return');

    // Custom variable names should be masked to $ID
    expect(normalized.tokenString).toContain('$ID');
  });
});

describe('Greedy String Tiling & Winnowing', () => {
  const codeOriginal = `
    function findMedianSortedArrays(nums1, nums2) {
      const merged = [];
      let i = 0, j = 0;
      while (i < nums1.length && j < nums2.length) {
        if (nums1[i] < nums2[j]) {
          merged.push(nums1[i++]);
        } else {
          merged.push(nums2[j++]);
        }
      }
      return merged;
    }
  `;

  const codePlagiarizedRenamed = `
    // Completely renamed variables and added arbitrary comments
    function findMedianSortedArrays(firstList, secondList) {
      const combinedArr = [];
      let ptr1 = 0, ptr2 = 0;
      while (ptr1 < firstList.length && ptr2 < secondList.length) {
        if (firstList[ptr1] < secondList[ptr2]) {
          combinedArr.push(firstList[ptr1++]);
        } else {
          combinedArr.push(secondList[ptr2++]);
        }
      }
      return combinedArr;
    }
  `;

  const codeDifferent = `
    class Stack {
      constructor() {
        this.items = [];
      }
      push(element) {
        this.items.push(element);
      }
      pop() {
        if (this.items.length === 0) return null;
        return this.items.pop();
      }
    }
  `;

  it('detects high similarity despite variable renaming (Plagiarism scenario)', () => {
    const candA: CandidateSubmission = {
      id: 'cand-1',
      candidateName: 'Alice',
      filename: 'solution.js',
      language: 'javascript',
      sourceCode: codeOriginal,
    };

    const candB: CandidateSubmission = {
      id: 'cand-2',
      candidateName: 'Bob',
      filename: 'solution_bob.js',
      language: 'javascript',
      sourceCode: codePlagiarizedRenamed,
    };

    const result = compareSubmissions(candA, candB);

    expect(result.similarityScore).toBeGreaterThanOrEqual(0.85);
    expect(result.verdict).toBe('COLLUSION_DETECTED');
    expect(result.matchedTiles.length).toBeGreaterThan(0);
  });

  it('reports low similarity for completely independent implementations', () => {
    const candA: CandidateSubmission = {
      id: 'cand-1',
      candidateName: 'Alice',
      filename: 'solution.js',
      language: 'javascript',
      sourceCode: codeOriginal,
    };

    const candC: CandidateSubmission = {
      id: 'cand-3',
      candidateName: 'Charlie',
      filename: 'stack.js',
      language: 'javascript',
      sourceCode: codeDifferent,
    };

    const result = compareSubmissions(candA, candC);

    expect(result.similarityScore).toBeLessThan(0.30);
    expect(result.verdict).toBe('CLEAR');
  });
});

describe('AI Code Generation Detection', () => {
  it('flags textbook LLM-generated code with structured comments & complexity markers', () => {
    const aiCode = `
      /**
       * Two-pointer approach to solve Two Sum.
       * Time Complexity: O(n)
       * Space Complexity: O(1)
       */
      function twoSum(nums, target) {
        // Initialize the pointers
        let leftPointer = 0;
        let rightPointer = nums.length - 1;

        // Iterate through the array
        while (leftPointer < rightPointer) {
          const currentSum = nums[leftPointer] + nums[rightPointer];

          // Base cases check
          if (currentSum === target) {
            return [leftPointer, rightPointer];
          } else if (currentSum < target) {
            leftPointer++;
          } else {
            rightPointer--;
          }
        }
        return [-1, -1];
      }
    `;

    const result = detectAiGeneratedCode('cand-ai', aiCode);

    expect(result.aiProbability).toBeGreaterThanOrEqual(0.70);
    expect(result.verdict).toBe('AI_GENERATED_LIKELY');
    expect(result.heuristicIndicators.verboseDocstrings).toBe(true);
    expect(result.heuristicIndicators.canonicalNamingPattern).toBe(true);
  });

  it('recognizes typical human rushed contest code as likely human', () => {
    const humanCode = `
      function solve(a, t) {
        let i = 0, j = a.length - 1;
        while(i < j) {
          let s = a[i] + a[j];
          if(s == t) return [i, j];
          if(s < t) i++;
          else j--;
        }
        return [-1, -1];
      }
    `;

    const result = detectAiGeneratedCode('cand-human', humanCode);

    expect(result.aiProbability).toBeLessThan(0.40);
    expect(result.verdict).toBe('HUMAN_LIKELY');
  });
});
