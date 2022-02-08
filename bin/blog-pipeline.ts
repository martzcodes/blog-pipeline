#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CentralPipeline } from "../lib/central-pipeline";
import { stageGenerator } from "../lib/stage-generator";

const owner = "martzcodes";
const repo = "blog-pipeline";
const branch = "main";
const secretArn =
  "arn:aws:secretsmanager:us-east-1:359317520455:secret:BlogPipelineGitHubToken-gwKanq";

const app = new cdk.App();

const usePipeline = !!process.env.USE_PIPELINE;

new CentralPipeline(app, `My${usePipeline ? "Pipeline" : "Stack"}`, {
  usePipeline,
  owner,
  repo,
  branch,
  secretArn,
  stages: ["QueueStage"],
  pullRequestProjects: [["npm run test"],],
  stageGenerator: stageGenerator,
});
