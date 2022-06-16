import { Managed } from "./managed";

export const MCC_ERROR = "mccError";

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
   }
}

export class mccOutsideError extends mccError {
   constructor(innerError: any) {
      super(mccErrorCode.OutsideError, innerError as Error);
   }
}