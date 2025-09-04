import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ArticleList from '../ArticleList';
import { Article } from '@/libs/microcms';

describe('ArticleList', () => {
  const mockArticles: Article[] = [
    {
      id: '1',
      title: 'First Article',
      description: 'This is the first article',
      content: 'Content 1',
      tags: [{ id: 'tag1', name: 'React', createdAt: '', updatedAt: '' }],
      thumbnail: {
        url: 'https://example.com/image1.jpg',
        width: 800,
        height: 600,
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      publishedAt: '2024-01-01T00:00:00.000Z',
      revisedAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  it('記事タイトルを表示する', () => {
    render(<ArticleList articles={mockArticles} />);
    
    expect(screen.getByText('First Article')).toBeInTheDocument();
  });

  it('記事へのリンクを生成する', () => {
    render(<ArticleList articles={mockArticles} />);
    
    const links = screen.getAllByRole('link');
    const articleLink = links.find(link => 
      link.getAttribute('href') === '/articles/1'
    );
    
    expect(articleLink).toBeDefined();
  });

  it('日付を表示する', () => {
    render(<ArticleList articles={mockArticles} />);
    
    // 日付がフォーマットされて表示される
    expect(screen.getByText('1 January, 2024')).toBeInTheDocument();
  });

  it('空の記事リストを処理できる', () => {
    render(<ArticleList articles={[]} />);
    
    // 空のリストの場合は「記事がありません。」が表示される
    expect(screen.getByText('記事がありません。')).toBeInTheDocument();
  });

  it('複数の記事を表示できる', () => {
    const multipleArticles: Article[] = [
      ...mockArticles,
      {
        ...mockArticles[0],
        id: '2',
        title: 'Second Article',
        createdAt: '2024-01-02T00:00:00.000Z',
      },
    ];
    
    render(<ArticleList articles={multipleArticles} />);
    
    expect(screen.getByText('First Article')).toBeInTheDocument();
    expect(screen.getByText('Second Article')).toBeInTheDocument();
  });
});