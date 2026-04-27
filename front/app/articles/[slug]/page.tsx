import { Metadata } from 'next';
import { getDetail, getList, type Article as ArticleType } from '@/libs/microcms';
import { SITE_NAME, SITE_URL } from '@/constants';
import Article from '@/components/Article';
import Breadcrumb from '@/components/Breadcrumb';
import JsonLd from '@/components/JsonLd';
import RelatedArticles from '@/components/RelatedArticles';
import ShareButtons from '@/components/ShareButtons';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ dk?: string; draftKey?: string }>;
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
  const draftKey = resolvedSearchParams.draftKey || resolvedSearchParams.dk;
  const data = await getDetail(resolvedParams.slug, { draftKey });

  const url = `/articles/${resolvedParams.slug}`;
  const title = data.title || '記事';
  const description = data.description || undefined;
  const ogImages = data?.thumbnail?.url ? [data.thumbnail.url] : ['/ogp.png'];

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: draftKey ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      images: ogImages,
      publishedTime: data.publishedAt || data.createdAt,
      modifiedTime: data.updatedAt,
      authors: data.writer?.name ? [data.writer.name] : undefined,
      tags: data.tags?.map((t) => t.name),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImages,
    },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const draftKey = resolvedSearchParams.draftKey || resolvedSearchParams.dk;
  const data = await getDetail(resolvedParams.slug, { draftKey });

  const url = `/articles/${resolvedParams.slug}`;
  const fullUrl = `${SITE_URL}${url}`;
  const imageUrl = data.thumbnail?.url || `${SITE_URL}/ogp.png`;

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': fullUrl },
    headline: data.title,
    description: data.description,
    image: [imageUrl],
    datePublished: data.publishedAt || data.createdAt,
    dateModified: data.updatedAt || data.publishedAt || data.createdAt,
    inLanguage: 'ja',
    keywords: data.tags?.map((t) => t.name).join(','),
    author: data.writer
      ? {
          '@type': 'Person',
          name: data.writer.name,
          ...(data.writer.profile ? { description: data.writer.profile } : {}),
          ...(data.writer.image?.url ? { image: data.writer.image.url } : {}),
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.svg` },
    },
  };

  const crumbs = [
    { name: 'ホーム', href: '/' },
    ...(data.tags && data.tags.length > 0
      ? [{ name: data.tags[0].name, href: `/tags/${data.tags[0].id}` }]
      : []),
    { name: data.title || '記事' },
  ];

  return (
    <>
      <Breadcrumb items={crumbs} />
      <Article data={data} />
      <ShareButtons url={url} title={data.title || ''} />
      <RelatedArticles current={data} />
      <JsonLd data={blogPostingSchema} />
    </>
  );
}
