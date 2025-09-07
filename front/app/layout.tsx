import Script from 'next/script';
import { getTagList, getWriter } from '@/libs/microcms';
import { LIMIT } from '@/constants';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Nav from '@/components/Nav';
import './globals.css';
import styles from './layout.module.css';
import Profile from '@/components/Profile';

export const metadata = {
  metadataBase: new URL(process.env.BASE_URL || 'http://localhost:3000'),
  title: 'S1MLOG Blog',
  description: 'A s1mlog blog presented by microCMS',
  openGraph: {
    title: 's1mlog Blog',
    description: 'A s1mlog blog presented by microCMS',
    images: '/ogp.png',
  },
  alternates: {
    canonical: '/',
  },
};

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
  const tags = await getTagList({ limit: LIMIT });
  const writer = await getWriter();

  return (
    <html lang="ja">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-18SL4QCQH0"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-18SL4QCQH0');
          `}
        </Script>
      </head>
      <body>
        <Header />
        <Nav tags={tags?.contents || []} />
        <Profile writer={writer} />
        <main className={styles.main}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
