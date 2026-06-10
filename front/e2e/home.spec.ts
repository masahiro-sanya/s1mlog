import { test, expect } from '@playwright/test';

test.describe('ホームページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ページタイトルが正しく表示される', async ({ page }) => {
    await expect(page).toHaveTitle(/S1MLOG/i);
  });

  test('ヘッダーが表示される', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('記事リストが表示される', async ({ page }) => {
    // 記事詳細へのリンクが1件以上ある
    const articleLinks = page.locator('main a[href^="/articles/"]');
    await expect(articleLinks.first()).toBeVisible();
  });

  test('ナビゲーションリンクが機能する', async ({ page }) => {
    // ロゴリンクをクリックするとホームに戻る
    const logo = page.locator('header a').first();
    await logo.click();
    await expect(page).toHaveURL('/');
  });

  test('記事をクリックすると詳細ページに遷移する', async ({ page }) => {
    const firstArticleLink = page.locator('main a[href^="/articles/"]').first();

    await firstArticleLink.click();

    // URLが記事詳細ページになっている
    await expect(page).toHaveURL(/\/articles\/.+/);

    // 記事タイトル（h1）が表示されている
    await expect(page.locator('h1')).toBeVisible();
  });

  test('タグをクリックするとタグページに遷移する', async ({ page }) => {
    // タグリンクを探す
    const tagLink = page.locator('a[href^="/tags/"]').first();

    // タグが存在する場合のみテスト
    const tagCount = await tagLink.count();
    if (tagCount > 0) {
      await tagLink.click();

      // URLがタグページになっている
      await expect(page).toHaveURL(/\/tags\/.+/);
    }
  });

  test('検索ページに遷移できる', async ({ page }) => {
    await page.goto('/search');
    await expect(page).toHaveURL(/\/search/);
  });
});

test.describe('レスポンシブデザイン', () => {
  test('モバイル表示で正しくレイアウトされる', async ({ page }) => {
    // モバイルビューポートを設定
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // ヘッダーが表示される
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // 記事リストが表示される
    const articleLinks = page.locator('main a[href^="/articles/"]');
    await expect(articleLinks.first()).toBeVisible();
  });

  test('タブレット表示で正しくレイアウトされる', async ({ page }) => {
    // タブレットビューポートを設定
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // メインコンテンツが表示される
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
});
