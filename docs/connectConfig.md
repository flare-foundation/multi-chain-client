[Home](README.md)

# Connect config

To connect to nodes one must provide:
- basic information such as rpc endpoint and credentials.

But Mcc clients also enable users to overwrite some parameters of the client such as:
- loggingOptions : callback functionalities,
- rateLimitOptions : configure load balancers and retry logic, timeouts and more. 

## Basic credentials

This part is dependent on underlying blockchain, currently for Btc and btc like chains one must provide:

* url: string = "";
* username: string = "";
* password: string = "";

minimal example 
```javascript
const connectConfig = {
   url:'https://myAwesomeBtcNode.com/',
   username: 'user',
   password: 'pass',
}
```

for xrp:

* url: string = "";
* username?: string;
* password?: string;

```javascript
const connectConfig = {
   url:'https://myAwesomeXrpNode.com/',
}
```

for algo

* algod = new AlgoNodeApp();
* indexer = new AlgoNodeApp();

where AlgoNodeApp is an object where one needs to provide 
* url: string = "";
* token: string = "";

```javascript
const connectConfig = {
   algod: {
      url: 'https://myAwesomeXrpNode.com/algod',
      token: 'myAwesomeToken',
   },
   indexer: {
      url: 'https://myAwesomeXrpNode.com/indexer',
      token: 'myAwesomeToken2',
   },
};
```
## Rate Limit 

with this object one can configure

* maxRequests: number;
* perMilliseconds: number;
* @optional() maxRPS?: number;
* @optional() timeoutMs?: number;
* retries: number;
* onSend: (inProcessing?: number, inQueue?: number, reqsPs?: number, retiresPs?: number) => void;
* onResponse: (inProcessing?: number, inQueue?: number, reqsPs?: number, retiresPs?: number) => void;
* onPush: (inProcessing?: number, inQueue?: number, reqsPs?: number, retiresPs?: number) => void;
* onQueueEmpty: (inProcessing?: number, inQueue?: number, reqsPs?: number, retiresPs?: number) => void;
* onLimitReached: (inProcessing?: number, inQueue?: number, reqsPs?: number, retiresPs?: number) => void;
* onRpsSample: (inProcessing?: number, inQueue?: number, reqsPs?: number, retiresPs?: number) => void;
* onRetry: (retryCount?: number) => void;

default:
```javascript
{
   maxRequests = 1;
   perMilliseconds = 1;
   maxRPS = 10;
   timeoutMs = 3000;
   retries = 10;
   onSend = undefined;
   onResponse: undefined;
   onPush: undefined;
   onQueueEmpty: undefined;
   onLimitReached: undefined;
   onRpsSample: undefined;
   onRetry: undefined;
}
```

## Logging callbacks 

* mode: "off" | "production" | "develop";
* loggingCallback: (message: string) => void;;
* warningCallback: (message: string) => void;;
* exceptionCallback: (error: any, message: string) => void;;

default:
```javascript
export function defaultLoggingCallback(message: string): void {
}

export function defaultWarningCallback(message: string): void {
   console.log(message);
}

export function defaultExceptionCallback(error: any, message: string): void {
   console.log(message);
   console.error(error);
}

export function defaultMccLoggingObject() {
   return {
      mode: "develop",
      loggingCallback: defaultLoggingCallback,
      warningCallback: defaultWarningCallback,
      exceptionCallback: defaultExceptionCallback,
   };
}
```
