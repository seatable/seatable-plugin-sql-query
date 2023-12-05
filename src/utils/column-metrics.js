export const isFrozenColumn = (column) => {
  if (!column) return false;
  return column.isFrozen === true;
};

export const findLastFrozenColumnIndex = (columns) => {
  for (let i = 0; i < columns.length; i++) {
    const column = columns[i];
    if (column && column.isFrozen) {
      return i;
    }
  }
  return -1;
};

export const setColumnOffsets = (columns) => {
  let nextColumns = [];
  let left = 0;
  columns.forEach((column) => {
    nextColumns.push({ ...column, left });
    left += column.width;
  });
  return nextColumns;
};

export const calculateColumnsMetrics = (columns) => {
  let nextColumns = columns.map((column) => ({ ...column }));
  nextColumns = setColumnOffsets(nextColumns);
  const totalColumnsWidth = nextColumns.reduce((width, column) => width + column.width, 0);
  return {
    columns: nextColumns,
    totalColumnsWidth,
    lastFrozenColumnIndex: findLastFrozenColumnIndex(nextColumns),
  };
};
