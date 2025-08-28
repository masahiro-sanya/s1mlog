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

### 4. デプロイ前の確認（推奨）

#### CloudFormationテンプレートの生成
```bash
# テンプレートを生成して確認
npx cdk synth -c account=123456789012 -c attrphase=prd -c target=app

# 特定のスタックのテンプレートのみ生成
npx cdk synth StaticHostingStack -c account=123456789012 -c attrphase=prd -c target=app
```

#### 変更内容の差分確認
```bash
# 現在デプロイされているスタックとの差分を表示
npx cdk diff -c account=123456789012 -c attrphase=prd -c target=app

# 特定のスタックの差分のみ確認
npx cdk diff StaticHostingStack -c account=123456789012 -c attrphase=prd -c target=app
```

### 5. スタックのデプロイ

```bash
# 全スタックをデプロイ
npx cdk deploy --all -c account=123456789012 -c attrphase=prd -c target=app

# または個別にデプロイ
npx cdk deploy StaticHostingStack -c account=123456789012 -c attrphase=prd -c target=app
npx cdk deploy GithubRoleStack -c account=123456789012 -c attrphase=prd -c target=app
```

## デプロイパラメータ詳細

### 必須パラメータ

| パラメータ | 説明 | 有効な値 | 例 |
|---------|------|---------|-----|
| **account** | AWSアカウントID（12桁の数字） | 12桁の数字 | `123456789012` |
| **attrphase** | デプロイ環境の指定 | `dev`, `stg`, `prd` | `prd` |
| **target** | デプロイターゲット | `app`, `cicd`, `repo`, `config`, `cicd-fe`, `cicd-be` | `app` |

### パラメータの役割

- **account**: デプロイ先のAWSアカウントを指定。.envファイルの値と一致する必要があります
- **attrphase**: 環境ごとにリソースを分離（例：s1mlog-**prd**-bucket vs s1mlog-**dev**-bucket）
- **target**: デプロイするスタックのセットを選択（通常は`app`を使用）

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

### 開発コマンド
```bash
npm run build        # TypeScriptをコンパイル
npm run watch        # 変更を監視してコンパイル
npm run test         # Jestテストを実行
```

### CDKコマンド（必須パラメータ付き）
```bash
# CloudFormationテンプレートを生成して確認
npx cdk synth -c account=123456789012 -c attrphase=prd -c target=app

# デプロイ済みスタックとの差分を確認
npx cdk diff -c account=123456789012 -c attrphase=prd -c target=app

# スタック一覧を表示
npx cdk list -c account=123456789012 -c attrphase=prd -c target=app

# スタックを削除（注意：データも削除されます）
npx cdk destroy --all -c account=123456789012 -c attrphase=prd -c target=app
```

### 出力の保存例
```bash
# synthの結果をファイルに保存
npx cdk synth -c account=123456789012 -c attrphase=prd -c target=app > template.yaml

# diffの結果をファイルに保存
npx cdk diff -c account=123456789012 -c attrphase=prd -c target=app > changes.txt
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
