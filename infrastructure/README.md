# S1MLOG Infrastructure - AWS CDK

s1mlogブログのインフラストラクチャをAWS CDKで管理します。

## 構成

このCDKプロジェクトは以下のAWSリソースを作成します：

### StaticHostingStack
- **S3バケット** - 静的サイトホスティング用
- **CloudFrontディストリビューション** - CDN配信
- **Origin Access Identity (OAI)** - S3へのセキュアアクセス

### GithubRoleStack
- **IAMロール** - GitHub Actions用（OIDC認証）
- **IAMポリシー** - S3アップロード、CloudFront無効化権限
- **SSMパラメータ** - リソース参照用

## 前提条件

- Node.js 18以上
- AWS CLI設定済み
- AWS CDK CLI インストール済み（`npm install -g aws-cdk`）
- AWSアカウント

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数ファイルの作成

`.env`ファイルを作成し、AWSアカウントIDを設定します：

```bash
echo "prd=123456789012" > .env  # あなたのAWSアカウントIDに置き換え
```

### 3. CDKブートストラップ（初回のみ）

```bash
npx cdk bootstrap -c account=123456789012 -c attrphase=prd -c target=app
```

### 4. スタックのデプロイ

```bash
# 全スタックをデプロイ
npx cdk deploy --all -c account=123456789012 -c attrphase=prd -c target=app

# または個別にデプロイ
npx cdk deploy StaticHostingStack -c account=123456789012 -c attrphase=prd -c target=app
npx cdk deploy GithubRoleStack -c account=123456789012 -c attrphase=prd -c target=app
```

## デプロイパラメータ

- **account**: AWSアカウントID（12桁）
- **attrphase**: 環境（dev/stg/prd）
- **target**: デプロイターゲット（app）

## GitHub Actions設定

デプロイ後、以下の値をGitHubリポジトリのSecretsに設定してください：

1. **AWS_ACCOUNT_ID**: あなたのAWSアカウントID
2. **MICROCMS_API_KEY**: microCMS APIキー
3. **MICROCMS_SERVICE_DOMAIN**: microCMSサービスドメイン
4. **BASE_URL**: CloudFrontディストリビューションのURL（https://xxxxx.cloudfront.net）

CloudFrontのURLは、AWSコンソールまたは以下のコマンドで確認できます：

```bash
aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='s1mlog-prd-static-web-hosting-distribution'].DomainName" --output text
```

## 便利なコマンド

```bash
npm run build        # TypeScriptをコンパイル
npm run watch        # 変更を監視してコンパイル
npm run test         # Jestテストを実行
npx cdk diff         # デプロイ済みスタックとの差分を確認
npx cdk synth        # CloudFormationテンプレートを生成
npx cdk destroy      # スタックを削除（注意：データも削除されます）
```

## リソース命名規則

すべてのリソースは以下の命名規則に従います：
`{project}-{phase}-{resource-type}`

例：
- s1mlog-prd-static-web-hosting-bucket
- s1mlog-prd-github-role
- s1mlog-prd-distribution-id

## トラブルシューティング

### CDKブートストラップエラー
```bash
# リージョンを明示的に指定
npx cdk bootstrap aws://123456789012/ap-northeast-1
```

### デプロイ権限エラー
AWS CLIが正しく設定されているか確認：
```bash
aws sts get-caller-identity
```

### GitHub Actionsエラー
- IAMロールのTrust Relationshipを確認
- リポジトリ名が正しく設定されているか確認（GithubRoleStack.ts:21）

## 注意事項

- S3バケットは`RemovalPolicy.DESTROY`に設定されています。本番環境では`RETAIN`に変更することを推奨
- CloudFrontの無効化はコストが発生する可能性があります（月1000パスまで無料）
- デプロイ時は必ず正しい環境（prd/stg/dev）を指定してください
