import { mccSettings } from "../global-settings/globalSettings";

export enum mccErrorCode {
    InvalidParameter,

    InvalidData,

    InvalidBlock,
    InvalidTransaction,

    InvalidResponse,

    OutsideError,
};

export class mccError extends Error {
    errorCode: mccErrorCode;

    innerError: Error | undefined;

    constructor(errorCode: mccErrorCode, innerError?: Error) {
        super(mccErrorCode[errorCode as any as number]);

        this.name = "mccError";
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

// class TEST {

//     test(): number {

//         throw new mccError(mccErrorCode.InvalidData);

//         try {
//             //
//         }
//         catch (error) {
//             throw new mccOutsideError(error);
//         }

//         return 0;
//     }
// }

