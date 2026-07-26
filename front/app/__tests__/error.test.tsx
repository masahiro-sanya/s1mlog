import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '../error';

describe('ErrorBoundary（app/error.tsx）', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('エラー内容ではなく汎用メッセージと復帰導線を表示する', () => {
    render(<ErrorBoundary error={new Error('microCMS unreachable')} reset={jest.fn()} />);

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '再読み込み' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'トップへ戻る' })).toHaveAttribute('href', '/');
    // 例外メッセージをそのまま画面に出さない
    expect(screen.queryByText(/microCMS unreachable/)).not.toBeInTheDocument();
  });

  it('再読み込みボタンで reset を呼ぶ', async () => {
    const reset = jest.fn();
    render(<ErrorBoundary error={new Error('boom')} reset={reset} />);

    await userEvent.click(screen.getByRole('button', { name: '再読み込み' }));

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('digest があればサーバーログ突き合わせ用に表示する', () => {
    const error = Object.assign(new Error('boom'), { digest: 'abc123' });
    render(<ErrorBoundary error={error} reset={jest.fn()} />);

    expect(screen.getByText('エラーID: abc123')).toBeInTheDocument();
  });

  it('digest が無ければエラーIDは表示しない', () => {
    render(<ErrorBoundary error={new Error('boom')} reset={jest.fn()} />);

    expect(screen.queryByText(/エラーID/)).not.toBeInTheDocument();
  });

  it('受け取ったエラーをコンソールに記録する', () => {
    const error = Object.assign(new Error('boom'), { digest: 'abc123' });
    render(<ErrorBoundary error={error} reset={jest.fn()} />);

    expect(console.error).toHaveBeenCalledWith('Unhandled error:', 'abc123', error);
  });
});
