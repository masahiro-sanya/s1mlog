import { getList, getTagList, type Tag } from '@/libs/microcms';
import { LIMIT } from '@/constants';
import Pagination from '@/components/Pagination';
import ArticleList from '@/components/ArticleList';

type Props = {
  params: Promise<{
    tagId: string;
  }>;
};

export const revalidate = 60;

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
