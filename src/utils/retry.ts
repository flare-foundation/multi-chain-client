import { IExceptionCallback as backOffTime, ILoggingCallback } from "../types/genericMccTypes";
import { defaultExceptionCallback, defaultWarningCallback, getSimpleRandom, MccError, sleepMs } from "./utils";

const TIMEOUT_STEP_MULTIPLY = 1.2;
const BACKOFF_TIME_STEP_MULTIPLY = 1.2;

const retrySleepResult = "wVgdz8YJgsUud6CPtKYH8tw4mHdLHLbgrEGsGqdWetPDKWAW5hbZ5LMz";

async function retrySleepMs(ms: number): Promise<string> {
    await sleepMs(ms);
    return retrySleepResult;
}

export async function retry<T>(
    label: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    funct: (...args: any) => T,
    timeoutTime: number = 5000,
    numRetries: number = 5,
    backOddTimeout: number = 1000,
    exceptionCallback: backOffTime = defaultExceptionCallback,
    warningCallback: ILoggingCallback = defaultWarningCallback,

    failure: (label: string) => void = (label) => {}
): Promise<T> {
    try {
        const result = await Promise.race([funct(), retrySleepMs(timeoutTime)]);

        if (result !== retrySleepResult) return result as T;
        // timeout section
        if (numRetries > 0) {
            warningCallback(`retry ^R${label}^^ ${numRetries}`);

            await sleepMs(backOddTimeout / 2 + getSimpleRandom(backOddTimeout / 2));

            return retry(
                label,
                funct,
                timeoutTime * TIMEOUT_STEP_MULTIPLY,
                numRetries - 1,
                backOddTimeout * BACKOFF_TIME_STEP_MULTIPLY,
                exceptionCallback,
                warningCallback,
                failure
            );
        } else {
            warningCallback(`retry ^R${label}^^ failed`);

            // failure callback
            failure(label);

            //  return null; // TODO this should probably raise an error
            throw MccError(`retry ^R${label}^^ failed`);
        }
    } catch (error) {
        // exception section
        if (numRetries > 0) {
            exceptionCallback(error, `retry ^R${label}^^ exception (retry ${numRetries})`);

            await sleepMs(backOddTimeout / 2 + getSimpleRandom(backOddTimeout / 2));

            return retry(
                label,
                funct,
                timeoutTime * TIMEOUT_STEP_MULTIPLY,
                numRetries - 1,
                backOddTimeout * BACKOFF_TIME_STEP_MULTIPLY,
                exceptionCallback,
                warningCallback,
                failure
            );
        } else {
            exceptionCallback(error, `retry ^R${label}^^ exception (retry failed)`);

            // failure callback
            failure(label);

            //  return null;
            throw MccError(error);
        }
    }
}
