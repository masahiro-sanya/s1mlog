'use client';

import { useMemo, useState } from 'react';
import styles from './index.module.css';

type Props = {
  contactEmail: string;
};

export default function ContactForm({ contactEmail }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const mailtoHref = useMemo(() => {
    if (!contactEmail) return '#';
    const params = new URLSearchParams({
      subject: subject || 'お問い合わせ',
      body: `${message}\n\n—\nName: ${name}\nEmail: ${email}`,
    }).toString();
    return `mailto:${contactEmail}?${params}`;
  }, [contactEmail, name, email, subject, message]);

  const canSend = Boolean(contactEmail && message);

  return (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
      <label className={styles.row}>
        お名前（任意）
        <input
          className={styles.input}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="山田 太郎"
          autoComplete="name"
        />
      </label>
      <label className={styles.row}>
        返信先メールアドレス（任意）
        <input
          className={styles.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </label>
      <label className={styles.row}>
        件名（任意）
        <input
          className={styles.input}
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="お問い合わせ"
        />
      </label>
      <label className={styles.row}>
        メッセージ（必須）
        <textarea
          className={styles.textarea}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="ご用件をご記入ください。"
          required
        />
      </label>
      <a
        className={styles.submit}
        href={mailtoHref}
        aria-disabled={!canSend}
        onClick={(e) => {
          if (!canSend) e.preventDefault();
        }}
      >
        メールを作成
      </a>
    </form>
  );
}

