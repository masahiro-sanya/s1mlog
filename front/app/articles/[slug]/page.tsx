import { Metadata } from 'next';
import { getDetail, getList, type Article as ArticleType } from '@/libs/microcms';
import Article from '@/components/Article';

type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    dk?: string;
  }>;
};

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const { contents } = await getList();
    
    const paths = contents.map((post: ArticleType) => ({
      slug: post.id,
    }));

    return paths;
  } catch (error) {
    console.error('Error generating static params for articles:', error);
    return [];
  }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const data = await getDetail(resolvedParams.slug, {
    draftKey: resolvedSearchParams.dk,
  });

  return {
    title: data.title || '記事',
    description: data.description || undefined,
    openGraph: {
      title: data.title || '記事',
      description: data.description || undefined,
      images: data?.thumbnail?.url ? [data.thumbnail.url] : undefined,
    },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const data = await getDetail(resolvedParams.slug, {
    draftKey: resolvedSearchParams.dk,
  });

  return <Article data={data} />;
}
