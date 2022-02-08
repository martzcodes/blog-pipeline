import { Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface CentralStageProps extends StageProps {
  stackId: string;
  stageGenerator: (scope: Construct, id: string) => void;
}

export class CentralStage extends Stage {
  constructor(scope: Construct, id: string, props: CentralStageProps) {
    super(scope, id, props);

    props.stageGenerator(this, props.stackId);
  }
}
