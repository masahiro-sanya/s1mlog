import { test, expect } from '@playwright/test';

test.describe('ホームページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ページタイトルが正しく表示される', async ({ page }) => {
    await expect(page).toHaveTitle(/Blog/);
  });

  test('ヘッダーが表示される', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('記事リストが表示される', async ({ page }) => {
    // 記事リストコンテナが存在する
    const articleList = page.locator('ul').first();
    await expect(articleList).toBeVisible();
  });

  test('ナビゲーションリンクが機能する', async ({ page }) => {
    // ロゴリンクをクリックするとホームに戻る
    const logo = page.locator('header a').first();
    await logo.click();
    await expect(page).toHaveURL('/');
  });

  test('ページネーションが表示される', async ({ page }) => {
    // ページネーションコンテナが存在する
    const pagination = page.locator('nav').filter({ hasText: /件中/ });
    await expect(pagination).toBeVisible();
  });

  test('記事をクリックすると詳細ページに遷移する', async ({ page }) => {
    // 最初の記事リンクを探す
    const firstArticleLink = page.locator('article a').first();
    const articleTitle = await firstArticleLink.textContent();
    
    // 記事をクリック
    await firstArticleLink.click();
    
    // URLが記事詳細ページになっている
    await expect(page).toHaveURL(/\/articles\/.+/);
    
    // 記事タイトルが表示されている
    if (articleTitle) {
      await expect(page.locator('h1')).toContainText(articleTitle);
    }
  });

  test('タグをクリックするとタグページに遷移する', async ({ page }) => {
    // タグリンクを探す
    const tagLink = page.locator('a[href^="/tags/"]').first();
    
    // タグが存在する場合のみテスト
    const tagCount = await tagLink.count();
    if (tagCount > 0) {
      const tagName = await tagLink.textContent();
      await tagLink.click();
      
      // URLがタグページになっている
      await expect(page).toHaveURL(/\/tags\/.+/);
      
      // タグ名が表示されている
      if (tagName) {
        await expect(page.locator('h1')).toContainText(tagName);
      }
    }
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
    const articleList = page.locator('ul').first();
    await expect(articleList).toBeVisible();
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