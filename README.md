# S1MLOG - Serverless Blog Platform

AWS S3 + CloudFront + microCMSを使用した、サーバーレスブログプラットフォームです。

## 🚀 概要

S1MLOGは、以下の技術を組み合わせた完全サーバーレスのブログシステムです：

- **フロントエンド**: Next.js 15.5（静的サイト生成）
- **CMS**: microCMS（ヘッドレスCMS）
- **ホスティング**: AWS S3 + CloudFront
- **CI/CD**: GitHub Actions（OIDC認証）
- **インフラ管理**: AWS CDK

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
├── infrastructure/           # AWS CDKインフラコード
│   ├── lib/
│   │   ├── StaticHostingStack.ts  # S3 + CloudFront
│   │   └── GithubRoleStack.ts     # GitHub Actions用IAMロール
│   ├── bin/                  # CDKエントリーポイント
│   └── package.json          # 依存関係
│
├── .github/
│   └── workflows/
│       └── workflow_s3sync.yml    # 自動デプロイワークフロー
│
├── .gitignore               # Git除外設定
├── .eslintrc.json           # ESLint設定
├── .prettierrc              # Prettier設定
└── CLAUDE.md                # Claude Code用ガイド（Git管理外）
```

## 🔧 技術スタック

### フロントエンド
- **Next.js 15.5.2** - React フレームワーク（App Router使用）
- **TypeScript 5.9.2** - 型安全な開発
- **CSS Modules** - コンポーネントスコープのスタイリング
- **microCMS SDK** - コンテンツ取得

### インフラストラクチャ
- **AWS CDK 2.212.0** - Infrastructure as Code
- **AWS S3** - 静的ファイルホスティング
- **Amazon CloudFront** - CDN配信
- **AWS IAM** - OIDC認証でのセキュアなデプロイ

## 🚦 クイックスタート

### 前提条件
- Node.js 18以上
- AWSアカウント
- microCMSアカウント
- GitHubリポジトリ

### セットアップ手順

#### 1. リポジトリのクローン
```bash
git clone https://github.com/masahiro-sanya/s1mlog.git
cd s1mlog
```

#### 2. AWSインフラのデプロイ
```bash
cd infrastructure
npm install
echo "prd=YOUR_AWS_ACCOUNT_ID" > .env
npx cdk bootstrap -c account=YOUR_AWS_ACCOUNT_ID -c attrphase=prd -c target=app
npx cdk deploy --all -c account=YOUR_AWS_ACCOUNT_ID -c attrphase=prd -c target=app
```

#### 3. microCMS設定
microCMS管理画面で以下のAPIを作成：

| API名 | エンドポイント | フィールド |
|------|------------|---------|
| ブログ | blog | title, description, content, thumbnail, tags, writer |
| タグ | tags | name |
| ライター | writers | name, profile, image |

#### 4. GitHub Secrets設定
リポジトリの Settings → Secrets and variables → Actions に設定：

| Secret名 | 値 |
|---------|-----|
| AWS_ACCOUNT_ID | AWSアカウントID |
| MICROCMS_API_KEY | microCMS APIキー |
| MICROCMS_SERVICE_DOMAIN | microCMSサービスドメイン |
| BASE_URL | CloudFrontのURL |

#### 5. ローカル開発
```bash
cd front
npm install
# .envファイルを作成して環境変数を設定
npm run dev  # http://localhost:3000
```

## 🚀 デプロイ

mainブランチへのpushで自動デプロイ：

```bash
git add .
git commit -m "Update blog"
git push origin main
```

GitHub Actionsが自動で：
1. Next.jsアプリをビルド
2. 静的ファイルをS3にアップロード
3. CloudFrontのキャッシュを無効化

## 📝 開発ガイド

### フロントエンド開発
```bash
cd front
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm run lint     # ESLintチェック
npm run format   # Prettierフォーマット
```

### インフラ変更
```bash
cd infrastructure
npm run build    # TypeScriptコンパイル
npx cdk diff     # 変更内容確認
npx cdk deploy   # デプロイ
```

## 🧪 テスト

### テスト環境のセットアップ

#### フロントエンド
```bash
cd front
npm install  # テスト依存関係は既にインストール済み
```

#### インフラストラクチャ
```bash
cd infrastructure
npm install  # テスト依存関係は既にインストール済み
```

### テストの実行

#### ユニットテスト（フロントエンド）
```bash
cd front

# 全てのテストを実行
npm test

# ウォッチモードでテスト（開発中）
npm run test:watch

# カバレッジレポート付きでテスト実行
npm run test:coverage
```

#### インフラストラクチャテスト
```bash
cd infrastructure

# CDKスタックのテスト実行
npm test
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
- **例**:
```typescript
// front/libs/__tests__/example.test.ts
import { someFunction } from '../example';

describe('someFunction', () => {
  it('期待される結果を返す', () => {
    expect(someFunction('input')).toBe('expected output');
  });
});
```

#### コンポーネントテスト
```typescript
// front/components/__tests__/Component.test.tsx
import { render, screen } from '@testing-library/react';
import Component from '../Component';

describe('Component', () => {
  it('正しくレンダリングされる', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

#### E2Eテスト
- **場所**: `front/e2e/`
- **命名規則**: `[機能名].spec.ts`
- **例**:
```typescript
// front/e2e/feature.spec.ts
import { test, expect } from '@playwright/test';

test('機能が正しく動作する', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Expected Title/);
});
```

### テストカバレッジ

現在のテストカバレッジ目標:
- **ブランチ**: 50%
- **関数**: 50%
- **行**: 50%
- **ステートメント**: 50%

カバレッジレポートは `front/coverage/` ディレクトリに生成されます。

### CI/CD でのテスト

GitHub Actionsで自動的にテストが実行されます。プルリクエスト作成時に:
1. ユニットテストの実行
2. Lintチェック
3. ビルドの確認

が行われます。

## 🔒 セキュリティ

- GitHub Actions OIDC認証（パスワード不要）
- S3バケットは非公開（CloudFront経由のみアクセス可）
- 環境変数はGitHub Secretsで管理

## 📊 アーキテクチャ図

```
[ユーザー] → [CloudFront] → [S3バケット]
                ↑
            [GitHub Actions]
                ↑
            [mainブランチpush]
                ↑
            [開発者]

[microCMS] → [Next.js SSG] → [静的HTML]
```

## 📚 詳細ドキュメント

各ディレクトリのREADMEを参照してください：
- [フロントエンド設定](./front/README.md)
- [インフラ設定](./infrastructure/README.md)