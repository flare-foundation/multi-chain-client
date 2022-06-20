import { RegisterTraceClass, RegisterTraceGetter, RegisterTraceSetter, TraceManager } from "./trace";

export function disableManaged() {
   TraceManager.enabled = false;
}

export function Managed() {


   return (target: any, name?: string, descriptor?: any) => {
      if (!TraceManager.enabled) return target;

      let trace = null;

      //let trace = RegisterTraceValue(target, name, descriptor);
      //if (trace) return trace;

      trace = RegisterTraceGetter(target, name, descriptor);
      if (trace) return trace;

      trace = RegisterTraceSetter(target, name, descriptor);
      if (trace) return trace;

      return RegisterTraceClass(target);
   };
}
