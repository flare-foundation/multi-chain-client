// eslint-disable-next-line @typescript-eslint/no-explicit-any
type loggingCallbackType = typeof console.log | typeof console.warn | typeof console.error;

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
function emptyFn(data: any): void {
    return;
}

class MccGlobalSettings {
    // loggingCallback: loggingCallbackType = console.log;
    // warningCallback: loggingCallbackType = console.warn;
    // errorCallback: loggingCallbackType = console.error;
    loggingCallback: loggingCallbackType = emptyFn;
    warningCallback: loggingCallbackType = emptyFn;
    errorCallback: loggingCallbackType = emptyFn;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {}

    public set setLoggingCallback(logCallback: loggingCallbackType) {
        this.loggingCallback = logCallback;
    }

    public set setWarningCallback(warningCallback: loggingCallbackType) {
        this.warningCallback = warningCallback;
    }

    public set setErrorCallback(errorCallback: loggingCallbackType) {
        this.errorCallback = errorCallback;
    }
}

export const mccSettings = new MccGlobalSettings();
