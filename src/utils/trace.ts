export function Trace() {
   var printArgs = (className: string, methodName: string, args: any[]) => {
      console.log("=> %s.%s(" + args.map((val) => "%s").join(", ") + ")", className, methodName, ...args);

      // console.log( Error().stack );

      // try {
      //     throw new Error("");
      // } catch(e) {
      //     console.log( (e as Error).stack );
      // }
   };

   return (target: any, name?: string, descriptor?: any) => {
      if (descriptor) {
         // decorating a method
         if (descriptor.value) {
            let original = descriptor.value;

            descriptor.value = function (...args: any[]) {
               printArgs(target.constructor.name, name!, args);
               let ret = original.apply(this, args);
               if (typeof ret.then === "function") {
                  ret.then(() => console.log("<= %s.%s: %s", target.constructor.name, name, ret));
               } else {
                  console.log("<= %s.%s: %s", target.constructor.name, name, ret);
               }

               return ret;
            };

            return descriptor;
         } else if (descriptor.get){
            let original = descriptor.get;

            descriptor.get = function () {
               printArgs(target.constructor.name, name!, ["get"]);
               let ret = original();
               if (typeof ret.then === "function") {
                  ret.then(() => console.log("<= %s.%s: %s", target.constructor.name, name, ret));
               } else {
                  console.log("<= %s.%s: %s", target.constructor.name, name, ret);
               }

               return ret;
            };

            return descriptor;
         }
      } else {
         // decorating a class

         // add tracing capability to all own methods
         // TO-DO doesn't work for constructor...

         Object.getOwnPropertyNames(target.prototype).forEach((methodName: string) => {
            let original = target.prototype[methodName];

            if (typeof original !== "function" || methodName === "constructor") {
               return;
            }

            // an arrow function can't be used while we have to preserve right 'this'
            target.prototype[methodName] = function (...args: any[]) {
               printArgs(target.name, methodName, args);
               let ret = original.apply(this, args);
               if (typeof ret.then === "function") {
                  ret.then(() => console.log("<= %s.%s: %s", target.name, methodName, ret));
               } else {
                  console.log("<= %s.%s: %s", target.name, methodName, ret);
               }

               return ret;
            };
         });

         return target;
      }
   };
}
