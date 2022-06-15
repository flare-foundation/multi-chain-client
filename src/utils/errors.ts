import { mccSettings } from "../global-settings/globalSettings";

const MCC_ERROR = "mccError";

export enum mccErrorCode {
   InvalidParameter,

   InvalidData,

   InvalidBlock,
   InvalidTransaction,

   InvalidResponse,

   InvalidMethodCall,

   OutsideError,
}

export class mccError extends Error {
   errorCode: mccErrorCode;

   innerError: Error | undefined;

   constructor(errorCode: mccErrorCode, innerError?: Error) {
      super(mccErrorCode[errorCode as any as number]);

      this.name = MCC_ERROR;
      this.errorCode = errorCode;

      this.innerError = innerError;

      //mccSettings?.loggingCallback( ".1.....");
      //mccSettings?.errorCallback( this );
      //mccSettings?.loggingCallback( ".2.....");
   }
}

export class mccOutsideError extends mccError {
   constructor(innerError: any) {
      super(mccErrorCode.OutsideError, innerError as Error);
   }
}

////////////////
// Decorators //
////////////////

export function AsyncTryCatchWrapper() {
   return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalFn = descriptor.value;
      descriptor.value = async function (...args: any[]) {
         try {
            return await originalFn.apply(this, args);
         } catch (error: any) {
            if (error?.name === MCC_ERROR) {
               throw error;
            }

            throw new mccOutsideError(error);
         }
      };
      return descriptor;
   };
}

export function SyncTryCatchWrapper() {
   return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalFn = descriptor.value;
      descriptor.value = function (...args: any[]) {
         try {
            return originalFn.apply(this, args);
         } catch (error: any) {
            if (error?.name === MCC_ERROR) {
               throw error;
            }
            throw new mccOutsideError(error);
         }
      };
      return descriptor;
   };
}

export function GetTryCatchWrapper() {
   return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {

      if (descriptor.get) {
         const originalGet = descriptor.get;
         descriptor.get = function () {
            try {
               return originalGet();
            } catch (error: any) {
               if (error?.name === MCC_ERROR) {
                  throw error;
               }
               throw new mccOutsideError(error);
            }
         };
      }

      return descriptor;
   };
}

export function isPromise(p: any) {
   if (typeof p === 'object' && typeof p.then === 'function') {
      return true;
   }
   return false;
}

export function TryCatchWrapper() {
   return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
      if (descriptor.get) {
         const originalGet = descriptor.get;
         descriptor.get = function () {
            try {
               return originalGet();
            } catch (error: any) {
               if (error?.name === MCC_ERROR) {
                  throw error;
               }
               throw new mccOutsideError(error);
            }
         };
      } else if (typeof descriptor.value === "function") {
         const originalFn = descriptor.value;
         descriptor.value = function (...args: any[]) {
            try {
               let res = originalFn.apply(this, args);
               if (!isPromise(res)) {
                  return res;
               }
               return new Promise((resolve, reject) => {
                  res.then(resolve).catch((error: any) => {
                     if (error?.name === MCC_ERROR) {
                        reject(error);
                     }
                     reject(new mccOutsideError(error));      
                  });
               })
            } catch (error: any) {
               if (error?.name === MCC_ERROR) {
                  throw error;
               }
               throw new mccOutsideError(error);
            }
         };

      }
      return descriptor;
   };
}
