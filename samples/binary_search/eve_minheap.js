class MinHeap {
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
}
