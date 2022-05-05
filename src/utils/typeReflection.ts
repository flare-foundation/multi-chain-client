const PROPERTY_METADATA_KEY = Symbol("keyOptional");

export function optional(): PropertyDecorator {
   return (target: object, propertyKey: string | symbol) => {
      const allMetadata = Reflect.get(target, PROPERTY_METADATA_KEY) || {};

      allMetadata[propertyKey] = allMetadata[propertyKey] || {};

      Reflect.set(target, PROPERTY_METADATA_KEY, allMetadata);
   };
}

export function getOptionalKeys(object: any) {
   try {
      return Reflect.get(object, PROPERTY_METADATA_KEY);
   } catch {}
   return undefined;
}
