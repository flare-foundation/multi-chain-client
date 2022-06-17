import { mccError, mccOutsideError, MCC_ERROR } from "./errors";
import { mccJsonStringify } from "./utils";

export enum TraceMethodType {
   Descriptor,
   Getter,
   Setter,
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

export class TraceStack {
   method: TraceMethod;
   args: any[];
   ret: any = null;
   callIndex: number;

   // timing
   completed: boolean = false;
   startTime = 0;
   endTime = 0;

   error: Error | undefined;

   // stack
   stack: string = "";
   level: number = 0;

   constructor(method: TraceMethod, args: any[]) {
      this.method = method;
      this.method.calls++;
      this.callIndex = method.calls;
      this.args = args;

   }

   get systemTime(): number {
      return new Date().getTime();
   }

   get traceTime() : number {
      return this.endTime - this.startTime;
   }

   start() {
      this.startTime = this.systemTime;


      // get source line
      // todo: not working properly because of Stub (trace line offset 7 is not correct - it changes)
      this.stack = Error().stack!;

      const trace = this.stack.split("\n");
      if (trace.length > 7) {
         const traceSourceInfo = trace[7];

         if (traceSourceInfo.indexOf("(") > 0) {
            const traceLine = /[^(]*\(([^)]*)\)/.exec(traceSourceInfo);
            if (traceLine && traceLine.length > 1) {
               this.method.source = traceLine[1];
            }
         }
         else {
            const traceLine = /[^\/]*(.*)/.exec(traceSourceInfo);
            if (traceLine && traceLine.length > 1) {
               this.method.source = traceLine[1];
            }
         }
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
      return this.args.map((val) => `${val}`).join(",");
   }

   verbose(obj: any, verbose: boolean=true, maxlength=32): string {
      let text = "";

      if( typeof obj==="string") {
         text = obj;
      }
      else {
         text=mccJsonStringify( obj );
      }

      if( verbose ) return text;

      if( text.length <= maxlength ) return text;

      const halve = maxlength / 2 - 2;

      return text.substring(0,halve) + "..." + text.substring(text.length-halve);
   }

   toString(showIndent = false, showSource = true, showTiming = false, showVerbose=true): string {
      // todo: error
      // todo: display objects (json!)

      const args = this.verbose( this.argsToString , showVerbose );

      var status = "";

      if (this.completed) {
         if (this.error) {
            status = "‼";
         }
         else {
            status = "◼";
         }
      }
      else {
         status = "▶";
      }

      const source = showSource ? `[${this.method.source}] ` : ``;

      const indent = "".padEnd(showIndent ? this.level * 2 : 0);

      const timing = showTiming ? `${this.traceTime}ms ` : ``;

      if (this.ret) {
         return `${status} ${indent}${this.method.className}.${this.method.methodName}(${args})=${this.verbose(this.ret,showVerbose)} ${source}${timing}`;
      }
      else {
         return `${status} ${indent}${this.method.className}.${this.method.methodName}(${args}) ${source}${timing}`;
      }
   }

   toShortString(showVerbose=false): string {
      const args = this.verbose( this.argsToString , showVerbose );

      if (this.ret) {
         return `${this.method.className}.${this.method.methodName}(${args})=${this.verbose(this.ret,showVerbose)}`;
      }
      else {
         return `${this.method.className}.${this.method.methodName}(${args})`;
      }
   }
}

export class TraceManager {
   displayTrace = false;

   methods: TraceMethod[];

   stack: TraceStack[];

   trace: TraceStack[];

   constructor() {
      this.methods = [];
      this.stack = [];
      this.trace = [];
   }

   createMethod(className: string, methodName: string, methodType: TraceMethodType): TraceMethod {
      let method = this.methods.find(x => x.className == className && x.methodName == methodName);

      if (method) return method;

      method = new TraceMethod(className, methodName, methodType);

      this.methods.push(method);

      return method;
   }

   start(className: string, methodName: string, args: any[], methodType: TraceMethodType): TraceStack {
      const method = this.createMethod(className, methodName, methodType);
      const trace = new TraceStack(method, args);

      // add methods called
      const top = this.stack[this.stack.length - 1];
      if (top) {
         if (!top.method.methodsCalled.find(x => x.className == className && x.methodName == methodName)) {
            top.method.methodsCalled.push(method);
         }
      }

      trace.start();

      trace.level = this.stack.length;

      this.stack.push(trace);
      this.trace.push(trace);

      if (this.displayTrace) {
         console.log(`trace| ${trace.toString(true,false,false)}`);
      }

      return trace;
   }

   complete(ret: any) {

      const last = this.stack.pop();

      if( !last ) return;

      last.complete(ret);

      // update inner time
      const top = this.stack[this.stack.length - 1];
      if (top) {
         top.method.innerTime+=last.traceTime;
      }

   }

   completeError(error: Error) {
      this.stack.pop()?.completeException(error);
   }

   displayError(error: any) {
      console.log(`EXCEPTION name='${error.name}' message='${error.message}'`);
      if (error.name === `mccError` && error.message === `OutsideError`) {
         const innerError = (error as mccError).innerError as Error;
         if (innerError) {
            console.log(`INNER EXCEPTION name='${innerError.name}' message='${innerError.message}'`);
         }
      }
      console.log(`NODE STACK ${error.stack}`)
      this.showStack();
      this.showTrace(true, false, true, false);
   }

   showStack() {
      console.log("TRACE STACK");
      for (let trace of this.stack) {
         console.log(trace.toString());
      }
   }

   showTrace(indent = false, source = true, timing = false, verbose=false) {
      console.log("TRACE");
      for (let trace of this.trace) {
         console.log(trace.toString(indent, source, timing, verbose));
      }
   }

   showMethods(indent = false, source = true, timing = false) {
      console.log("METHODS");
      for (let method of this.methods) {

         const exclusiveTime = Math.max(0, method.inclusiveTime - method.innerTime);

         console.log(`◼ ${method.className}.${method.methodName}  ${method.calls} ${method.inclusiveTime}ms ${exclusiveTime}ms`);

         for (let inner of method.methodsCalled) {
            console.log(`    ${inner.className}.${inner.methodName}`);
         }
      }
   }

   clearTrace() {
      this.trace = [];
   }

   get firstTrace(): string {
      if (this.trace.length === 0) return "";

      return this.trace[0].toShortString();
   }

   get lastTrace(): string {
      if (this.trace.length === 0) return "";

      return this.trace[this.trace.length - 1].toShortString();
   }

}

export const traceManager = new TraceManager();


function Stub(target: any, name: string, funct: any, cx: any, args: any[], methodType: TraceMethodType) {
   traceManager.start(target.name, name!, args, methodType);

   try {
      let res = methodType === TraceMethodType.Getter ? funct.apply(cx) : funct.apply(cx, args);

      if (!isPromise(res)) {
         traceManager.complete(res)
         return res;
      }
      return new Promise((resolve, reject) => {
         res.then((result: any) => {
            traceManager.complete(result);

            resolve(result);
         }).catch((error: any) => {

            if (error?.name === MCC_ERROR) {
               traceManager.displayError(error);
               traceManager.completeError(error);
               reject(error);
            }
            else {
               const newError = new mccOutsideError(error);
               traceManager.displayError(newError);
               traceManager.completeError(newError);
               reject(newError);
            }
         });
      })
   } catch (error: any) {
      if (error?.name === MCC_ERROR) {
         traceManager.displayError(error);
         traceManager.completeError(error);
         throw error;
      }
      else {
         const newError = new mccOutsideError(error);
         traceManager.displayError(newError);
         traceManager.completeError(newError);
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




export function RegisterTraceValue(target: any, name?: string, descriptor?: any) {
   //  decorating a method
   if (descriptor && descriptor.value) {
      let original = descriptor.value;

      descriptor.value = function (...args: any[]) {
         return Stub(target, name!, original, this, args, TraceMethodType.Descriptor);
      };

      return descriptor;
   }

   return null;
}

export function RegisterTraceGetter(target: any, name?: string, descriptor?: any) {
   if (descriptor && descriptor.get) {
      let original = descriptor.get;

      descriptor.get = function () {
         return Stub(target, name!, original, this, [], TraceMethodType.Getter);
      };

      return descriptor;
   }
   return null;
}

export function RegisterTraceSetter(target: any, name?: string, descriptor?: any) {
   if (descriptor && descriptor.set) {
      let original = descriptor.set;

      descriptor.set = function (...args: any[]) {
         return Stub(target, name!, original, this, args, TraceMethodType.Setter);
      };

      return descriptor;
   }
   return null;
}


export function RegisterTraceClass(targetClass: any) {
   // decorating a class

   // add tracing capability to all own methods (doesn't work for constructor)
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
         return Stub(targetClass, methodName, original, this, args, TraceMethodType.Function);
      };
   });

   return targetClass;
}

export function round(x: number, decimal: number = 0) {
   if (decimal === 0) return Math.round(x);

   const dec10 = 10 ** decimal;

   return Math.round(x * dec10) / dec10;
}

