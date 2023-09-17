import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_iam as iam, aws_ssm as ssm } from 'aws-cdk-lib';
import { Effect } from 'aws-cdk-lib/aws-iam';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class GithubRoleStack extends cdk.Stack {
    constructor(
        scope: Construct,
        id: string,
        project: string,
        phase: string,
        props?: cdk.StackProps
    ) {
        super(scope, id, props);

        let repo: string = '';
        if (phase == 'dev') {
            repo = 'test/test';
        } else if (phase == 'stg' || phase == 'prd') {
            repo = 'masahiro-sanya/s1mlog';
        }

        // デプロイ先 BucketArn を取得
        const bucketArn: string = ssm.StringParameter.valueForStringParameter(
            this,
            `${project}-${phase}-origin-bucket`
        );

        // DistributionID取得
        const distributionId: string =
            ssm.StringParameter.valueForStringParameter(
                this,
                `${project}-${phase}-distribution-id`
            );

        const githubIdProvider = new iam.OpenIdConnectProvider(
            this,
            `${project}-${phase}-github-id-provider`,
            {
                url: 'https://token.actions.githubusercontent.com',
                clientIds: ['sts.amazonaws.com'],
            }
        );

        const githubRole = new iam.Role(
            this,
            `${project}-${phase}-github-role`,
            {
                roleName: `${project}-${phase}-github-role`,
                assumedBy: new iam.FederatedPrincipal(
                    githubIdProvider.openIdConnectProviderArn,
                    {
                        StringLike: {
                            'token.actions.githubusercontent.com:sub':
                                'repo:' + repo + ':*',
                            'token.actions.githubusercontent.com:aud':
                                'sts.amazonaws.com',
                        },
                    },
                    'sts:AssumeRoleWithWebIdentity'
                ),
            }
        );
        const githubPolicy = new iam.Policy(
            this,
            `${project}-${phase}-github-policy`,
            {
                policyName: `${project}-${phase}-github-policy`,
                statements: [
                    new iam.PolicyStatement({
                        effect: iam.Effect.ALLOW,
                        actions: [
                            's3:PutObject',
                            's3:GetObject',
                            's3:ListBucket',
                            's3:DeleteObject',
                        ],
                        resources: [bucketArn, `${bucketArn}/*`],
                    }),
                    new iam.PolicyStatement({
                        effect: iam.Effect.ALLOW,
                        actions: ['cloudfront:CreateInvalidation'],
                        resources: [
                            `arn:aws:cloudfront::${this.account}:distribution/${distributionId}`,
                        ],
                    }),
                ],
            }
        );
        githubRole.attachInlinePolicy(githubPolicy);
    }
}
