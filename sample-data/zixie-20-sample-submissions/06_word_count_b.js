function getWordCounts(text) {
  const result = {};
  const parts = text.toLowerCase().match(/[a-z0-9']+/g) || [];

  for (const part of parts) {
    result[part] = (result[part] || 0) + 1;
  }
  return result;
}
