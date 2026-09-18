import { CellType } from 'dtable-utils';
import CellValueUtils from '../../src/utils/cell-value-utils';

const column = {
  id: 'joined-column-id',
  key: 'legacy-column-key',
  name: 'Name',
  type: CellType.TEXT,
};

describe('CellValueUtils.getExportRows', () => {
  const cellValueUtils = new CellValueUtils();

  test('exports JOIN result values addressed by column id', () => {
    const rows = [{
      'joined-column-id': 'value from column id',
      'legacy-column-key': 'legacy value',
    }];

    expect(cellValueUtils.getExportRows([column], rows)).toEqual([
      { Name: 'value from column id' },
    ]);
  });

  test('falls back to the column key for legacy query results', () => {
    const rows = [{ 'legacy-column-key': 'value from column key' }];

    expect(cellValueUtils.getExportRows([column], rows)).toEqual([
      { Name: 'value from column key' },
    ]);
  });

  test('preserves an empty value addressed by column id', () => {
    const rows = [{
      'joined-column-id': '',
      'legacy-column-key': 'legacy value',
    }];

    expect(cellValueUtils.getExportRows([column], rows)).toEqual([
      { Name: '' },
    ]);
  });
});
