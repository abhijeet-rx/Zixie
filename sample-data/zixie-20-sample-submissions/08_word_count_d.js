function wordFrequency(text) {
  const tally = Object.create(null);
  const tokens = text.trim().toLowerCase().split(/\s+/);

  tokens.forEach((token) => {
    const word = token.replace(/[^a-z0-9']/g, '');
    if (word.length === 0) return;
    tally[word] = tally[word] ? tally[word] + 1 : 1;
  });
  return tally;
}
