function rotateGridView(data) {
  const columns = Array.from({ length: data[0]?.length || 0 }, () => []);
  data.forEach((row) => {
    row.forEach((cell, index) => columns[index].push(cell));
  });
  return columns;
}
