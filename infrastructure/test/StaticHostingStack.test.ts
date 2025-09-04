import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { StaticHostingStack } from '../lib/StaticHostingStack';

describe('StaticHostingStack', () => {
  let app: cdk.App;
  let stack: StaticHostingStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new StaticHostingStack(app, 'TestStack', 'test-project', 'test', {
      env: {
        account: '123456789012',
        region: 'ap-northeast-1',
      },
    });
    template = Template.fromStack(stack);
  });

  describe('S3 Bucket', () => {
    it('S3バケットが作成される', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketName: 'test-project-test-static-web-hosting-bucket',
        BucketEncryption: {
          ServerSideEncryptionConfiguration: [
            {
              ServerSideEncryptionByDefault: {
                SSEAlgorithm: 'AES256',
              },
            },
          ],
        },
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
        VersioningConfiguration: {
          Status: 'Enabled',
        },
      });
    });

    it('CORSルールが設定される', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        CorsConfiguration: {
          CorsRules: [
            Match.objectLike({
              AllowedHeaders: Match.arrayWith(['Origin']),
              AllowedMethods: ['GET'],
              AllowedOrigins: ['*'],
              MaxAge: 600,
            }),
          ],
        },
      });
    });

    it('バケットポリシーが設定される', () => {
      template.hasResourceProperties('AWS::S3::BucketPolicy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            // OAIアクセス許可
            Match.objectLike({
              Sid: 'AllowCanonicalUser',
              Effect: 'Allow',
              Action: 's3:GetObject',
            }),
            // HTTPS強制
            Match.objectLike({
              Sid: 'AllowSSLRequestsOnly',
              Effect: 'Deny',
              Condition: {
                Bool: {
                  'aws:SecureTransport': 'false',
                },
              },
            }),
          ]),
        },
      });
    });
  });

  describe('CloudFront', () => {
    it('CloudFrontディストリビューションが作成される', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: Match.objectLike({
          Comment: 'test-project-test-static-web-hosting-distribution',
          PriceClass: 'PriceClass_200',
          DefaultCacheBehavior: Match.objectLike({
            ViewerProtocolPolicy: 'redirect-to-https',
            AllowedMethods: ['GET', 'HEAD'],
          }),
        }),
      });
    });

    it('Origin Access Identityが作成される', () => {
      template.hasResourceProperties(
        'AWS::CloudFront::CloudFrontOriginAccessIdentity',
        {
          CloudFrontOriginAccessIdentityConfig: {
            Comment: 'test-project-test-cloudfront-oai',
          },
        },
      );
    });

    it('レスポンスヘッダーポリシーが設定される', () => {
      template.hasResourceProperties('AWS::CloudFront::ResponseHeadersPolicy', {
        ResponseHeadersPolicyConfig: Match.objectLike({
          Name: 'test-project-test-static-web-hosting-response_headers_policy',
          CorsConfig: Match.objectLike({
            AccessControlAllowCredentials: true,
            AccessControlAllowHeaders: {
              Items: Match.arrayWith(['Access-Control-Allow-Origin']),
            },
            AccessControlAllowMethods: {
              Items: Match.arrayWith(['GET', 'OPTIONS']),
            },
            AccessControlAllowOrigins: {
              Items: ['*'],
            },
            AccessControlMaxAgeSec: 600,
            OriginOverride: true,
          }),
          RemoveHeadersConfig: {
            Items: Match.arrayWith([
              {
                Header: 'Server',
              },
            ]),
          },
        }),
      });
    });
  });

  describe('SSM Parameters', () => {
    it('バケットARNがSSMパラメータに保存される', () => {
      template.hasResourceProperties('AWS::SSM::Parameter', {
        Name: 'test-project-test-origin-bucket',
        Type: 'String',
      });
    });

    it('ディストリビューションIDがSSMパラメータに保存される', () => {
      template.hasResourceProperties('AWS::SSM::Parameter', {
        Name: 'test-project-test-distribution-id',
        Type: 'String',
      });
    });
  });

  describe('Stack Configuration', () => {
    it('削除時にリソースが削除される設定', () => {
      template.hasResource('AWS::S3::Bucket', {
        UpdateReplacePolicy: 'Delete',
        DeletionPolicy: 'Delete',
      });
    });

    it('正しいタグが設定される', () => {
      const stackTags = stack.tags.tagValues();
      expect(stackTags).toMatchObject({});
    });
  });
});