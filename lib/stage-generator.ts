import { Construct } from "constructs";
import { QueueStack } from "./queue-stack";

export const stageGenerator = (scope: Construct, id: string) => {
    new QueueStack(scope, id, {});
}