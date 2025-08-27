import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  Duration,
  RemovalPolicy,
  aws_s3 as s3,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_iam as iam,
  aws_ssm as ssm,
} from 'aws-cdk-lib';
import { Code } from 'aws-cdk-lib/aws-lambda';

export class StaticHostingStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    project: string,
    phase: string,
    props?: cdk.StackProps,
  ) {
    super(scope, id, props);

    ////////////////////////////
    //          S3            //
    ////////////////////////////

    const corsRule: s3.CorsRule = {
      id: `${project}-${phase}-static-web-hosting-cors-rule`,
      allowedHeaders: [
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
      ],
      allowedMethods: [s3.HttpMethods.GET],
      allowedOrigins: ['*'],
      maxAge: 600,
    };

    // S3バケット作成（ホスティング用）
    const hostingBucket: s3.Bucket = new s3.Bucket(
      this,
      `${project}-${phase}-static-web-hosting-bucket`,
      {
        bucketName: `${project}-${phase}-static-web-hosting-bucket`,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        removalPolicy: RemovalPolicy.DESTROY,
        encryption: s3.BucketEncryption.S3_MANAGED,
        versioned: true,
        cors: [corsRule],
      },
    );

    // OAI作成
    const oai = new cloudfront.OriginAccessIdentity(
      this,
      `${project}-${phase}-cloudfront-oai`,
      { comment: `${project}-${phase}-cloudfront-oai` },
    );

    // CF バケットポリシー作成
    const bucketPolicyGet = new iam.PolicyStatement({
      sid: 'AllowCanonicalUser',
      effect: iam.Effect.ALLOW,
      actions: ['s3:GetObject'],
      principals: [
        new iam.CanonicalUserPrincipal(
          oai.cloudFrontOriginAccessIdentityS3CanonicalUserId,
        ),
      ],
      resources: [`${hostingBucket.bucketArn}/*`],
    });

    const bucketPolicyHttps = new iam.PolicyStatement({
      sid: 'AllowSSLRequestsOnly',
      effect: iam.Effect.DENY,
      actions: ['s3:*'],
      principals: [new iam.StarPrincipal()],
      resources: [hostingBucket.bucketArn, hostingBucket.bucketArn + '/*'],
      conditions: {
        Bool: {
          'aws:SecureTransport': 'false',
        },
      },
    });

    hostingBucket.addToResourcePolicy(bucketPolicyGet);
    hostingBucket.addToResourcePolicy(bucketPolicyHttps);

    ////////////////////////////
    //       Cloudfront       //
    ////////////////////////////

    // CloudFront レスポンスヘッダ作成
    const ResponseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(
      this,
      `${project}-${phase}-static-web-hosting-response_headers_policy`,
      {
        responseHeadersPolicyName: `${project}-${phase}-static-web-hosting-response_headers_policy`,
        comment: `${project}-${phase}-static-web-hosting-response_headers_policy`,
        corsBehavior: {
          accessControlAllowCredentials: true,
          accessControlAllowHeaders: [
            'Access-Control-Allow-Origin',
            'Authorization',
          ],
          accessControlAllowMethods: ['GET', 'OPTIONS'],
          accessControlAllowOrigins: ['*'],
          accessControlMaxAge: Duration.seconds(600),
          originOverride: true,
        },
        removeHeaders: ['Server'],
        serverTimingSamplingRate: 50,
      },
    );

    // // ベーシック認証用 CF Function 作成
    // const basicAuthFunction = new cloudfront.Function(
    //     this,
    //     `${project}-${phase}-basicAuth-${this.node.addr}`.substring(0, 64),
    //     {
    //         functionName:
    //             `${project}-${phase}-basicAuth-${this.node.addr}`.substring(
    //                 0,
    //                 64
    //             ),
    //         code: cloudfront.FunctionCode.fromFile({
    //             filePath: 'src/cloudfront/cloudfront_basic_auth.js',
    //         }),
    //     }
    // );

    // Coudfrontディストリビューション作成
    const distribution = new cloudfront.Distribution(
      this,
      `${project}-${phase}-static-web-hosting-distribution`,
      {
        comment: `${project}-${phase}-static-web-hosting-distribution`,
        priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
        defaultBehavior: {
          origin: origins.S3BucketOrigin.withOriginAccessControl(hostingBucket),
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          responseHeadersPolicy: ResponseHeadersPolicy,
        },
      },
    );

    new ssm.StringParameter(this, `${project}-${phase}-origin-bucket`, {
      parameterName: `${project}-${phase}-origin-bucket`,
      stringValue: hostingBucket.bucketArn,
    });
    new ssm.StringParameter(this, `${project}-${phase}-distribution-id`, {
      parameterName: `${project}-${phase}-distribution-id`,
      stringValue: distribution.distributionId,
    });
  }
}
