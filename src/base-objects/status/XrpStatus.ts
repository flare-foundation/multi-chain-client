import { ServerStateResponse } from "xrpl";
import { ServerState } from "xrpl/dist/npm/models/methods/serverInfo";
import { NodeStatusBase } from "../StatusBase";


export class XrpNodeStatus extends NodeStatusBase<ServerStateResponse> {
  public get version(): string {
    return this.data?.result?.state?.build_version;
  }

  /**
   * @docs https://xrpl.org/rippled-server-states.html
   */
  public get state(): ServerState {
    return this.data?.result?.state?.server_state;
  }

  public get bottomBlock(): any {
    try{
      const Ledgers = this.data.result.state.complete_ledgers.split(',').sort()
      return parseInt(Ledgers[Ledgers.length - 1].split('-')[0])
    }
    catch (e) {
      // todo get logging objects
      console.error(e)
      return undefined
    }
  }

  public get isHealthy(): boolean {
    return ['connected', 'syncing', 'tracking', 'full', 'validating', 'proposing'].includes(this.state);
  }
  
  public get isSynced(): boolean {
    return ['full', 'validating', 'proposing'].includes(this.state)
  }

}