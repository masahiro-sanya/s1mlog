jest.mock('@/libs/microcms', () => ({
  getAllContentIds: jest.fn(),
  getListOrThrow: jest.fn(),
  getTag: jest.fn(),
  LIST_FIELDS: 'id,title',
}));

import { generateMetadata } from '../tags/[tagId]/page';
import { getListOrThrow, getTag } from '@/libs/microcms';

const mockGetList = getListOrThrow as jest.Mock;
const mockGetTag = getTag as jest.Mock;

const metadataFor = (tagId: string) => generateMetadata({ params: Promise.resolve({ tagId }) });

describe('タグ一覧ページの generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTag.mockResolvedValue({ id: 't1', name: 'KVM' });
  });

  it('公開記事が 1 本以上あるタグの場合、robots を指定せず検索に出すこと', async () => {
    mockGetList.mockResolvedValue({ contents: [{ id: 'a1' }], totalCount: 1 });

    const metadata = await metadataFor('t1');

    expect(metadata.robots).toBeUndefined();
    expect(metadata.title).toBe('KVM の記事一覧');
    expect(metadata.alternates).toEqual({ canonical: '/tags/t1' });
  });

  it('公開記事が 0 本のタグの場合、noindex にしてリンクはたどらせること', async () => {
    mockGetList.mockResolvedValue({ contents: [], totalCount: 0 });

    const metadata = await metadataFor('t1');

    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it('記事一覧の取得に失敗した場合、本数が分からないので noindex にしないこと', async () => {
    mockGetList.mockRejectedValue(new Error('fetch API response status: 503'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const metadata = await metadataFor('t1');
    errorSpy.mockRestore();

    expect(metadata.robots).toBeUndefined();
    expect(metadata.title).toBe('KVM の記事一覧');
  });

  it('タグが見つからず公開記事も 0 本の場合、noindex にすること', async () => {
    mockGetTag.mockResolvedValue(null);
    mockGetList.mockResolvedValue({ contents: [], totalCount: 0 });

    const metadata = await metadataFor('unknown');

    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.title).toBeUndefined();
  });

  it('記事数はページ本体と同じ条件（そのタグを含む公開記事）で数えること', async () => {
    mockGetList.mockResolvedValue({ contents: [], totalCount: 0 });

    await metadataFor('t1');

    expect(mockGetList).toHaveBeenCalledWith(
      expect.objectContaining({ filters: 'tags[contains]t1' }),
    );
  });
});
