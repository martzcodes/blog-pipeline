import { StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { QueueStack } from "./queue-stack";

export const stageGenerator = (scope: Construct, id: string, props: StackProps) => {
    new QueueStack(scope, id, props);
}