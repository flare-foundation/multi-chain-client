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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        if (!TraceManager.enabled) return target;

        let trace = null;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        trace = RegisterTraceGetter(target, name, descriptor);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        if (trace) return trace;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        trace = RegisterTraceSetter(target, name, descriptor);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        if (trace) return trace;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return RegisterTraceClass(target);
    };
}
