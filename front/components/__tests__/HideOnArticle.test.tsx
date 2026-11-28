import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { usePathname } from 'next/navigation';
import HideOnArticle from '../Nav/HideOnArticle';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockedUsePathname = usePathname as jest.Mock;

describe('HideOnArticle', () => {
  it.each(['/', '/p/2/', '/tags/abc/', '/search/'])('%s では中身を出す', (pathname) => {
    mockedUsePathname.mockReturnValue(pathname);
    render(
      <HideOnArticle>
        <p>nav</p>
      </HideOnArticle>,
    );
    expect(screen.getByText('nav')).toBeInTheDocument();
  });

  it('pathname が取れない場合は中身を出す', () => {
    mockedUsePathname.mockReturnValue(null);
    render(
      <HideOnArticle>
        <p>nav</p>
      </HideOnArticle>,
    );
    expect(screen.getByText('nav')).toBeInTheDocument();
  });

  it('記事ページでは中身を出さない', () => {
    mockedUsePathname.mockReturnValue('/articles/abc123/');
    const { container } = render(
      <HideOnArticle>
        <p>nav</p>
      </HideOnArticle>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
