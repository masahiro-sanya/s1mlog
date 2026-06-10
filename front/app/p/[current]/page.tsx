import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getList, LIST_FIELDS } from '@/libs/microcms';
import { buildPageParams, parsePageNumber } from '@/libs/pagination';
import { LIMIT } from '@/constants';
import Pagination from '@/components/Pagination';
import ArticleList from '@/components/ArticleList';

type Props = {
  params: Promise<{
    current: string;
  }>;
};

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { current } = await params;
  return {
    title: `${current}ページ目`,
    alternates: { canonical: `/p/${current}` },
    robots: { index: false, follow: true },
  };
}

export async function generateStaticParams() {
  const data = await getList({ limit: 1, fields: 'id' });
  return buildPageParams(data.totalCount);
}

export default async function Page({ params }: Props) {
  const { current: rawCurrent } = await params;
  const current = parsePageNumber(rawCurrent);
  if (current === null) {
    notFound();
  }
  const data = await getList({
    limit: LIMIT,
    offset: LIMIT * (current - 1),
    fields: LIST_FIELDS,
  });
  return (
    <>
      <ArticleList articles={data.contents} />
      <Pagination totalCount={data.totalCount} current={current} />
    </>
  );
}
