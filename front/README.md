# シンプルなブログ

![](public/img-cover.png)

microCMS 公式のシンプルなブログのテンプレートです。

## 動作環境

Node.js 18 以上

## 環境変数の設定

ルート直下に`.env`ファイルを作成し、下記の情報を入力してください。

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
本番環境 → https://xxxxxxxx.vercel.app/ など

## 開発の仕方

1. パッケージのインストール

```bash
npm install
```

2. 開発環境の起動

```bash
npm run dev
```

3. 開発環境へのアクセス  
   [http://localhost:3000](http://localhost:3000)にアクセス

## 画面プレビューの設定

下書き状態のコンテンツをプレビューするために、microCMS管理画面にて画面プレビューの設定が必要です。

ブログAPIの「API設定 > 画面プレビュー」に下記のように設定してください。  
※`your-domain`部分はデプロイ先のドメインに置き換えてください。（localhost指定でも動作します）

![blog-preview](https://github.com/microcmsio/nextjs-simple-blog-template/assets/4659294/5045ac9e-3699-47b4-8927-4187114d75bd)

設定後はコンテンツ編集画面にて画面プレビューボタンが利用可能になります。

## ビルドコマンド

```bash
npm run build        # 静的サイトをビルド（outディレクトリに出力）
npm run lint         # ESLintでコードチェック
npm run format       # Prettierでコードフォーマット
```

## デプロイ

### AWS S3 + CloudFront へのデプロイ

このプロジェクトは AWS S3 と CloudFront を使用した静的サイトホスティングに対応しています。

1. インフラストラクチャのセットアップ（`../infrastructure`参照）
2. GitHub Secrets の設定
   - `AWS_ACCOUNT_ID`: AWS アカウント ID
   - `MICROCMS_API_KEY`: microCMS API キー
   - `MICROCMS_SERVICE_DOMAIN`: microCMS サービスドメイン
   - `BASE_URL`: CloudFront の URL
3. main ブランチへプッシュすると自動でデプロイされます

### Vercel へのデプロイ

[Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)から簡単にデプロイが可能です。

リポジトリを紐付け、環境変数を `Environment Variables` に登録後、デプロイしてみましょう。

![](public/img-vercel-settings.png)

## microCMS API の設定

以下の3つのAPIを作成してください：

1. **ブログ API**（エンドポイント: `blog`）
   - title（テキストフィールド）
   - description（テキストフィールド）
   - content（リッチエディタ）
   - thumbnail（画像）
   - tags（複数コンテンツ参照 - タグ）
   - writer（コンテンツ参照 - ライター）

2. **タグ API**（エンドポイント: `tags`）
   - name（テキストフィールド）

3. **ライター API**（エンドポイント: `writers`）
   - name（テキストフィールド）
   - profile（テキストエリア）
   - image（画像）

## 技術スタック

- **Next.js 15.5.2** - App Router 使用
- **TypeScript 5.9.2**
- **microCMS SDK** - コンテンツ管理
- **CSS Modules** - スタイリング
