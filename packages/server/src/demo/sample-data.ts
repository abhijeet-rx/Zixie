import { CandidateSubmission } from '@zixie/engine';

export const DEMO_COHORT: CandidateSubmission[] = [
  {
    id: 'cand-alice',
    candidateName: 'Alice Vance',
    filename: 'alice_binary_search.js',
    language: 'javascript',
    sourceCode: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) {
      return mid;
    }
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}`,
  },
  {
    id: 'cand-bob',
    candidateName: 'Bob Miller',
    filename: 'bob_search.js',
    language: 'javascript',
    sourceCode: `// Binary search implementation
function binarySearch(data, key) {
  let low = 0;
  let high = data.length - 1;
  while (low <= high) {
    let middle = Math.floor((low + high) / 2);
    if (data[middle] === key) {
      return middle;
    }
    if (data[middle] < key) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return -1;
}`,
  },
  {
    id: 'cand-dave',
    candidateName: 'Dave Cooper',
    filename: 'dave_sol.js',
    language: 'javascript',
    sourceCode: `function binarySearch(elements, val) {
  let l = 0, r = elements.length - 1;
  while (l <= r) {
    let m = Math.floor((l + r) / 2);
    if (elements[m] === val) return m;
    if (elements[m] < val) {
      l = m + 1;
    } else {
      r = m - 1;
    }
  }
  return -1;
}`,
  },
  {
    id: 'cand-charlie',
    candidateName: 'Charlie Root',
    filename: 'charlie_quicksort.js',
    language: 'javascript',
    sourceCode: `function quickSort(items) {
  if (items.length <= 1) return items;
  const pivot = items[items.length - 1];
  const left = [];
  const right = [];
  for (let i = 0; i < items.length - 1; i++) {
    if (items[i] < pivot) left.push(items[i]);
    else right.push(items[i]);
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}`,
  },
  {
    id: 'cand-eve',
    candidateName: 'Eve Polastri',
    filename: 'eve_heap.js',
    language: 'javascript',
    sourceCode: `class MinHeap {
  constructor() {
    this.heap = [];
  }
  insert(val) {
    this.heap.push(val);
    this.bubbleUp();
  }
  bubbleUp() {
    let idx = this.heap.length - 1;
    while (idx > 0) {
      let pIdx = Math.floor((idx - 1) / 2);
      if (this.heap[pIdx] <= this.heap[idx]) break;
      [this.heap[pIdx], this.heap[idx]] = [this.heap[idx], this.heap[pIdx]];
      idx = pIdx;
    }
  }
}`,
  },
  {
    id: 'cand-frank',
    candidateName: 'Frank AI-Gen',
    filename: 'frank_optimal_search.js',
    language: 'javascript',
    sourceCode: `/**
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
}`,
  },
];
