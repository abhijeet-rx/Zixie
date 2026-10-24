function countWords(sentence) {
  const counts = {};
  const words = sentence.toLowerCase().match(/[a-z0-9']+/g) || [];

  for (const word of words) {
    counts[word] = (counts[word] || 0) + 1;
  }
  return counts;
}
