# Connect config

To connect to nodes one must provide:

- Basic information such as rpc endpoint and credentials.

But MCC clients also enable users to overwrite some parameters of the client such as:

- ``loggingOptions``: Callback functionalities.
- ``rateLimitOptions``: Configure load balancers, retry logic, timeouts and more.

## Basic credentials

This part is dependent on the underlying blockchain.

### BTC and BTC-like chains

- ``url``: string = ""
- ``username``: string = ""
- ``password``: string = ""

Example:

``` javascript
const connectConfig = {
   url:'https://myAwesomeBtcNode.com/',
   username: 'user',
   password: 'pass',
}
```

### Ripple

- ``url``: string = "
- ``username?``: string
- ``password?``: string

Example:

```javascript
const connectConfig = {
   url:'https://myAwesomeXrpNode.com/',
}
```

### Algorand

- ``algod`` = new AlgoNodeApp()
- ``indexer`` = new AlgoNodeApp()

Where ``AlgoNodeApp`` is an object containing:

- ``url``: string = "";
- ``token``: string = "";

Example:

``` javascript
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

With this object one can configure:

- ``maxRequests``: number
- ``perMilliseconds``: number
- ``@optional``() maxRPS?: number
- ``@optional``() timeoutMs?: number
- ``retries``: number
- ``onSend``: (inProcessing?: number, inQueue?: number, reqsPs?: number, retiresPs?: number) => void
- ``onResponse``: (inProcessing?: number, inQueue?: number, reqsPs?: number, retiresPs?: number) => void
- ``onPush``: (inProcessing?: number, inQueue?: number, reqsPs?: number, retiresPs?: number) => void
- ``onQueueEmpty``: (inProcessing?: number, inQueue?: number, reqsPs?: number, retiresPs?: number) => void
- ``onLimitReached``: (inProcessing?: number, inQueue?: number, reqsPs?: number, retiresPs?: number) => void
- ``onRpsSample``: (inProcessing?: number, inQueue?: number, reqsPs?: number, retiresPs?: number) => void
- ``onRetry``: (retryCount?: number) => void

Default values:

``` javascript
{
   maxRequests = 1;
   perMilliseconds = 1;
   maxRPS = 10;
   timeoutMs = 3000;
   retries = 10;
   onSend = undefined;
   onResponse = undefined;
   onPush = undefined;
   onQueueEmpty = undefined;
   onLimitReached = undefined;
   onRpsSample = undefined;
   onRetry = undefined;
}
```

## Logging callbacks

- ``mode``: "off" | "production" | "develop"
- ``loggingCallback``: (message: string) => void
- ``warningCallback``: (message: string) => void
- ``exceptionCallback``: (error: any, message: string) => void

Default values:

``` javascript
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

[Back to home](README.md)
