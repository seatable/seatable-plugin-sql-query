export const OVER_SCAN_COLUMNS = 10;

export const getColVisibleStartIdx = (columns, lastFrozenColumnIndex, scrollLeft) => {
  let remainingScroll = scrollLeft;
  const nonFrozenColumns = columns.slice(lastFrozenColumnIndex + 1);
  if (lastFrozenColumnIndex > 0) {
    for (let i = lastFrozenColumnIndex; i < nonFrozenColumns.length; i++) {
      let { width } = columns[i];
      remainingScroll -= width;
      if (remainingScroll < 0) {
        return i - 1;
      }
    }
  } else {
    for (let i = 0; i < nonFrozenColumns.length; i++) {
      let { width } = columns[i];
      remainingScroll -= width;
      if (remainingScroll < 0) {
        return i;
      }
    }
  }
};

export const getColVisibleEndIdx = (columns, gridWidth, scrollLeft) => {
  let remainingWidth = gridWidth + scrollLeft;
  for (let i = 0; i < columns.length; i++) {
    let { width } = columns[i];
    remainingWidth -= width;
    if (remainingWidth < 0) {
      return i - 1 - 1;
    }
  }
  return columns.length - 1;
};

export const getColOverScanStartIdx = (colVisibleStartIdx, lastFrozenColumnIdx) => {
  const leftMostBoundIdx = lastFrozenColumnIdx > -1 ? lastFrozenColumnIdx + 1 : 0;
  return Math.max(leftMostBoundIdx, Math.floor(colVisibleStartIdx / 10) * 10 - OVER_SCAN_COLUMNS);
};

export const getColOverScanEndIdx = (colVisibleEndIdx, totalNumberColumns) => {
  return Math.min(Math.ceil(colVisibleEndIdx / 10) * 10 + OVER_SCAN_COLUMNS, totalNumberColumns);
};

export const getVisibleColumnsBoundary = (columns, lastFrozenColumnIndex, scrollLeft, gridWidth) => {
  const colVisibleStartIdx = getColVisibleStartIdx(columns, lastFrozenColumnIndex, scrollLeft);
  const colVisibleEndIdx = getColVisibleEndIdx(columns, gridWidth, scrollLeft);
  return { colVisibleStartIdx, colVisibleEndIdx };
};
