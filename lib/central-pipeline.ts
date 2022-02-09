import { Environment, SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { BuildSpec, GitHubSourceCredentials } from "aws-cdk-lib/aws-codebuild";
import {
  CodeBuildStep,
  CodePipeline,
  CodePipelineSource,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import { CentralPullRequestBuild } from "./central-pr";
import { CentralStage } from "./central-stage";

export interface CentralPipelineProps extends StackProps {
  usePipeline?: boolean;
  owner: string;
  repo: string;
  branch: string;
  secretArn: string;
  pullRequestProjects: string[][];
  stages: {
    name: string;
    env: Environment;
  }[];
  stageGenerator: (scope: Construct, id: string, props: StackProps) => void;
}

export class CentralPipeline extends Stack {
  constructor(scope: Construct, id: string, props: CentralPipelineProps) {
    super(scope, id, props);
    const { usePipeline = false, owner, repo, branch, secretArn } = props;

    if (!usePipeline) {
      // we use scope here to put the stage contents on the top level
      props.stageGenerator(scope, "QueueStack", {});

      return;
    }

    const pipelineSpec = BuildSpec.fromObject({
      version: 0.2,
      phases: {
        install: {
          commands: ["n latest", "node -v", "npm ci"],
        },
        build: {
          commands: ["npx cdk synth"],
        },
      },
    });
    const synthAction = new CodeBuildStep(`Synth`, {
      input: CodePipelineSource.gitHub(`${owner}/${repo}`, branch, {
        authentication: SecretValue.secretsManager(secretArn, {
          jsonField: "access-token",
        }),
      }),
      partialBuildSpec: pipelineSpec,
      commands: [],
    });
    const pipeline = new CodePipeline(this, `Pipeline`, {
      synth: synthAction,
      dockerEnabledForSynth: true,
      // need this if you're actually deploying to multiple accounts
      crossAccountKeys: !!props.stages.length,
    });

    props.stages.forEach((deploymentStage) => {
      const stage = new CentralStage(this, deploymentStage.name, {
        stackId: "QueueStack",
        stageGenerator: props.stageGenerator,
        env: deploymentStage.env,
      });
      pipeline.addStage(stage);
    });

    new GitHubSourceCredentials(this, "GitHubCreds", {
      accessToken: SecretValue.secretsManager(secretArn, {
        jsonField: "access-token",
      }),
    });

    props.pullRequestProjects.forEach((projectCommands) => {
      new CentralPullRequestBuild(this, "UnitTests", {
        owner,
        repo,
        branch,
        buildCommands: projectCommands,
      });
    });
  }
}
