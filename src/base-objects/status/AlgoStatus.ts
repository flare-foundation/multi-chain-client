import { IAlgoStatusObject } from "../../types";
import { Managed } from "../../utils/managed";
import { NodeStatusBase } from "../StatusBase";

@Managed()
export class AlgoNodeStatus extends NodeStatusBase<IAlgoStatusObject> {
   public get version(): string {
      const build = this.data.versions.build;
      return `${build.major}_${build.minor}_${build.buildNumber}_${build.commitHash}`;
   }

   public get state(): string {
      // TODO
      return "TODO";
   }

   public get isHealthy(): boolean {
      return this.data.health === 200;
   }

   public get isSynced(): boolean {
      // TODO make sure that this means it is synced
      return this.data?.status?.catchupTime === 0;
   }
}
