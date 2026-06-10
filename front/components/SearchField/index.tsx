'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './index.module.css';

export default function SearchField() {
  const router = useRouter();
  const [composing, setComposition] = useState(false);
  const startComposition = () => setComposition(true);
  const endComposition = () => setComposition(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.code === 'Enter' && !composing) {
        const q = inputRef.current?.value.trim();
        router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
      }
    },
    [composing, router],
  );
  const searchParams = useSearchParams();
  const defaultQuery = searchParams.get('q') || '';
  return (
    <input
      type="search"
      name="q"
      ref={inputRef}
      className={styles.search}
      placeholder="Search..."
      onKeyDown={handleKeyDown}
      onCompositionStart={startComposition}
      onCompositionEnd={endComposition}
      defaultValue={defaultQuery}
    />
  );
}
