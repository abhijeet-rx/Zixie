function checkPalindrome(value) {
  const letters = value.toLowerCase().replace(/[^a-z0-9]/g, '');
  let start = 0;
  let finish = letters.length - 1;

  while (start < finish) {
    if (letters[start] !== letters[finish]) return false;
    start += 1;
    finish -= 1;
  }
  return true;
}
