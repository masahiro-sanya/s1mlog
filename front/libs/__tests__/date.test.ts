import { formatDate } from '../date';

describe('formatDate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('日付を正しいフォーマットに変換する', () => {
    const date = '2024-01-15T10:00:00.000Z';
    const formatted = formatDate(date);
    expect(formatted).toBe('15 January, 2024');
  });

  it('null または undefined の場合は空文字を返す', () => {
    expect(formatDate(null as any)).toBe('');
    expect(formatDate(undefined as any)).toBe('');
    expect(formatDate('')).toBe('');
  });

  it('無効な日付フォーマットの場合は空文字を返す', () => {
    const invalidDate = 'invalid-date';
    const result = formatDate(invalidDate);
    expect(result).toBe('');
    expect(console.error).toHaveBeenCalledWith('Error formatting date:', expect.any(Error));
  });

  it('UTC深夜の日付は JST に変換されて翌日になる', () => {
    // 15:00 UTC = 翌 00:00 JST
    const date = '2024-12-24T15:00:00.000Z';
    expect(formatDate(date)).toBe('25 December, 2024');
  });

  it('異なる日付フォーマットも処理できる', () => {
    const date1 = '2024-12-25';
    expect(formatDate(date1)).toBe('25 December, 2024');

    const date2 = new Date('2024-07-04').toISOString();
    expect(formatDate(date2)).toBe('4 July, 2024');
  });
});
