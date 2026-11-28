'use client';

import { usePathname } from 'next/navigation';

type Props = {
  children: React.ReactNode;
};

// 記事ページでは検索窓とタグ一覧を出さない。本文に入るまでの要素を減らすため
export default function HideOnArticle({ children }: Props) {
  const pathname = usePathname();
  if (pathname?.startsWith('/articles/')) {
    return null;
  }
  return <>{children}</>;
}
