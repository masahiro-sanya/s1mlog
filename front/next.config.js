/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.microcms-assets.io',
      },
    ],
  },
  async headers() {
    // 記事ページの SSG を維持するため nonce ベース（動的レンダリングを強制する）ではなく
    // 静的な CSP を採用する。インラインスクリプト経由の XSS は sanitize-html（libs/utils.ts）で
    // 元から断つ方針とし、CSP はフレーミング/読み込み元の制限による多層防御を担う。
    // GA / AdSense はインライン注入・動的スクリプトを使うため script/style に unsafe-inline を許可する。
    // http で配信する環境（E2E のローカルサーバー）では upgrade-insecure-requests を外す。
    // WebKit / Safari は localhost を例外扱いせず https へアップグレードするため、CSS・JS チャンク
    // から画面遷移まで全部 TLS エラーで落ちる（Chromium は localhost を例外にするので気づけない）。
    // 本番は https 配信なので、既定では従来どおり付与する。
    const allowInsecureHttp = process.env.ALLOW_INSECURE_HTTP === '1';

    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://adservice.google.com https://*.adtrafficquality.google",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.googlesyndication.com https://*.doubleclick.net https://*.adtrafficquality.google",
      'frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://docs.google.com https://speakerdeck.com https://codepen.io https://platform.twitter.com https://www.slideshare.net https://codesandbox.io https://googleads.g.doubleclick.net https://*.doubleclick.net https://*.googlesyndication.com https://www.google.com',
      ...(allowInsecureHttp ? [] : ['upgrade-insecure-requests']),
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: csp },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
