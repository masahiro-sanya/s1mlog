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

  it('ページ番号リンクを正しく生成する', () => {
    render(<Pagination totalCount={50} current={3} basePath="/articles" />);
    
    // 現在のページ以外はリンク
    const link1 = screen.getByRole('link', { name: '1' });
    const link2 = screen.getByRole('link', { name: '2' });
    
    expect(link1).toHaveAttribute('href', '/articles/p/1');
    expect(link2).toHaveAttribute('href', '/articles/p/2');
  });

  it('クエリパラメータを含むURLを処理できる', () => {
    render(<Pagination totalCount={30} current={2} basePath="/search" q="test" />);
    
    const link1 = screen.getByRole('link', { name: '1' });
    const link3 = screen.getByRole('link', { name: '3' });
    
    expect(link1).toHaveAttribute('href', '/search/p/1?q=test');
    expect(link3).toHaveAttribute('href', '/search/p/3?q=test');
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