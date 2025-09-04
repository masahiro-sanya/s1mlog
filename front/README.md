# S1MLOG Frontend

![](public/img-cover.png)

Next.js 15とmicroCMSを使用したブログアプリケーションのフロントエンドです。

## 動作環境

Node.js 18 以上

## 環境変数の設定

`.env`ファイルを作成し、下記の情報を入力してください。

```
MICROCMS_API_KEY=xxxxxxxxxx
MICROCMS_SERVICE_DOMAIN=xxxxxxxxxx
BASE_URL=xxxxxxxxxx
```

`MICROCMS_API_KEY`  
microCMS 管理画面の「サービス設定 > API キー」から確認することができます。

`MICROCMS_SERVICE_DOMAIN`  
microCMS 管理画面の URL（https://xxxxxxxx.microcms.io）の xxxxxxxx の部分です。

`BASE_URL`
デプロイ先の URL です。プロトコルから記載してください。

例）  
開発環境 → http://localhost:3000  
本番環境（Vercel） → https://your-app.vercel.app

## 開発の仕方

### 1. パッケージのインストール

```bash
npm install
```

### 2. 開発環境の起動

```bash
npm run dev
```

### 3. 開発環境へのアクセス
[http://localhost:3000](http://localhost:3000)にアクセス

## 利用可能なスクリプト

```bash
npm run dev          # 開発サーバーの起動
npm run build        # 本番用ビルド
npm run start        # 本番サーバーの起動
npm run lint         # ESLintの実行
npm run format       # Prettierでのフォーマット
npm run test         # テストの実行
npm run test:watch   # ウォッチモードでテスト
npm run test:coverage # カバレッジレポート付きテスト
```

## Vercelへのデプロイ

### 初回設定

1. Vercelでプロジェクトを作成
2. GitHubリポジトリと連携
3. 以下の設定を行う：
   - **Root Directory**: `front`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `out`

### 環境変数の設定

Vercelのプロジェクト設定で以下の環境変数を追加：
- `MICROCMS_API_KEY`
- `MICROCMS_SERVICE_DOMAIN`
- `BASE_URL`

### 自動デプロイ

GitHubへのpushで自動的にデプロイされます：
- `main`ブランチ → 本番環境
- `develop`ブランチ → プレビュー環境
- Pull Request → プレビュー環境

## プロジェクト構成

```
front/
├── app/                # App Routerのページ
│   ├── articles/       # 記事詳細
│   ├── search/         # 検索
│   ├── tags/           # タグ別一覧
│   └── p/              # ページネーション
├── components/         # Reactコンポーネント
├── libs/              # ユーティリティ
│   └── microcms.ts    # microCMS API
├── constants/         # 定数
├── public/            # 静的ファイル
└── e2e/               # E2Eテスト
```

## テスト

### ユニットテスト
```bash
npm test
npm run test:watch
npm run test:coverage
```

### E2Eテスト（Playwright）
```bash
npx playwright install  # 初回のみ
npx playwright test
npx playwright test --ui
```

## 技術スタック

- **Next.js 15.5.2** - Reactフレームワーク
- **TypeScript 5.9.2** - 型安全性
- **CSS Modules** - スタイリング
- **microCMS SDK** - CMS連携
- **Jest** - ユニットテスト
- **Playwright** - E2Eテスト

## トラブルシューティング

### ビルドエラーが発生する場合

環境変数が正しく設定されているか確認してください。APIキーが無効な場合でもビルドは成功しますが、警告が表示されます。

### 記事が表示されない場合

1. microCMSのAPIキーが有効か確認
2. コンテンツが公開されているか確認
3. APIエンドポイント名が正しいか確認