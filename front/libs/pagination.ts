import { LIMIT } from '@/constants';

// 記事総数から総ページ数を計算する
export const getTotalPages = (totalCount: number): number => Math.ceil(totalCount / LIMIT);

// /p/[current] 系ルートの generateStaticParams 用に、2 ページ目以降の params を生成する
// （1 ページ目は /p/1 ではなく basePath 直下で配信するため含めない）
export const buildPageParams = (totalCount: number): { current: string }[] => {
  const paths: { current: string }[] = [];
  for (let i = 2; i <= getTotalPages(totalCount); i++) {
    paths.push({ current: i.toString() });
  }
  return paths;
};

// URL 由来のページ番号文字列を検証付きで数値化する。
// 未指定は 1 ページ目、不正値（非数値・0 以下）は null を返す
export const parsePageNumber = (raw: string | undefined): number | null => {
  if (raw === undefined || raw === '') return 1;
  if (!/^\d+$/.test(raw)) return null;
  const page = parseInt(raw, 10);
  return page >= 1 ? page : null;
};
