import { mccOutsideError, MCC_ERROR } from "./errors";

export enum TraceMethodType {
   Descriptor,
   Getter,
   Function,
}

export class TraceMethod {
   className: string = "";
   methodName: string = "";
   methodType: TraceMethodType;
   source: string = "";

   calls: number = 0;
   allInclusiveTime: number = 0;

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
      this.callIndex = method.calls;
      this.method.calls++;
      this.args = args;

   }

   start() {
      // todo: timing
      this.startTime = 0;

      this.stack = Error().stack!;

      const trace = this.stack.split("\n");
      if (trace.length > 4) {

         const traceLine = /[^(]*\(([^)]*)\)/.exec(trace[4]);

         if (traceLine && traceLine.length > 1) {
            this.method.source = traceLine[1];
         }
      }
   }

   complete(ret: any) {
      // todo: timing
      this.endTime = 0;

      this.method.allInclusiveTime += this.endTime - this.startTime;

      this.completed = true;
      this.ret = ret;
   }

   completeException(error: Error) {
      this.complete(undefined);
      this.error = error;
   }

   toString(): string {
      // todo: args are not properly displayed
      // todo: not completed
      // todo: error
      if (this.ret) {
         return `${this.method.className}.${this.method.methodName}(${this.args.map((val) => "%s").join(", ")})=${this.ret} [${this.method.source}]`;
      }
      else {
         return `${this.method.className}.${this.method.methodName}(${this.args.map((val) => "%s").join(", ")}) [${this.method.source}]`;
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

      trace.start();

      trace.level = this.stack.length;

      this.stack.push(trace);
      this.trace.push(trace);

      if (this.displayTrace) {
         console.log(`trace: ${trace.toString()}`);
      }

      return trace;
   }

   complete(ret: any) {
      this.stack.pop()?.complete(ret);
   }

   completeError(error: Error) {
      this.stack.pop()?.completeException(error);
   }

   displayError(error: any) {
      console.log("STACK");

      this.showStack();
   }

   showStack() {
      for (let trace of this.stack) {
         console.log(trace.toString());
      }
   }

   showTrace() {
      for (let trace of this.trace) {
         console.log(trace.toString());
      }
   }

}

export const traceManager = new TraceManager();

function TraceStub(target: any, name: string, funct: any, cx: any, args: any[], methodType: TraceMethodType) {
   traceManager.start(target.constructor.name, name!, ["get"], methodType);

   // try {
   //    let ret = cx ? funct.apply( cx , args ) : funct(); 
   //    if (typeof ret.then === "function") {
   //       ret.then(() => traceManager.complete(ret));
   //    } else {
   //       traceManager.complete(ret);
   //    }

   //    return ret;
   // }
   // catch (error) {
   //    traceManager.catch(error);
   // }

   try {
      let res = cx ? funct.apply(cx, args) : funct();

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
               traceManager.completeError(error);
               traceManager.displayError(error);
               reject(error);
            }
            else {
               const newError = new mccOutsideError(error);
               traceManager.completeError(newError);
               traceManager.displayError(newError);
               reject(newError);
            }
         });
      })
   } catch (error: any) {
      if (error?.name === MCC_ERROR) {
         traceManager.completeError(error);
         traceManager.displayError(error);
         throw error;
      }
      else {
         const newError = new mccOutsideError(error);
         traceManager.completeError(newError);
         traceManager.displayError(newError);
         throw new mccOutsideError(newError);
      }
   }

}





function RegisterTraceValue(target: any, name?: string, descriptor?: any) {
   //  decorating a method
   if (descriptor && descriptor.value) {
      let original = descriptor.value;

      descriptor.value = function (...args: any[]) {
         TraceStub(target.constructor.name, name!, original, this, args, TraceMethodType.Descriptor);
      };

      return descriptor;
   }

   return null;
}

export function isPromise(p: any) {
   if (typeof p === 'object' && typeof p.then === 'function') {
      return true;
   }
   return false;
}

function RegisterTraceGetter(target: any, name?: string, descriptor?: any) {

   if (descriptor && descriptor.get) {
      let original = descriptor.get;

      descriptor.get = function () {
         TraceStub(target.constructor.name, name!, original, null, [], TraceMethodType.Getter);
      };

      return descriptor;
   }

   return null;

}

function RegisterTraceClass(targetClass: any) {
   // decorating a class

   // add tracing capability to all own methods (doesn't work for constructor)
   Object.getOwnPropertyNames(targetClass.prototype).forEach((methodName: string) => {

      const desc = Object.getOwnPropertyDescriptor(targetClass.prototype, methodName);

      // getter
      if (desc?.get) {
         const newDesc = RegisterTraceGetter(targetClass, methodName, desc);

         Object.defineProperty(targetClass, methodName, desc);


         const desc2 = Object.getOwnPropertyDescriptor(targetClass.prototype, methodName);



         //Object.defineProperty = desc;

         return newDesc;
      }

      let original = targetClass.prototype[methodName];

      // constructor
      if (methodName === "constructor") {
         return RegisterTraceValue(targetClass, methodName, desc);
      }

      // skip non functions
      if (typeof original !== "function") {
         return;
      }

      // an arrow function can't be used while we have to preserve right 'this'
      targetClass.prototype[methodName] = function (...args: any[]) {
         TraceStub(targetClass.constructor.name, methodName, original, this, args, TraceMethodType.Function);
      };
   });

   return targetClass;
}


export function Trace() {

   return (target: any, name?: string, descriptor?: any) => {

      let trace = RegisterTraceValue(target, name, descriptor);
      if (trace) return trace;

      trace = RegisterTraceGetter(target, name, descriptor);
      if (trace) return trace;

      return RegisterTraceClass(target);
   };
}
