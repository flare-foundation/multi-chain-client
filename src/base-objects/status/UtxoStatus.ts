import { IUtxoNodeStatus } from "../../types";
import { GetTryCatchWrapper } from "../../utils/errors";
import { NodeStatusBase } from "../StatusBase";

export class UtxoNodeStatus extends NodeStatusBase<IUtxoNodeStatus> {
   @GetTryCatchWrapper()
   public get version(): string {
      return `${this.data.version}_${this.data.protocolversion}_${this.data.subversion}`;
   }

   @GetTryCatchWrapper()
   public get state(): string {
      return "full";
   }

   @GetTryCatchWrapper()
   public get isHealthy(): boolean {
      return this.data.networkactive;
   }

   @GetTryCatchWrapper()
   public get isSynced(): boolean {
      return this.data.networkactive;
   }
}
