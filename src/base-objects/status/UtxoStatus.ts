import { IUtxoNodeStatus } from "../../types";
import { GetTryCatchWrapper } from "../../utils/errors";
import { NodeStatusBase } from "../StatusBase";

export class UtxoNodeStatus extends NodeStatusBase<IUtxoNodeStatus> {
   public get version(): string {
      return `${this.data.version}_${this.data.protocolversion}_${this.data.subversion}`;
   }

   public get state(): string {
      return "full";
   }

   public get isHealthy(): boolean {
      return this.data.networkactive;
   }

   public get isSynced(): boolean {
      return this.data.networkactive;
   }
}
