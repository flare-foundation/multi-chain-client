import { NodeStatusBase } from "../StatusBase";


export class AlgoNodeStatus extends NodeStatusBase<any> {
  public get version(): string {
    throw new Error("Method not implemented.");
  }
  public get health(): string {
    throw new Error("Method not implemented.");
  }
  public get isHealthy(): boolean {
    throw new Error("Method not implemented.");
  }
  public get isSynced(): boolean {
    throw new Error("Method not implemented.");
  }

}