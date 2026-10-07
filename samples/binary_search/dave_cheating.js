function binarySearch(elements, val) {
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
}
