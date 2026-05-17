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
NEXT_PUBLIC_SITE_URL=http://localhost:3000
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
   - `NEXT_PUBLIC_SITE_URL`: デプロイ後の公開URL（例: https://www.s1msys.com）。OGP / canonical / sitemap / feed.xml の絶対URL用
   - `NEXT_PUBLIC_CONTACT_EMAIL`: お問い合わせフォームの mailto: 先メールアドレス
   - （任意）`NEXT_PUBLIC_GA_MEASUREMENT_ID` / `NEXT_PUBLIC_SITE_TWITTER`
   - （AdSense 用・任意）`NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_TOP`, `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MID`, `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_BOTTOM`, `NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR`

> `BASE_URL` は Playwright / Jest 用のテスト変数。Vercel 側に設定する必要はない。
> AdSense 環境変数は未設定時は枠自体がレンダリングされない（null）安全設計。承認前は未設定のままで構わない。

##### 自動デプロイ
- `main`ブランチへのpushで本番環境に自動デプロイ
- `develop`ブランチへのpushでプレビュー環境に自動デプロイ
- Pull Requestごとにプレビュー環境が作成

##### microCMS → Vercel Webhook 連携
`output: 'export'` の静的サイト構成のため、microCMS で記事を公開しただけではサイトに反映されない。以下を一度設定すれば、microCMS 側の公開/更新/削除を契機に Vercel が自動再ビルドする。

1. **Vercel: Deploy Hook を発行**
   - Vercel ダッシュボード → 該当プロジェクト → Settings → Git → "Deploy Hooks"
   - Name: `microcms-content-published`、Branch: `main`（プレビューも回したい場合は `develop` 用も別途作成）
   - 発行された URL（例: `https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy`）をコピー
2. **microCMS: Webhook を登録**
   - microCMS 管理画面 → `blog` API → API 設定 → Webhook → 「追加」
   - サービスは「Vercel」または「カスタム通知」を選択し、上記 URL を貼り付け
   - 通知タイミング: 公開 / 公開終了 / 公開中の更新 / 削除 をすべて有効化
3. **動作確認**
   - microCMS で任意の記事を再公開 → Vercel Deployments に新規ビルドが流れることを確認

> Deploy Hook URL はトークン相当の機密。リポジトリにコミットせず、Vercel/microCMS 両側のダッシュボードでのみ管理する。

## 💰 収益化（Google AdSense）

### 申請前チェックリスト

- [ ] プライバシーポリシー（`/privacy-policy`）が公開済み
- [ ] アフィリエイト開示（`/disclosure`）が公開済み
- [ ] お問い合わせ（`/contact`）が機能している（`NEXT_PUBLIC_CONTACT_EMAIL` を設定済み）
- [ ] オリジナル記事が5〜10本以上公開済み
- [ ] サイトマップ（`/sitemap.xml`）が Search Console に登録済み

### AdSense 承認後の作業

1. **`ads.txt` の作成**
   - リポジトリには placeholder を置かない（誤って配信エラーを増やすため）
   - 承認後、AdSense ダッシュボード「サイト > ads.txt の取得」から正しい1行を取得し、`front/public/ads.txt` に配置:
     ```
     google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
     ```
   - 複数事業者を使う場合は1行ずつ追記
2. **広告ユニットの作成と環境変数設定**
   - AdSense ダッシュボード → 広告ユニット で4つ作成し、各 slot ID を Vercel 環境変数に設定:
     - `NEXT_PUBLIC_ADSENSE_CLIENT` … 例 `ca-pub-XXXXXXXXXXXXXXXX`
     - `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_TOP` … 記事冒頭（ディスプレイ）
     - `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MID` … 記事中盤（インフィード/インアーティクル推奨）
     - `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_BOTTOM` … 記事末尾（ディスプレイ）
     - `NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR` … サイドバー（PCのみ表示）
3. **Vercel で再ビルド**
   - microCMS Webhook 経由 or `main` への空コミット push で再デプロイ
4. **動作確認**
   - 記事ページで4ヶ所すべてに広告が描画されること
   - サイドバー枠はモバイル幅で非表示になっていること（CLS と AdSense ポリシー対策）

### ステマ規制対応

- 全記事に `PR` 開示バッジが冒頭に表示される（`components/PRDisclosure`）
- 本文内の Amazon・楽天・主要ASPドメインへのリンクには `rel="sponsored nofollow noopener"` が自動付与される（`libs/utils.ts:isAffiliateUrl`）
- 対応ドメイン追加は `AFFILIATE_HOST_PATTERNS` 配列を更新する

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
| 本番 | main | https://www.s1msys.com |
| プレビュー | develop | Vercel が発行するプレビューURL |
| PR | feature/* | 自動生成されるプレビューURL |

## 📚 詳細ドキュメント

- [フロントエンド設定](./front/README.md)
- [Claude Code用ガイド](./CLAUDE.md)

