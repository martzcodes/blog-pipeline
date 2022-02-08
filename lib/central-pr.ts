import {
  BuildSpec,
  EventAction,
  FilterGroup,
  Project,
  Source,
} from "aws-cdk-lib/aws-codebuild";
import { Construct } from "constructs";

export interface CentralPullRequestBuildProps {
  branch: string;
  buildCommands: string[];
  owner: string;
  projectName?: string;
  repo: string;
}

export class CentralPullRequestBuild extends Construct {
  constructor(scope: Construct, id: string, props: CentralPullRequestBuildProps) {
    super(scope, id);

    const { projectName } = props;

    const prSpec = BuildSpec.fromObject({
      version: 0.2,
      phases: {
        install: {
          commands: ["n latest", "node -v", "npm ci"],
        },
        build: {
          commands: props.buildCommands,
        },
      },
    });

    const source = Source.gitHub({
      owner: props.owner,
      repo: props.repo,
      webhook: true,
      webhookFilters: [
        FilterGroup.inEventOf(
          EventAction.PULL_REQUEST_CREATED,
          EventAction.PULL_REQUEST_UPDATED,
          EventAction.PULL_REQUEST_REOPENED
        ).andBranchIsNot(props.branch),
      ],
      reportBuildStatus: true,
    });

    new Project(this, "PRProject", {
      projectName,
      source,
      buildSpec: prSpec,
      concurrentBuildLimit: 1,
    });
  }
}
