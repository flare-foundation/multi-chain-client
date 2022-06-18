import { RegisterTraceClass, RegisterTraceGetter, RegisterTraceSetter } from "./trace";

export function Managed() {

   return (target: any, name?: string, descriptor?: any) => {


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
