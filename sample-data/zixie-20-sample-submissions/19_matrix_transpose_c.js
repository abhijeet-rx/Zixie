function transposeUsingMap(rows) {
  return rows[0].map((_, columnIndex) =>
    rows.map((row) => row[columnIndex])
  );
}
