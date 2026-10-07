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
