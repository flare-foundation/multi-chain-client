import { RegisterTraceClass, RegisterTraceGetter, RegisterTraceSetter, TraceManager } from "./trace";

export function disableManaged() {
    TraceManager.enabled = false;
}

export function enableManaged() {
    TraceManager.enabled = true;
}

export function Managed() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target: any, name?: string, descriptor?: any) => {
        if (!TraceManager.enabled) return target;

        let trace = null;

        trace = RegisterTraceGetter(target, name, descriptor);
        if (trace) return trace;

        trace = RegisterTraceSetter(target, name, descriptor);
        if (trace) return trace;

        return RegisterTraceClass(target);
    };
}
