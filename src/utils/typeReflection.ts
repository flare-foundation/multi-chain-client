const PROPERTY_METADATA_KEY = Symbol("keyOptional");

export function optional(): PropertyDecorator {
    return (target: object, propertyKey: string | symbol) => {
        const allMetadata = Reflect.get(target, PROPERTY_METADATA_KEY) || {};

        allMetadata[propertyKey] = allMetadata[propertyKey] || {};

        Reflect.set(target, PROPERTY_METADATA_KEY, allMetadata);
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getOptionalKeys(object: any) {
    try {
        return Reflect.get(object, PROPERTY_METADATA_KEY);
    } catch {
        return undefined;
    }
    return undefined;
}
