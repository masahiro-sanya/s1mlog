import { getList } from '@/libs/microcms';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/constants';

export const revalidate = 600;

const escapeXml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export async function GET() {
  const data = await getList({ limit: 30, orders: '-publishedAt' });
  const items = (data.contents || [])
    .map((article) => {
      const link = `${SITE_URL}/articles/${article.id}/`;
      const pubDate = new Date(article.publishedAt || article.createdAt).toUTCString();
      const desc = article.description || '';
      return `    <item>
      <title>${escapeXml(article.title || '')}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(desc)}</description>
    </item>`;
    })
    .join('\n');

  const lastBuildDate =
    data.contents?.[0]?.updatedAt || data.contents?.[0]?.publishedAt || new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ja</language>
    <lastBuildDate>${new Date(lastBuildDate).toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400',
    },
  });
}
