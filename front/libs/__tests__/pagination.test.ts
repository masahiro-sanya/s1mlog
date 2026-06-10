import { getTotalPages, buildPageParams, parsePageNumber } from '../pagination';

describe('getTotalPages', () => {
  it('LIMIT (10) 件ごとに切り上げでページ数を計算する', () => {
    expect(getTotalPages(0)).toBe(0);
    expect(getTotalPages(1)).toBe(1);
    expect(getTotalPages(10)).toBe(1);
    expect(getTotalPages(11)).toBe(2);
    expect(getTotalPages(100)).toBe(10);
  });
});

describe('buildPageParams', () => {
  it('2ページ目以降の params を生成する（1ページ目は basePath 直下のため含めない）', () => {
    expect(buildPageParams(35)).toEqual([{ current: '2' }, { current: '3' }, { current: '4' }]);
  });

  it('1ページに収まる場合は空配列を返す', () => {
    expect(buildPageParams(10)).toEqual([]);
    expect(buildPageParams(0)).toEqual([]);
  });
});

describe('parsePageNumber', () => {
  it('未指定・空文字は 1 ページ目として扱う', () => {
    expect(parsePageNumber(undefined)).toBe(1);
    expect(parsePageNumber('')).toBe(1);
  });

  it('正の整数文字列を数値に変換する', () => {
    expect(parsePageNumber('1')).toBe(1);
    expect(parsePageNumber('25')).toBe(25);
  });

  it('数値でない文字列は null を返す', () => {
    expect(parsePageNumber('abc')).toBeNull();
    expect(parsePageNumber('1.5')).toBeNull();
    expect(parsePageNumber('-1')).toBeNull();
    expect(parsePageNumber('1e3')).toBeNull();
  });

  it('0 は null を返す', () => {
    expect(parsePageNumber('0')).toBeNull();
  });
});
