// 1ページの表示件数
export const LIMIT = 10;

// サイト全体のメタ情報
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.s1msys.com';
export const SITE_NAME = 'S1MLOG';
export const SITE_DESCRIPTION =
  'ライブ配信バックエンド・SRE・Claude Code 運用の実体験を記録する技術ブログ';
export const SITE_TWITTER = process.env.NEXT_PUBLIC_SITE_TWITTER || ''; // 例: '@s1msys'
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || ''; // 例: 'ca-pub-XXXXXXXXXXXXXXXX'
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-18SL4QCQH0';
