import { render, screen } from '@testing-library/react';
import Loading from '../loading';
import ArticleLoading from '../articles/[slug]/loading';

describe('Loading（app/loading.tsx）', () => {
  it('読み込み中であることを支援技術に伝える', () => {
    render(<Loading />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAccessibleName('読み込み中');
  });

  it('記事一覧の形に沿ったスケルトンを並べる', () => {
    const { container } = render(<Loading />);

    expect(container.querySelectorAll('li')).toHaveLength(5);
  });
});

describe('ArticleLoading（app/articles/[slug]/loading.tsx）', () => {
  it('読み込み中であることを支援技術に伝える', () => {
    render(<ArticleLoading />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAccessibleName('読み込み中');
  });
});
