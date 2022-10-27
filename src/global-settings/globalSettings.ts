// eslint-disable-next-line @typescript-eslint/no-explicit-any
type loggingCallbackType = { (...data: any[]): void; (message?: any, ...optionalParams: any[]): void };

class MccGlobalSettings {
   loggingCallback: loggingCallbackType = console.log;
   warningCallback = console.warn;
   errorCallback = console.error;

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
