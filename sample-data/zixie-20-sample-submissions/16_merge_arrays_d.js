function combineAndSort(numbersA, numbersB) {
  const allNumbers = numbersA.concat(numbersB);
  allNumbers.sort(function (first, second) {
    return first - second;
  });
  return allNumbers;
}
