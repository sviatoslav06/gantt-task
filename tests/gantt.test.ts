import { getTaskPosition } from '../src/gantt';

test('task starts on day 0', () => {
  const result = getTaskPosition('2026-03-02', '2026-03-10', '2026-03-02');
  expect(result).toEqual({ left: 0, width: 8 });
});

test('task starts on day 5', () => {
  const result = getTaskPosition('2026-03-07', '2026-03-15', '2026-03-02');
  expect(result).toEqual({ left: 5, width: 8 });
});

test('task duration is 7 days', () => {
  const result = getTaskPosition('2026-03-02', '2026-03-09', '2026-03-02');
  expect(result).toEqual({ left: 0, width: 7 });
});