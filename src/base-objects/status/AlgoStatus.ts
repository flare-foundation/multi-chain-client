import { IAlgoStatusObject } from "../../types";
import { GetTryCatchWrapper } from "../../utils/errors";
import { NodeStatusBase } from "../StatusBase";

export class AlgoNodeStatus extends NodeStatusBase<IAlgoStatusObject> {
   @GetTryCatchWrapper()
   public get version(): string {
      const build = this.data.versions.build;
      return `${build.major}_${build.minor}_${build.buildNumber}_${build.commitHash}`;
   }

   @GetTryCatchWrapper()
   public get state(): string {
      // TODO
      return "TODO";
   }

   @GetTryCatchWrapper()
   public get isHealthy(): boolean {
      return this.data.health === 200;
   }

   @GetTryCatchWrapper()
   public get isSynced(): boolean {
      // TODO make sure that this means it is synced
      return this.data?.status?.catchupTime === 0;
   }
}
