function flipRowsAndColumns(grid) {
  if (!grid.length) return [];
  const flipped = [];

  for (let col = 0; col < grid[0].length; col += 1) {
    const newRow = [];
    for (let row = 0; row < grid.length; row += 1) {
      newRow.push(grid[row][col]);
    }
    flipped.push(newRow);
  }
  return flipped;
}
