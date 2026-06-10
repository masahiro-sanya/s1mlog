/** @type {import('next-sitemap').IConfig} */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.s1msys.com';

// microCMS の 1 リクエスト上限 100 件ずつページングして全件取得する
const fetchAllContents = async (domain, apiKey, endpoint, params) => {
  const contents = [];
  const limit = 100;
  let offset = 0;
  for (;;) {
    const query = new URLSearchParams({ ...params, limit: String(limit), offset: String(offset) });
    const res = await fetch(`https://${domain}.microcms.io/api/v1/${endpoint}?${query}`, {
      headers: { 'X-MICROCMS-API-KEY': apiKey },
    });
    if (!res.ok) break;
    const json = await res.json();
    contents.push(...(json.contents || []));
    offset += limit;
    if (offset >= (json.totalCount || 0)) break;
  }
  return contents;
};

module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ['/search', '/search/*', '/p/*', '/tags/*/p/*'],
  robotsTxtOptions: {
    additionalSitemaps: [`${SITE_URL}/feed.xml`],
    policies: [{ userAgent: '*', allow: '/', disallow: ['/search', '/api/'] }],
  },
  additionalPaths: async (config) => {
    const paths = [];

    const apiKey = process.env.MICROCMS_API_KEY;
    const domain = process.env.MICROCMS_SERVICE_DOMAIN;
    if (!apiKey || !domain || apiKey === 'dummy' || domain === 'dummy') {
      return paths;
    }

    try {
      // 下書き（publishedAt なし）は sitemap に載せない
      const articles = await fetchAllContents(domain, apiKey, 'blog', {
        orders: '-publishedAt',
        fields: 'id,updatedAt,publishedAt,createdAt',
        filters: 'publishedAt[exists]',
      });
      for (const a of articles) {
        paths.push(
          await config.transform(config, `/articles/${a.id}`, {
            lastmod: a.updatedAt || a.publishedAt || a.createdAt,
          }),
        );
      }

      const tags = await fetchAllContents(domain, apiKey, 'tags', {
        fields: 'id,updatedAt,createdAt',
      });
      for (const t of tags) {
        paths.push(
          await config.transform(config, `/tags/${t.id}`, {
            lastmod: t.updatedAt || t.createdAt,
          }),
        );
      }
    } catch (e) {
      console.warn('[next-sitemap] additionalPaths error:', e);
    }

    return paths;
  },
};
