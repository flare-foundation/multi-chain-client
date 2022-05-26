import { IAlgoStatusObject } from "../../types";
import { NodeStatusBase } from "../StatusBase";


export class AlgoNodeStatus extends NodeStatusBase<IAlgoStatusObject> {

  public get version(): string {
    const build = this.data.versions.build
    return `${build.major}_${build.minor}_${build.buildNumber}_${build.commitHash}`
  }
  public get state(): string {
    throw new Error("Method not implemented.");
  }

  public get bottomBlock(): number {
    throw new Error("Method not implemented.");
  }

  public get isHealthy(): boolean {
    return this.data.health === 200
  }
  public get isSynced(): boolean {
    throw new Error("Method not implemented.");
  }

}