import { AxiosInstance } from "axios";
import { optional } from "../utils/typeReflection";

export interface RateLimitedAxiosInstance extends AxiosInstance {
    getMaxRPS(): number;
    setMaxRPS(rps: number): void;
    setRateLimitOptions(options: RateLimitOptions): void;
    // enable(axios: any): void,
    // handleRequest(request:any):any,
    // handleResponse(response: any): any,
    // push(requestHandler:any):any,
    // shiftInitial():any,
    // shift():any
}

export class RateLimitOptions {
    @optional() maxRequests?: number = 1;
    @optional() perMilliseconds?: number = 1;
    @optional() maxRPS?: number = 10;
    @optional() timeoutMs?: number = 3000;
    retries?: number = 10;
    onSend?: (inProcessing?: number, inQueue?: number, reqsPs?: number, retiresPs?: number) => void;
    onResponse?: (inProcessing?: number, inQueue?: number, reqsPs?: number, retiresPs?: number) => void;
    onPush?: (inProcessing?: number, inQueue?: number, reqsPs?: number, retiresPs?: number) => void;
    onQueueEmpty?: (inProcessing?: number, inQueue?: number, reqsPs?: number, retiresPs?: number) => void;
    onLimitReached?: (inProcessing?: number, inQueue?: number, reqsPs?: number, retiresPs?: number) => void;
    onRpsSample?: (inProcessing?: number, inQueue?: number, reqsPs?: number, retiresPs?: number) => void;
    onRetry?: (retryCount?: number) => void;
}
