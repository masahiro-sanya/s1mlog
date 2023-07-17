#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GithubRoleStack } from '../lib/GithubRoleStack';
import { StaticHostingStack } from '../lib/StaticHostingStack';
import * as dotenv from 'dotenv';
import { env } from 'process';

const app = new cdk.App();

const phase: string = app.node.tryGetContext('attrphase');
const phaselist: string[] = app.node.tryGetContext('phaselist');
const target: string = app.node.tryGetContext('target');
const targetlist: string[] = app.node.tryGetContext('targetlist');
const project: string = app.node.tryGetContext('project');
const account: string = app.node.tryGetContext('account');

const phaseOfKey: keyof NodeJS.ProcessEnv = app.node.tryGetContext('attrphase');

try {
    // .envファイルの読み込み
    const envFile = dotenv.config();
    if (envFile.error) {
        throw envFile.error;
    }
} catch (e) {
    // .envファイルが存在しない場合、エラー
    console.log(e);
    process.exit(1);
}

// .envファイルからアカウントIDを取得
const envAccount: string | undefined = process.env[phaseOfKey];

// 引数に account がない場合エラー
if (!account) {
    console.log(
        `augument error: please specify [-c account=************] at runtime.`
    );
    process.exit(1);
}

// 引数の account が不正な場合エラー
if (!account.match('[0-9]{12}')) {
    console.log(
        `augument error: please specify a 12-digit numeric account ID at runtime.`
    );
    process.exit(1);
}

if (account !== envAccount) {
    console.log(
        `augument error: Env file and argument account ID are different.`
    );
    process.exit(1);
}

// 引数に phase がない場合エラー
if (!phase) {
    console.log(
        `augument error: please specify [-c attrphase=phaselist] at runtime. in phaselist= [${phaselist}]`
    );
    process.exit(1);
}
// 引数に不正な phase を指定した場合エラー
if (phaselist.indexOf(phase) === -1) {
    console.log(`validation error: specify [attrphase] from [${phaselist}]`);
    process.exit(1);
}
// 引数に target がない場合エラー
if (!target) {
    console.log(
        `augument error: please specify [-c target=targetlist] at runtime. in targetlist= [${targetlist}]`
    );
    process.exit(1);
}
// 引数に不正な target を指定した場合エラー
if (targetlist.indexOf(target) === -1) {
    console.log(`validation error: specify [target] from [${targetlist}]`);
    process.exit(1);
}

// Env を定義
interface ENV {
    account: string;
    region: string;
}

const env_jp: ENV = {
    account: account,
    region: 'ap-northeast-1',
};

const env_us: ENV = {
    account: account,
    region: 'us-east-1',
};

if (target === 'app') {
    console.log('******************アプリケーションスタック******************');
    const staticHostingStack = new StaticHostingStack(
        app,
        'StaticHostingStack',
        project,
        phase,
        {
            env: env_jp,
        }
    );
    const githubRoleStack = new GithubRoleStack(
        app,
        'GithubRoleStack',
        project,
        phase,
        {
            env: env_jp,
        }
    );
    githubRoleStack.addDependency(staticHostingStack);
}
