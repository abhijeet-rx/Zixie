// Binary search algorithm implementation
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
}
