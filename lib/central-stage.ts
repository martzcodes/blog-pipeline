import { StackProps, Stage, StageProps, Environment } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface CentralStageProps extends StageProps {
  stackId: string;
  stageGenerator: (scope: Construct, id: string, props: StackProps) => void;
  env?: Environment;
}

export class CentralStage extends Stage {
  constructor(scope: Construct, id: string, props: CentralStageProps) {
    super(scope, id, props);

    props.stageGenerator(this, props.stackId, { env: props.env });
  }
}
