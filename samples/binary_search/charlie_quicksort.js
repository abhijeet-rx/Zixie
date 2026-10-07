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
