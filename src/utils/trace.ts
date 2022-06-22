import { createHook, executionAsyncId, triggerAsyncId } from "async_hooks";
import { mccError, mccOutsideError, MCC_ERROR } from "./errors";
import { StackTrace } from "./strackTrace";
import { mccJsonStringify } from "./utils";
const async_hooks = require('async_hooks')

// forces PromiseHooks to be enabled.
createHook({ init() {} }).enable();

//let traceMap = new Map();


async_hooks.createHook({
   init(asyncId: any, type: any, triggerAsyncId: any) {
      //TraceManager.async_promise_map.set( asyncId , `init ${type} tid=${triggerAsyncId}` );
      TraceManager.async_promise_map.set( asyncId , triggerAsyncId );
   },
   before(asyncId: any) {
      //TraceManager.async_promise_map.set( asyncId , "before" );
   },
   after(asyncId: any) {
      //TraceManager.async_promise_map.set( asyncId , "after" );
   },
   destroy(asyncId: any) {
      //TraceManager.async_promise_map.set( asyncId , "destroy" );
   },

}).enable();






export enum TraceMethodType {
   ClassGetter,
   ClassSetter,
   ClassMethod,
   Function,
}

export class TraceMethod {
   className: string = "";
   methodName: string = "";
   methodType: TraceMethodType;
   source: string = "";

   calls: number = 0;
   inclusiveTime: number = 0;
   innerTime: number = 0;

   methodsCalled: TraceMethod[] = [];

   constructor(className: string, methodName: string, methodType: TraceMethodType) {
      this.className = className;
      this.methodName = methodName;
      this.calls = 0;
      this.methodType = methodType;
   }

}

export class TraceCall {
   method: TraceMethod;
   async: TraceAsync;
   args: any[];
   ret: any = null;
   callIndex: number;
   isAsync: boolean;
   isAwait: boolean;

   // timing
   completed: boolean = false;
   startTime = 0;
   endTime = 0;

   error: Error | undefined;

   // stack
   stack: string = "";
   level: number = 0;

   constructor(async: TraceAsync, method: TraceMethod, args: any[], isAsync: boolean, isAwait: boolean) {
      this.async = async;
      this.method = method;
      this.method.calls++;
      this.callIndex = method.calls;
      this.args = args;
      this.isAsync = isAsync;
      this.isAwait = isAwait;
   }

   get systemTime(): number {
      return new Date().getTime();
   }

   get traceTime(): number {
      return this.endTime - this.startTime;
   }

   start() {
      this.startTime = this.systemTime;

      // get source line
      // todo: not working properly because of Stub (trace line offset 7 is not correct - it changes)

      const stack = new StackTrace();

      if (stack.stackTrace.length > 7) {
         const traceSourceInfo = stack.stackTrace[7];
         this.method.source = traceSourceInfo.source;
      }
   }

   complete(ret: any) {
      this.endTime = this.systemTime;

      this.method.inclusiveTime += this.traceTime;

      this.completed = true;
      this.ret = ret;
   }

   completeException(error: Error) {
      this.complete(undefined);
      this.error = error;
   }

   get argsToString(): string {
      return this.args.map((val) => this.stringifyObject(val)).join(",");
   }

   stringifyObject(obj: any): string {
      let text = "";

      if (typeof obj === "string") {
         text = obj;
      }
      else {
         try {
            text = mccJsonStringify(obj);
         }
         catch {
            text = "error stringifying object";
         }
      }

      return text;
   }

   verbose(obj: any, verbose: boolean = true, maxlength = 32): string {
      let text = this.stringifyObject(obj);

      if (verbose) return text;

      if (text.length <= maxlength) return text;

      const halve = maxlength / 2 - 2;

      return text.substring(0, halve) + "..." + text.substring(text.length - halve);
   }

   toString(showIndent = false, showSource = true, showTiming = false, showVerbose = true): string {
      // todo: show if method is in error

      const args = this.verbose(this.argsToString, showVerbose);

      var status = " ";

      if (this.isAsync) {
         if (this.isAwait) {
            status = "▼"; // await
         }
         else {
            status = "▲"; // new async
         }
      }


      if (this.completed) {
         if (this.error) {
            status += "‼";
         }
         else {
            status += "◼";
         }
      }
      else {
         status += "▶";
      }

      const source = showSource ? `[${this.method.source}] ` : ``;

      const indent = "".padEnd(showIndent ? this.level * 2 : 0);

      const timing = showTiming ? (this.completed ? `${this.traceTime}ms ` : `not completed `) : ``;

      if (this.ret) {
         return `${status} ${indent}${this.method.className}.${this.method.methodName}(${args})=${this.verbose(this.ret, showVerbose)} ${source}${timing}`;
      }
      else {
         return `${status} ${indent}${this.method.className}.${this.method.methodName}(${args}) ${source}${timing}`;
      }
   }

   toShortString(showVerbose = false): string {
      const args = this.verbose(this.argsToString, showVerbose);

      if (this.ret) {
         return `${this.method.className}.${this.method.methodName}(${args})=${this.verbose(this.ret, showVerbose)}`;
      }
      else {
         return `${this.method.className}.${this.method.methodName}(${args})`;
      }
   }
}

export class TraceAsync {
   id: number;
   eid: number;
   tid: number;
   stack: TraceCall[] = [];
   trace: TraceCall[] = [];

   constructor(id: number) {
      this.id = id;
      this.eid = executionAsyncId();
      this.tid = triggerAsyncId();
   }
}

export class TraceManager {
   public static enabled = true;

   public displayRuntimeTrace = false;
   public displayStateOnException = true;

   public onException = function(error: Error):void{};

   private methods: TraceMethod[];

   private asyncs: TraceAsync[];

   private nextAsyncId = 0;

   static async_promise_map = new Map<number,number>();

   constructor() {
      this.methods = [];
      this.asyncs = [];
   }

   createMethod(className: string, methodName: string, methodType: TraceMethodType): TraceMethod {
      let method = this.methods.find(x => x.className == className && x.methodName == methodName);

      if (method) return method;

      method = new TraceMethod(className, methodName, methodType);

      this.methods.push(method);

      return method;
   }

   createAsync(await: boolean) {
      if( await ) {
         const async = new TraceAsync(this.nextAsyncId++);
         this.asyncs.push(async);

         return async;
      }

      // find parent
      const tid = triggerAsyncId();

      const parents:number[]=[];
      for(let i=tid; i; i=TraceManager.async_promise_map.get(i)!) {
         parents.push( i );
      }

      let async = this.asyncs.reverse().find(x => parents.find(y=>y===x.tid)!=null);

      if (async) return async;

      async = new TraceAsync(this.nextAsyncId++);
      this.asyncs.push(async);

      return async;
   }

   start(className: string, methodName: string, args: any[], methodType: TraceMethodType, isAsync: boolean, isAwait: boolean): TraceCall | undefined {
      const method = this.createMethod(className, methodName, methodType);
      //const tid = triggerAsyncId();
      const eid = executionAsyncId();
      const async = this.createAsync(isAsync && !isAwait );

      const trace = new TraceCall(async, method, args, isAsync, isAwait);

      // add methods called
      const top = trace.async.stack[trace.async.stack.length - 1];
      if (top) {
         if (!top.method.methodsCalled.find(x => x.className == className && x.methodName == methodName)) {
            top.method.methodsCalled.push(method);
         }
      }

      trace.start();

      trace.level = trace.async.stack.length;

      trace.async.stack.push(trace);
      trace.async.trace.push(trace);

      if (this.displayRuntimeTrace) {
         console.log(`trace|${trace.async.id}|${eid}| ${trace.toString(true, false, false, false)}`);
      }

      return trace;
   }

   complete(trace: TraceCall | undefined, ret: any) {
      if (!trace) return;

      const last = trace.async.stack.pop();

      //const async_hooks = require('async_hooks')
      //const asyncId = async_hooks.executionAsyncId();
      //trace.async.asyncId = asyncId;

      // if (this.displayRuntimeTrace) {
      //    console.log(`trace|${trace.async.id}| completed`);
      // }

      if (!last) return;

      last.complete(ret);

      // update inner time
      const top = trace.async.stack[trace.async.stack.length - 1];
      if (top) {
         top.method.innerTime += last.traceTime;
      }

   }

   getAsync(id: number): TraceAsync | undefined {
      return this.asyncs.find( x=>x.id===id);
   }

   completeError(trace: TraceCall | undefined, error: Error) {
      if (!trace) return;

      trace.async.stack.pop()?.completeException(error);
   }

   showException(error: any) {

      // todo: user exception callback
      //this.onException?(error);

      if (!this.displayStateOnException) return;

      console.log(`EXCEPTION name='${error.name}' message='${error.message}'`);
      if (error.name === `mccError` && error.message === `OutsideError`) {
         const innerError = (error as mccError).innerError as Error;
         if (innerError) {
            console.log(`INNER EXCEPTION name='${innerError.name}' message='${innerError.message}'`);
         }
      }

      this.showState();
   }

   showState(stack: any = undefined) {
      if (stack) {
         console.log(`NODE STACK ${stack.stack}`)
      }

      this.showStack();
      this.showTrace(true, false, true, false);
   }

   showStack() {
      for (let async of this.asyncs) {
         console.log(`\nTRACE ASYNC STACK ${async.id} #${async.eid}`);
         for (let trace of async.stack) {
            console.log(trace.toString());
         }
      }
   }

   showTrace(indent = false, source = true, timing = false, verbose = false) {
      for (let async of this.asyncs) {
         console.log(`\nTRACE ASYNC ${async.id} #${async.eid}`);
         for (let trace of async.trace) {
            console.log(trace.toString(indent, source, timing, verbose));
         }
      }
   }

   showMethods(indent = false, source = true, timing = false) {
      console.log("\nMETHODS");
      for (let method of this.methods) {

         const exclusiveTime = Math.max(0, method.inclusiveTime - method.innerTime);

         console.log(`◼ ${method.className}.${method.methodName}  ${method.calls} ${method.inclusiveTime}ms ${exclusiveTime}ms`);

         for (let inner of method.methodsCalled) {
            console.log(`    ${inner.className}.${inner.methodName}`);
         }
      }
   }


   get main(): TraceAsync | undefined {
      if (this.asyncs.length === 0) {
         return undefined;
      }

      return this.asyncs[0];
   }

   clearTrace() {
      this.asyncs=[];
      // for (let async of this.asyncs) {
      //    async.trace = [];
      // }
   }

   get firstTrace(): string {
      if (this.main!.trace.length === 0) return "";

      return this.main!.trace[0].toShortString();
   }

   get lastTrace(): string {
      if (this.main!.trace.length === 0) return "";

      return this.main!.trace[this.main!.trace.length - 1].toShortString();
   }

}

export const traceManager = new TraceManager();

const awaitSourceMap = new Map<string, boolean>();

function Stub(className: string, name: string, funct: any, cx: any, args: any[], methodType: TraceMethodType) {
   const isAsync = funct.constructor.name === "AsyncFunction";
   let isAwait = false;

   if (TraceManager.enabled) {
      const stack = new StackTrace();

      const stackTrace = stack.find("Stub", +2);

      if (stackTrace) {
         // check if cache exists
         const mapKey = `${stackTrace.source}:${stackTrace.line}`;
         // cache
         const cached = awaitSourceMap.get(mapKey);

         if (cached) {
            isAwait = cached;
         }
         else {
            // check if that source file has 'await'
            const fs = require("fs");
            const data = fs.readFileSync(stackTrace.source).toString();
            const lines = data.split("\n");

            if (lines && lines.length > stackTrace.line - 1) {
               isAwait = lines[stackTrace.line - 1].indexOf(`await `) >= 0;
            }

            // cache
            awaitSourceMap.set(mapKey, isAwait);
         }
      }
   }

   const trace = TraceManager.enabled ? traceManager.start(className, name!, args, methodType, isAsync, isAwait) : undefined;

   try {
      let res = methodType === TraceMethodType.ClassGetter ? funct.apply(cx) : funct.apply(cx, args);

      if (!isPromise(res)) {
         traceManager.complete(trace, res)
         return res;
      }
      return new Promise((resolve, reject) => {
         res.then((result: any) => {
            traceManager.complete(trace, result);

            resolve(result);
         }).catch((error: any) => {

            if (error?.name === MCC_ERROR) {
               traceManager.showException(error);
               traceManager.completeError(trace, error);
               reject(error);
            }
            else {
               const newError = new mccOutsideError(error);
               traceManager.showException(newError);
               traceManager.completeError(trace, newError);
               reject(newError);
            }
         });
      })
   } catch (error: any) {
      if (error?.name === MCC_ERROR) {
         traceManager.showException(error);
         traceManager.completeError(trace, error);
         throw error;
      }
      else {
         const newError = new mccOutsideError(error);
         traceManager.showException(newError);
         traceManager.completeError(trace, newError);
         throw new mccOutsideError(newError);
      }
   }

}

export function isPromise(p: any) {
   if (typeof p === 'object' && typeof p.then === 'function') {
      return true;
   }
   return false;
}




// export function RegisterTraceValue(target: any, name?: string, descriptor?: any) {
//    //  decorating a method
//    if (descriptor && descriptor.value) {
//       let original = descriptor.value;

//       descriptor.value = function (...args: any[]) {
//          return Stub(target, name!, original, this, args, TraceMethodType.Descriptor);
//       };

//       return descriptor;
//    }

//    return null;
// }

export function RegisterTraceGetter(target: any, name?: string, descriptor?: any) {
   if (descriptor && descriptor.get) {
      let original = descriptor.get;

      descriptor.get = function () {
         return Stub(target.name, name!, original, this, [], TraceMethodType.ClassGetter);
      };

      return descriptor;
   }
   return null;
}

export function RegisterTraceSetter(target: any, name?: string, descriptor?: any) {
   if (descriptor && descriptor.set) {
      let original = descriptor.set;

      descriptor.set = function (...args: any[]) {
         return Stub(target.name, name!, original, this, args, TraceMethodType.ClassSetter);
      };

      return descriptor;
   }
   return null;
}


export function RegisterTraceClass(targetClass: any) {
   // add tracing capability to all own methods, setters and getters
   Object.getOwnPropertyNames(targetClass.prototype).forEach((methodName: string) => {

      const desc = Object.getOwnPropertyDescriptor(targetClass.prototype, methodName);

      // getter
      if (desc?.get) {
         RegisterTraceGetter(targetClass, methodName, desc);
         Object.defineProperty(targetClass.prototype, methodName, desc);
         return;
      }

      // setter
      if (desc?.set) {
         RegisterTraceSetter(targetClass, methodName, desc);
         Object.defineProperty(targetClass.prototype, methodName, desc);
         return;
      }

      let original = targetClass.prototype[methodName];

      // constructor
      if (methodName === "constructor") {
         // todo: sort out constructor managed wrapping (next lines are commented because they ruin constructor)

         // RegisterTraceValue(targetClass, methodName, desc);
         // Object.defineProperty(targetClass.prototype, methodName, desc!);
         return;
      }

      // skip non functions
      if (typeof original !== "function") {
         return;
      }

      // an arrow function can't be used while we have to preserve right 'this'
      targetClass.prototype[methodName] = function (...args: any[]) {
         return Stub(targetClass.name, methodName, original, this, args, TraceMethodType.ClassMethod);
      };
   });

   return targetClass;
}

export function traceFunction(funct: any, ...args: any[]) {
   return Stub("", funct.name, funct, null, args, TraceMethodType.Function);
}

export function round(x: number, decimal: number = 0) {
   if (decimal === 0) return Math.round(x);

   const dec10 = 10 ** decimal;

   return Math.round(x * dec10) / dec10;
}

