import { defaultExceptionCallback, defaultWarningCallback, MccError } from "..";
import { IExceptionCallback as backOffTime, ILoggingCallback } from "../types/genericMccTypes";
import { getSimpleRandom, sleepMs } from "./utils";

let TIMEOUT_STEP_MULTIPLY = 1.2;
let BACKOFF_TIME_STEP_MULTIPLY = 1.2;

export async function retry<T>(
   label: string,
   funct: (...args: any) => T,
   timeoutTime: number = 5000,
   numRetries: number = 5,
   backOddTimeout: number = 1000,
   exceptionCallback: backOffTime = defaultExceptionCallback,
   warningCallback: ILoggingCallback = defaultWarningCallback,
   failure: (label: string) => void = (label) => {}
): Promise<T> {
   try {
      let result = await Promise.race([funct(), sleepMs(timeoutTime)]);

      if (result) return result as T;

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
