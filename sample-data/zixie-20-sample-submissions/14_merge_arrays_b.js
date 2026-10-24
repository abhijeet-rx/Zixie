function combineSorted(left, right) {
  const output = [];
  let a = 0;
  let b = 0;

  while (a < left.length && b < right.length) {
    if (left[a] <= right[b]) output.push(left[a++]);
    else output.push(right[b++]);
  }
  return output.concat(left.slice(a), right.slice(b));
}
