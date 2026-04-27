import Script from 'next/script';
import type { Metadata } from 'next';
import { getTagList, getWriter } from '@/libs/microcms';
import {
  ADSENSE_CLIENT,
  GA_MEASUREMENT_ID,
  LIMIT,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TWITTER,
  SITE_URL,
} from '@/constants';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Nav from '@/components/Nav';
import Profile from '@/components/Profile';
import JsonLd from '@/components/JsonLd';
import CookieConsent from '@/components/CookieConsent';
import AnalyticsListeners from '@/components/Analytics';
import './globals.css';
import styles from './layout.module.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: ['/ogp.png'],
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ['/ogp.png'],
    ...(SITE_TWITTER ? { creator: SITE_TWITTER, site: SITE_TWITTER } : {}),
  },
  icons: {
    icon: '/logo.svg',
  },
  alternates: {
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: SITE_NAME }],
    },
  },
};

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
  const tags = await getTagList({ limit: LIMIT });
  const writer = await getWriter();

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'ja',
    description: SITE_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
  };

  return (
    <html lang="ja">
      <head>
        <Script id="ga-consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              wait_for_update: 500,
            });
          `}
        </Script>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
          `}
        </Script>
        {ADSENSE_CLIENT && (
          <Script
            id="adsense"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
        <JsonLd data={[websiteSchema, organizationSchema]} />
      </head>
      <body>
        <Header />
        <Nav tags={tags?.contents || []} />
        <div className={styles.container}>
          <aside className={styles.sidebar}>
            <Profile writer={writer} />
          </aside>
          <main className={styles.main}>{children}</main>
        </div>
        <Footer />
        <CookieConsent />
        <AnalyticsListeners />
      </body>
    </html>
  );
}
