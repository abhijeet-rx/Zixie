function readsTheSame(text) {
  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  const reversed = [...normalized].reverse().join('');
  return normalized === reversed;
}
