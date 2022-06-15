import { ServerStateResponse } from "xrpl";
import { ServerState } from "xrpl/dist/npm/models/methods/serverInfo";
import { GetTryCatchWrapper } from "../../utils/errors";
import { NodeStatusBase } from "../StatusBase";

export class XrpNodeStatus extends NodeStatusBase<ServerStateResponse> {
   @GetTryCatchWrapper()
   public get version(): string {
      return this.data?.result?.state?.build_version;
   }

   /**
    * @docs https://xrpl.org/rippled-server-states.html
    */
   @GetTryCatchWrapper()
   public get state(): ServerState {
      return this.data?.result?.state?.server_state;
   }

   @GetTryCatchWrapper()
   public get isHealthy(): boolean {
      return ["connected", "syncing", "tracking", "full", "validating", "proposing"].includes(this.state);
   }

   @GetTryCatchWrapper()
   public get isSynced(): boolean {
      return ["full", "validating", "proposing"].includes(this.state);
   }
}
