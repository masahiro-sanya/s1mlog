import type { Metadata } from 'next';
import { getList, getTag, getTagList, type Tag } from '@/libs/microcms';
import { LIMIT } from '@/constants';
import Pagination from '@/components/Pagination';
import ArticleList from '@/components/ArticleList';

type Props = {
  params: Promise<{
    tagId: string;
  }>;
};

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tagId } = await params;
  try {
    const tag = await getTag(tagId);
    return {
      title: `${tag.name} の記事一覧`,
      description: `${tag.name} に関する記事一覧。`,
      alternates: { canonical: `/tags/${tagId}` },
    };
  } catch {
    return { alternates: { canonical: `/tags/${tagId}` } };
  }
}

export async function generateStaticParams() {
  try {
    const { contents } = await getTagList();

    const paths = contents.map((tag: Tag) => ({
      tagId: tag.id,
    }));

    return paths;
  } catch (error) {
    console.error('Error generating static params for tags:', error);
    return [];
  }
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const { tagId } = resolvedParams;
  const data = await getList({
    limit: LIMIT,
    filters: `tags[contains]${tagId}`,
  });

  return (
    <>
      <ArticleList articles={data.contents} />
      <Pagination totalCount={data.totalCount} basePath={`/tags/${tagId}`} />
    </>
  );
}
