import { calcTileType, calcHealthLevel } from '../utils';

test.each([
  [0, 8, 'top-left'],
  [7, 8, 'top-right'],
  [56, 8, 'bottom-left'],
  [63, 8, 'bottom-right'],
  [3, 8, 'top'],
  [60, 8, 'bottom'],
  [32, 8, 'left'],
  [15, 8, 'right'],
  [10, 8, 'center'],
  [20, 8, 'center'],
])(
  'testing calcTileType function with param %s',
  (index, boardSize, result) => {
    expect(calcTileType(index, boardSize)).toBe(result);
  },
);

test.each([
  [10, 'critical'],
  [14, 'critical'],
  [15, 'normal'],
  [35, 'normal'],
  [51, 'high'],
  [60, 'high'],
])('testing calcHealthLevel function with param %s', (health, result) => {
  expect(calcHealthLevel(health)).toBe(result);
});
