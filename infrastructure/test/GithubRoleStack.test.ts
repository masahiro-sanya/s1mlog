import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { GithubRoleStack } from '../lib/GithubRoleStack';
import * as ssm from 'aws-cdk-lib/aws-ssm';

// SSMパラメータのモック
jest.mock('aws-cdk-lib/aws-ssm', () => ({
  ...jest.requireActual('aws-cdk-lib/aws-ssm'),
  StringParameter: {
    ...jest.requireActual('aws-cdk-lib/aws-ssm').StringParameter,
    valueForStringParameter: jest.fn((scope, name) => {
      if (name.includes('origin-bucket')) {
        return 'arn:aws:s3:::test-bucket';
      }
      if (name.includes('distribution-id')) {
        return 'E1234567890ABC';
      }
      return 'mock-value';
    }),
  },
}));

describe('GithubRoleStack', () => {
  let app: cdk.App;
  let stack: GithubRoleStack;
  let template: Template;

  describe('Production Environment', () => {
    beforeEach(() => {
      app = new cdk.App();
      stack = new GithubRoleStack(app, 'TestStack', 'test-project', 'prd', {
        env: {
          account: '123456789012',
          region: 'ap-northeast-1',
        },
      });
      template = Template.fromStack(stack);
    });

    it('OIDC Providerが作成される', () => {
      template.hasResourceProperties('Custom::AWSCDKOpenIdConnectProvider', {
        Url: 'https://token.actions.githubusercontent.com',
        ClientIDList: ['sts.amazonaws.com'],
      });
    });

    it('GitHub Actions用のIAMロールが作成される', () => {
      template.hasResourceProperties('AWS::IAM::Role', {
        RoleName: 'test-project-prd-github-role',
        AssumeRolePolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: 'Allow',
              Action: 'sts:AssumeRoleWithWebIdentity',
              Condition: {
                StringLike: {
                  'token.actions.githubusercontent.com:sub': 'repo:masahiro-sanya/s1mlog:*',
                  'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
                },
              },
            }),
          ]),
        },
      });
    });

    it('S3アクセス権限が設定される', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyName: 'test-project-prd-github-policy',
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: 'Allow',
              Action: Match.arrayWith([
                's3:PutObject',
                's3:GetObject',
                's3:ListBucket',
                's3:DeleteObject',
              ]),
              Resource: Match.arrayWith([
                'arn:aws:s3:::test-bucket',
                'arn:aws:s3:::test-bucket/*',
              ]),
            }),
          ]),
        },
      });
    });

    it('CloudFront無効化権限が設定される', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: 'Allow',
              Action: 'cloudfront:CreateInvalidation',
              Resource: 'arn:aws:cloudfront::123456789012:distribution/E1234567890ABC',
            }),
          ]),
        },
      });
    });
  });

  describe('Development Environment', () => {
    beforeEach(() => {
      app = new cdk.App();
      stack = new GithubRoleStack(app, 'TestStack', 'test-project', 'dev', {
        env: {
          account: '123456789012',
          region: 'ap-northeast-1',
        },
      });
      template = Template.fromStack(stack);
    });

    it('開発環境用のリポジトリ設定が使用される', () => {
      template.hasResourceProperties('AWS::IAM::Role', {
        AssumeRolePolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Condition: {
                StringLike: {
                  'token.actions.githubusercontent.com:sub': 'repo:test/test:*',
                },
              },
            }),
          ]),
        },
      });
    });
  });

  describe('Staging Environment', () => {
    beforeEach(() => {
      app = new cdk.App();
      stack = new GithubRoleStack(app, 'TestStack', 'test-project', 'stg', {
        env: {
          account: '123456789012',
          region: 'ap-northeast-1',
        },
      });
      template = Template.fromStack(stack);
    });

    it('ステージング環境用のリポジトリ設定が使用される', () => {
      template.hasResourceProperties('AWS::IAM::Role', {
        AssumeRolePolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Condition: {
                StringLike: {
                  'token.actions.githubusercontent.com:sub': 'repo:masahiro-sanya/s1mlog:*',
                },
              },
            }),
          ]),
        },
      });
    });
  });
});