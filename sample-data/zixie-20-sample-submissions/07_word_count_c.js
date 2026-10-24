function countWordsWithMap(text) {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  return words.reduce((counts, word) => {
    const cleanWord = word.replace(/[^a-z0-9']/g, '');
    if (cleanWord) counts.set(cleanWord, (counts.get(cleanWord) || 0) + 1);
    return counts;
  }, new Map());
}
