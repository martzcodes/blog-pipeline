#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CentralPipeline } from "../lib/central-pipeline";
import { stageGenerator } from "../lib/stage-generator";

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const owner = "martzcodes";
const repo = "blog-pipeline";
const branch = "main";
const secretArn = `arn:aws:secretsmanager:${env.region}:${env.account}:secret:BlogPipelineGitHubToken-gwKanq`;

const app = new cdk.App();

const usePipeline = !!process.env.USE_PIPELINE;

new CentralPipeline(app, `My${usePipeline ? "Pipeline" : "Stack"}`, {
  usePipeline,
  owner,
  repo,
  branch,
  secretArn,
  stages: [
    {
      name: "Main",
      env,
    },
    // {
    //   name: "FakeProd",
    //   env: {
    //     account: '12345',
    //     region: 'us-east-1',
    //   },
    // },
  ],
  pullRequestProjects: [["npm run test"]],
  stageGenerator: stageGenerator,
});
