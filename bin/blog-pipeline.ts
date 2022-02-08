#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BlogPipelineStack } from '../lib/blog-pipeline-stack';
import { SecretValue, Stack, StackProps, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';
import { CodeBuildStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines';

const app = new cdk.App();

class BlogPipelineStage extends Stage {
  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props);
    new BlogPipelineStack(this, 'BlogPipelineStack', {});
  }
}

class BlogPipeline extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    const owner = 'martzcodes';
    const repo = 'blog-pipeline';
    const branch = 'main';
    const secretArn = 'arn:aws:secretsmanager:us-east-1:359317520455:secret:BlogPipelineGitHubToken-gwKanq';
    const pipelineSpec = BuildSpec.fromObject({
      version: '0.2',
      phases: {
        install: {
          commands: ['n latest', 'node -v', 'npm ci'],
        },
        build: {
          commands: ['npm run synth']
        }
      }
    });
    const synthAction = new CodeBuildStep(`Synth`, {
      input: CodePipelineSource.gitHub(`${owner}/${repo}`, branch, {
        authentication: SecretValue.secretsManager(secretArn, {
        jsonField: 'access-token',
      }),
      }),
      partialBuildSpec: pipelineSpec,
      commands: [],
    });
    const pipeline = new CodePipeline(this, `Pipeline`, {
      synth: synthAction,
      dockerEnabledForSynth: true,
      // crossAccountKeys: true, // need this if you're actually deploying to multiple accounts
    });

    const stage = new BlogPipelineStage(app, 'BlogPipelineStage', {});
    pipeline.addStage(stage);
  }
}

new BlogPipeline(app, `BlogPipeline`, {});