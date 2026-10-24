function recursiveSearch(items, value, left = 0, right = items.length - 1) {
  if (left > right) return -1;
  const point = Math.floor((left + right) / 2);
  if (items[point] === value) return point;
  if (items[point] > value) return recursiveSearch(items, value, left, point - 1);
  return recursiveSearch(items, value, point + 1, right);
}
