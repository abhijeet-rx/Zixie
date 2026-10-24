function transpose(matrix) {
  if (matrix.length === 0) return [];
  const result = [];

  for (let column = 0; column < matrix[0].length; column++) {
    const row = [];
    for (let line = 0; line < matrix.length; line++) {
      row.push(matrix[line][column]);
    }
    result.push(row);
  }
  return result;
}
