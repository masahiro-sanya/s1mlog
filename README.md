# S1MLOG - Modern Blog Platform

Next.js + Vercel + microCMSを使用した、モダンなブログプラットフォームです。

## 🚀 概要

S1MLOGは、以下の技術を組み合わせたブログシステムです：

- **フロントエンド**: Next.js 15.5（静的サイト生成）
- **CMS**: microCMS（ヘッドレスCMS）
- **ホスティング**: Vercel
- **スタイリング**: CSS Modules

## 📁 プロジェクト構成

```
s1mlog/
├── front/                    # Next.jsフロントエンドアプリケーション
│   ├── app/                  # App Router pages
│   │   ├── articles/         # 記事詳細ページ
│   │   ├── search/           # 検索ページ
│   │   ├── tags/             # タグ別記事一覧
│   │   └── page.tsx          # トップページ
│   ├── components/           # Reactコンポーネント
│   ├── libs/                 # ユーティリティ
│   │   └── microcms.ts       # microCMS SDK設定
│   ├── public/               # 静的アセット
│   └── package.json          # 依存関係
│
├── .gitignore               # Git除外設定
├── .eslintrc.json           # ESLint設定
├── .prettierrc              # Prettier設定
├── README.md                # このファイル
└── CLAUDE.md                # Claude Code用ガイド
```

## 🔧 技術スタック

### フロントエンド
- **Next.js 15.5.2** - React フレームワーク（App Router使用）
- **TypeScript 5.9.2** - 型安全な開発
- **CSS Modules** - コンポーネントスコープのスタイリング
- **microCMS SDK** - コンテンツ取得

## 🚦 クイックスタート

### 前提条件
- Node.js 18以上
- microCMSアカウント
- Vercelアカウント
- GitHubリポジトリ

### セットアップ手順

#### 1. リポジトリのクローン
```bash
git clone https://github.com/masahiro-sanya/s1mlog.git
cd s1mlog
```

#### 2. microCMS設定
microCMS管理画面で以下のAPIを作成：

| API名 | エンドポイント | フィールド |
|------|------------|---------|
| ブログ | blog | title, description, content, thumbnail, tags, writer |
| タグ | tags | name |
| ライター | writers | name, profile, image |

#### 3. ローカル開発環境のセットアップ
```bash
cd front
npm install

# .envファイルを作成
cat > .env << EOF
MICROCMS_API_KEY=your_api_key_here
MICROCMS_SERVICE_DOMAIN=your_domain_here
BASE_URL=http://localhost:3000
EOF

# 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

#### 4. Vercelへのデプロイ

##### 初回セットアップ
1. [Vercel](https://vercel.com)にログイン
2. "New Project"をクリック
3. GitHubリポジトリをインポート
4. 以下の設定を行う：
   - **Framework Preset**: Next.js
   - **Root Directory**: `front`
   - **Build Command**: `npm run build`
   - **Output Directory**: `out`
5. 環境変数を設定：
   - `MICROCMS_API_KEY`: microCMS APIキー
   - `MICROCMS_SERVICE_DOMAIN`: microCMSサービスドメイン
   - `BASE_URL`: デプロイ後のURL（例: https://your-app.vercel.app）

##### 自動デプロイ
- `main`ブランチへのpushで本番環境に自動デプロイ
- `develop`ブランチへのpushでプレビュー環境に自動デプロイ
- Pull Requestごとにプレビュー環境が作成

## 🚀 デプロイ

### Vercelでの自動デプロイ

```bash
git add .
git commit -m "Update blog"
git push origin main  # または develop
```

Vercelが自動で：
1. Next.jsアプリをビルド
2. 静的ファイルを最適化
3. グローバルCDNに配信

## 📝 開発ガイド

### 開発コマンド
```bash
cd front
npm run dev      # 開発サーバー起動（http://localhost:3000）
npm run build    # 本番ビルド
npm run lint     # ESLintチェック
npm run format   # Prettierフォーマット
npm run test     # テスト実行
```

## 🧪 テスト

### テストの実行

#### ユニットテスト
```bash
cd front

# 全てのテストを実行
npm test

# ウォッチモードでテスト（開発中）
npm run test:watch

# カバレッジレポート付きでテスト実行
npm run test:coverage
```

#### E2Eテスト（Playwright）
```bash
cd front

# Playwrightブラウザのインストール（初回のみ）
npx playwright install

# E2Eテストを実行
npx playwright test

# UIモードでテスト実行（デバッグ用）
npx playwright test --ui

# 特定のブラウザでテスト
npx playwright test --project=chromium
```

### テストファイルの追加方法

#### ユニットテスト
- **場所**: `front/libs/__tests__/`、`front/components/__tests__/`
- **命名規則**: `[ファイル名].test.ts` または `[ファイル名].test.tsx`

```typescript
// front/libs/__tests__/example.test.ts
import { someFunction } from '../example';

describe('someFunction', () => {
  it('期待される結果を返す', () => {
    expect(someFunction('input')).toBe('expected output');
  });
});
```

#### E2Eテスト
- **場所**: `front/e2e/`
- **命名規則**: `[機能名].spec.ts`

```typescript
// front/e2e/feature.spec.ts
import { test, expect } from '@playwright/test';

test('機能が正しく動作する', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Expected Title/);
});
```

## 🔒 セキュリティ

- 環境変数はVercelダッシュボードで安全に管理
- APIキーはクライアントサイドに露出しない
- 静的サイト生成により、サーバーサイドの脆弱性を最小化

## 📊 パフォーマンス

Vercelの機能により最適化：
- **自動画像最適化**: Next.js Image コンポーネント
- **グローバルCDN**: エッジロケーションからの配信
- **静的生成**: ビルド時にHTMLを生成
- **インクリメンタル静的再生成**: ISR対応可能

## 🌍 環境

| 環境 | ブランチ | URL |
|-----|---------|-----|
| 本番 | main | https://your-app.vercel.app |
| プレビュー | develop | https://your-app-preview.vercel.app |
| PR | feature/* | 自動生成されるプレビューURL |

## 📚 詳細ドキュメント

- [フロントエンド設定](./front/README.md)
- [Claude Code用ガイド](./CLAUDE.md)

