import { StatusBase } from "../StatusBase";


export class AlgoStatus extends StatusBase<any> {
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