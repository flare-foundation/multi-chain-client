export class StackTraceCall {
   method: string = "";
   source: string = "";
   line: number = -1;
   column: number = 0;

   constructor(stackTrace: string) {
      if (stackTrace.indexOf("(") > 0) {
         const traceLine = /\s*at ([^(]*)\(([^\:]*)\:(\d+)\:(\d+)\)/.exec(stackTrace);
         if (traceLine && traceLine.length === 5) {
            this.method = traceLine[1].trim();
            this.source = traceLine[2].trim();
            this.line = parseInt(traceLine[3]);
            this.column = parseInt(traceLine[4]);
         }
      } else {
         const traceLine = /\s*at ([^\:]*)\:(\d+)\:(\d+)/.exec(stackTrace);
         if (traceLine && traceLine.length === 4) {
            this.method = "";
            this.source = traceLine[1].trim();
            this.line = parseInt(traceLine[2]);
            this.column = parseInt(traceLine[3]);
         }
      }
   }

   get isValid() {
      return this.line >= 0;
   }
}

export class StackTrace {
   stackTrace: StackTraceCall[] = [];

   constructor() {
      const stack = Error().stack!;

      const trace = stack.split("\n");

      this.stackTrace = [];

      for (let traceLine of trace) {
         const trace = new StackTraceCall(traceLine);
         if (trace.isValid) {
            this.stackTrace.push(trace);
         }
      }
   }

   get stack(): string {
      let trace = "";

      for (let call of this.stackTrace) {
         if (call.method != "") {
            trace += `${call.method}\n`;
         }
      }

      return trace;
   }

   find(method: string, functionOffset = 0): StackTraceCall | undefined {
      for (let i = 0; i < this.stackTrace.length; i++) {
         if (this.stackTrace[i].method === method) {
            if (i + functionOffset >= 0 && i + functionOffset < this.stackTrace.length) {
               return this.stackTrace[i + functionOffset];
            }
         }
      }
      return undefined;
   }
}
