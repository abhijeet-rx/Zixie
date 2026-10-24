function isExactPalindrome(text) {
  const value = text.toLowerCase();
  for (let i = 0; i < Math.floor(value.length / 2); i++) {
    if (value[i] !== value[value.length - 1 - i]) return false;
  }
  return true;
}
