function searchValue(values, wanted) {
  let start = 0;
  let end = values.length - 1;

  while (start <= end) {
    const center = Math.floor((start + end) / 2);
    if (values[center] === wanted) return center;
    if (values[center] < wanted) start = center + 1;
    else end = center - 1;
  }
  return -1;
}
