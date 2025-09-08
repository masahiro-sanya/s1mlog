import type { Metadata } from 'next';
import styles from './page.module.css';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'お問い合わせ | S1MLOG',
  description:
    'S1MLOG へのお問い合わせページ。ご意見・ご要望・不具合報告などはこちらからご連絡ください。',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || '';
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>お問い合わせ</h1>
      <p className={styles.lead}>
        ご意見・ご要望・不具合報告などがございましたら、下記フォームよりご連絡ください。
      </p>
      {!contactEmail && (
        <p className={styles.note}>
          管理者向け: `.env` に `NEXT_PUBLIC_CONTACT_EMAIL` を設定すると、メール送信リンクが有効になります。
        </p>
      )}
      <ContactForm contactEmail={contactEmail} />
    </div>
  );
}
