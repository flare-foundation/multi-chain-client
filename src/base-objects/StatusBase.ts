export type IStatus = StatusBase<any>;

export abstract class StatusBase<S> {
   data: S;

   constructor(data: S) {
      this.data = data;
   }

   public abstract get version(): string;
   public abstract get health(): string;

   public abstract get isHealthy(): boolean;
   public abstract get isSynced(): boolean;
}

export { AlgoStatus } from "./status/AlgoStatus";
export { UtxoStatus } from "./status/UtxoStatus";
export { XrpStatus } from "./status/XrpStatus";