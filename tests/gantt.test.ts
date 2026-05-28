import { getTaskPosition } from '../src/gantt';
import { resolveTaskBar } from '../src/gantt';

// ---------------------------------------------------------------------------
// getTaskPosition
// ---------------------------------------------------------------------------

describe('getTaskPosition', () => {

  describe('left offset', () => {
    test('task starts on the same day as the chart → left = 0', () => {
      const result = getTaskPosition('2026-03-02', '2026-03-10', '2026-03-02');
      expect(result.left).toBe(0);
    });

    test('task starts 5 days after chart start → left = 5', () => {
      const result = getTaskPosition('2026-03-07', '2026-03-15', '2026-03-02');
      expect(result.left).toBe(5);
    });

    test('task starts 1 day after chart start → left = 1', () => {
      const result = getTaskPosition('2026-03-03', '2026-03-05', '2026-03-02');
      expect(result.left).toBe(1);
    });

    test('task starts 30 days after chart start → left = 30', () => {
      const result = getTaskPosition('2026-04-01', '2026-04-05', '2026-03-02');
      expect(result.left).toBe(30);
    });
  });

  describe('width (inclusive of both start and end day)', () => {
    test('start and end on same day → width = 1', () => {
      const result = getTaskPosition('2026-03-02', '2026-03-02', '2026-03-02');
      expect(result.width).toBe(1);
    });

    test('start and end on consecutive days → width = 2', () => {
      const result = getTaskPosition('2026-03-02', '2026-03-03', '2026-03-02');
      expect(result.width).toBe(2);
    });

    test('8-day span (Mar 2 → Mar 9) → width = 8', () => {
      const result = getTaskPosition('2026-03-02', '2026-03-09', '2026-03-02');
      expect(result.width).toBe(8);
    });

    test('9-day span (Mar 2 → Mar 10) → width = 9', () => {
      const result = getTaskPosition('2026-03-02', '2026-03-10', '2026-03-02');
      expect(result.width).toBe(9);
    });

    test('width is independent of left offset', () => {
      const r1 = getTaskPosition('2026-03-02', '2026-03-10', '2026-03-02');
      const r2 = getTaskPosition('2026-03-07', '2026-03-15', '2026-03-02');
      expect(r1.width).toBe(r2.width);
    });
  });

  describe('combined left + width', () => {
    test('offset 5, 9-day span', () => {
      const result = getTaskPosition('2026-03-07', '2026-03-15', '2026-03-02');
      expect(result).toEqual({ left: 5, width: 9 });
    });

    test('offset 0, 1-day span', () => {
      const result = getTaskPosition('2026-04-01', '2026-04-01', '2026-04-01');
      expect(result).toEqual({ left: 0, width: 1 });
    });

    test('chart starts in previous month', () => {
      const result = getTaskPosition('2026-05-01', '2026-05-08', '2026-04-01');
      expect(result).toEqual({ left: 30, width: 8 });
    });

    test('task spanning a month boundary', () => {
      const result = getTaskPosition('2026-03-28', '2026-04-04', '2026-03-01');
      expect(result).toEqual({ left: 27, width: 8 });
    });
  });

  describe('edge cases', () => {
    test('does not break on leap-year Feb 29', () => {
      const result = getTaskPosition('2028-02-28', '2028-03-01', '2028-02-28');
      expect(result).toEqual({ left: 0, width: 3 });
    });

    test('does not break on Dec → Jan year boundary', () => {
      const result = getTaskPosition('2026-12-30', '2027-01-02', '2026-12-30');
      expect(result).toEqual({ left: 0, width: 4 });
    });

    test('large offset does not cause float drift', () => {
      const result = getTaskPosition('2026-12-31', '2027-01-01', '2026-01-01');
      expect(result.left).toBe(364);
      expect(result.width).toBe(2);
    });
  });
});

// ---------------------------------------------------------------------------
// resolveTaskBar
// ---------------------------------------------------------------------------

describe('resolveTaskBar', () => {
  const base = {
    id: 'test-1',
    stage: 'ТЕСТ',
    assignee: 'Тест',
    avatarUrl: null,
    title: 'Тестова таска',
  };

  test('Case 1: inserted + start + end → solid from start to end', () => {
    const result = resolveTaskBar({
      ...base,
      insertedAt: '2026-03-01T10:00:00.000Z',
      startDate: '2026-04-01',
      endDate: '2026-04-15',
    });
    expect(result).toEqual({ dateStr: '2026-04-01', endDateStr: '2026-04-15', style: 'solid' });
  });

  test('Case 2: inserted + NO start + end → solid from inserted date to end', () => {
    const result = resolveTaskBar({
      ...base,
      insertedAt: '2026-03-10T08:30:00.000Z',
      endDate: '2026-04-10',
    });
    expect(result).toEqual({ dateStr: '2026-03-10', endDateStr: '2026-04-10', style: 'solid' });
  });

  test('Case 3: inserted only, NO start, NO end → ghost at inserted day', () => {
    const result = resolveTaskBar({
      ...base,
      insertedAt: '2026-04-28T15:45:00.000Z',
    });
    expect(result).toEqual({ dateStr: '2026-04-28', endDateStr: '2026-04-28', style: 'ghost' });
  });

  test('Case 4: inserted + start, NO end → ghost at start day (start has priority)', () => {
    const result = resolveTaskBar({
      ...base,
      insertedAt: '2026-03-10T08:00:00.000Z',
      startDate: '2026-04-15',
    });
    expect(result).toEqual({ dateStr: '2026-04-15', endDateStr: '2026-04-15', style: 'ghost' });
  });

  test('Case 4: ghost anchor is startDate, NOT insertedAt, even when they differ by weeks', () => {
    const result = resolveTaskBar({
      ...base,
      insertedAt: '2026-01-01T00:00:00.000Z',
      startDate: '2026-05-01',
    });
    expect(result?.dateStr).toBe('2026-05-01');
    expect(result?.style).toBe('ghost');
  });

  test('invalid: no insertedAt AND no startDate → returns null', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = resolveTaskBar({ ...base });
    expect(result).toBeNull();
    consoleSpy.mockRestore();
  });

  test('invalid: logs error with task id when both dates are missing', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    resolveTaskBar({ ...base, id: 'task-invalid-99' });
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('task-invalid-99')
    );
    consoleSpy.mockRestore();
  });

  test('isoToDateStr: time portion of insertedAt is stripped correctly', () => {
    const result = resolveTaskBar({
      ...base,
      insertedAt: '2026-07-04T23:59:59.999Z',
    });
    expect(result?.dateStr).toBe('2026-07-04');
  });
});