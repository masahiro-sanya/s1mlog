import { cache } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies, draftMode } from 'next/headers';
import { getAllContentIds, getDetail } from '@/libs/microcms';
import { DRAFT_KEY_COOKIE } from '@/libs/preview';
import { SITE_NAME, SITE_URL } from '@/constants';
import Article from '@/components/Article';
import Breadcrumb from '@/components/Breadcrumb';
import JsonLd from '@/components/JsonLd';
import RelatedArticles from '@/components/RelatedArticles';
import ShareButtons from '@/components/ShareButtons';

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

// Draft Mode が有効な場合のみ cookie から draftKey を読む。
// 静的生成時は cookies() に触れないため、公開記事は SSG/ISR のまま配信される。
const getDraftKey = cache(async (): Promise<string | undefined> => {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return undefined;
  const cookieStore = await cookies();
  return cookieStore.get(DRAFT_KEY_COOKIE)?.value;
});

// generateMetadata と Page で同一記事を二重取得しないよう cache() で共有する
const getArticle = cache(async (slug: string, draftKey?: string) =>
  getDetail(slug, draftKey ? { draftKey } : undefined),
);

export async function generateStaticParams() {
  const ids = await getAllContentIds('blog');
  return ids.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const draftKey = await getDraftKey();
  const data = await getArticle(slug, draftKey);
  if (!data) {
    notFound();
  }

  const url = `/articles/${slug}`;
  const title = data.title || '記事';
  const description = data.description || undefined;
  const ogImages = data.thumbnail?.url ? [data.thumbnail.url] : ['/ogp.png'];

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

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const draftKey = await getDraftKey();
  const data = await getArticle(slug, draftKey);
  if (!data) {
    notFound();
  }

  const url = `/articles/${slug}`;
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
