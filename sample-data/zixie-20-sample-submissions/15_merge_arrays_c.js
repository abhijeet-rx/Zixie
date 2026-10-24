function mergeBySorting(listOne, listTwo) {
  return [...listOne, ...listTwo].sort((x, y) => x - y);
}
