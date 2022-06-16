import { RegisterTraceClass, RegisterTraceGetter, RegisterTraceValue } from "./trace";

export function Managed() {

    return (target: any, name?: string, descriptor?: any) => {
 
       let trace = RegisterTraceValue(target, name, descriptor);
       if (trace) return trace;
 
       trace = RegisterTraceGetter(target, name, descriptor);
       if (trace) return trace;
 
       return RegisterTraceClass(target);
    };
 }
 