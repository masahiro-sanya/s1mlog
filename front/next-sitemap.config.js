/** @type {import('next-sitemap').IConfig} */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.s1msys.com';

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
      const blogRes = await fetch(
        `https://${domain}.microcms.io/api/v1/blog?limit=100&orders=-publishedAt`,
        { headers: { 'X-MICROCMS-API-KEY': apiKey } },
      );
      if (blogRes.ok) {
        const blog = await blogRes.json();
        for (const a of blog.contents || []) {
          paths.push(
            await config.transform(config, `/articles/${a.id}`, {
              lastmod: a.updatedAt || a.publishedAt || a.createdAt,
            }),
          );
        }
      }

      const tagsRes = await fetch(`https://${domain}.microcms.io/api/v1/tags?limit=100`, {
        headers: { 'X-MICROCMS-API-KEY': apiKey },
      });
      if (tagsRes.ok) {
        const tags = await tagsRes.json();
        for (const t of tags.contents || []) {
          paths.push(
            await config.transform(config, `/tags/${t.id}`, {
              lastmod: t.updatedAt || t.createdAt,
            }),
          );
        }
      }
    } catch (e) {
      console.warn('[next-sitemap] additionalPaths error:', e);
    }

    return paths;
  },
};
