function locate(items, value) {
  for (let index = 0; index < items.length; index += 1) {
    if (items[index] === value) return index;
  }
  return -1;
}
