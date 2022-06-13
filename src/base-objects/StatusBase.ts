export type INodeStatus = NodeStatusBase<any>;

export abstract class NodeStatusBase<S> {
   data: S;

   constructor(data: S) {
      this.data = data;
   }

   public abstract get version(): string;
   public abstract get state(): string;

   public abstract get isHealthy(): boolean;
   public abstract get isSynced(): boolean;
}

export { AlgoNodeStatus } from "./status/AlgoStatus";
export { UtxoNodeStatus } from "./status/UtxoStatus";
export { XrpNodeStatus } from "./status/XrpStatus";
