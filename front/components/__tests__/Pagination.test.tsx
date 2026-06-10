import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Pagination from '../Pagination';

describe('Pagination', () => {
  it('ページ番号を表示する', () => {
    render(<Pagination totalCount={100} current={1} basePath="/articles" />);

    // 10ページ分のページ番号が表示される（100件 / 10件ずつ）
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('現在のページをハイライトする', () => {
    const { container } = render(<Pagination totalCount={100} current={5} basePath="/articles" />);

    // 現在のページ（5）はリンクではなくspanで表示
    const currentPage = container.querySelector('.current');
    expect(currentPage).toHaveTextContent('5');
    expect(currentPage?.tagName).toBe('SPAN');
  });

  it('ページ番号リンクを正しく生成する（1ページ目は basePath 直下）', () => {
    render(<Pagination totalCount={50} current={3} basePath="/articles" />);

    const link1 = screen.getByRole('link', { name: '1' });
    const link2 = screen.getByRole('link', { name: '2' });

    // 1ページ目は /p/1 という重複URLを作らない
    expect(link1).toHaveAttribute('href', '/articles');
    expect(link2).toHaveAttribute('href', '/articles/p/2');
  });

  it('basePath が空の場合、1ページ目はルートへのリンクになる', () => {
    render(<Pagination totalCount={30} current={2} basePath="" />);

    const link1 = screen.getByRole('link', { name: '1' });
    const link3 = screen.getByRole('link', { name: '3' });

    expect(link1).toHaveAttribute('href', '/');
    expect(link3).toHaveAttribute('href', '/p/3');
  });

  it('検索クエリ q を全ページのリンクに引き継ぐ', () => {
    render(<Pagination totalCount={30} current={2} basePath="/search" q="test" />);

    const link1 = screen.getByRole('link', { name: '1' });
    const link3 = screen.getByRole('link', { name: '3' });

    expect(link1).toHaveAttribute('href', '/search?q=test');
    expect(link3).toHaveAttribute('href', '/search/p/3?q=test');
  });

  it('検索クエリは URL エンコードされる', () => {
    render(<Pagination totalCount={30} current={2} basePath="/search" q="next js" />);

    const link3 = screen.getByRole('link', { name: '3' });
    expect(link3).toHaveAttribute('href', '/search/p/3?q=next%20js');
  });

  it('少ない件数の場合も正しく表示する', () => {
    render(<Pagination totalCount={5} current={1} basePath="/articles" />);

    // 1ページのみ表示
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('0件の場合も適切に処理する', () => {
    const { container } = render(<Pagination totalCount={0} current={1} basePath="/articles" />);

    // ページ番号が表示されない
    const list = container.querySelector('ul');
    expect(list).toBeEmptyDOMElement();
  });
});
