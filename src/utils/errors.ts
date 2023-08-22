export const MCC_ERROR = "mccError";

export enum mccErrorCode {
    InvalidParameter,

    InvalidData,

    InvalidBlock,
    InvalidTransaction,

    InvalidResponse,

    InvalidMethodCall,

    NotImplemented,

    OutsideError,
}

export class mccError extends Error {
    errorCode: mccErrorCode;

    innerError: Error | undefined;

    constructor(errorCode: mccErrorCode, innerError?: Error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        super(mccErrorCode[errorCode as any as number]);

        this.name = MCC_ERROR;
        this.errorCode = errorCode;

        this.innerError = innerError;
    }

    public toString() {
        let errorText = `${this.name}:${this.message} (${mccErrorCode[this.errorCode]}=${this.errorCode})\n`;
        if (this.innerError) {
            errorText += `INNER ERROR: ${this.innerError.name}:${this.message}\n`;
        }

        if (this.innerError?.stack) {
            errorText += `INNER STACK:\n${this.innerError.stack}`;
        } else if (this.stack) {
            errorText += `STACK\n${this.stack}`;
        } else {
            errorText += `LOCAL STACK:\n${new Error().stack}`;
        }

        return errorText;
    }
}

export class mccOutsideError extends mccError {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(innerError: any) {
        super(mccErrorCode.OutsideError, innerError as Error);
    }
}
