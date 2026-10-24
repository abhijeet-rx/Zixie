function findNumber(numbers, target) {
  let low = 0;
  let high = numbers.length - 1;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (numbers[middle] === target) return middle;
    if (numbers[middle] < target) low = middle + 1;
    else high = middle - 1;
  }
  return -1;
}
