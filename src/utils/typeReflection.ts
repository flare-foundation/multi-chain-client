const PROPERTY_METADATA_KEY = Symbol("keyOptional");

export function optional(): PropertyDecorator {
    return (target: object, propertyKey: string | symbol) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const allMetadata = Reflect.get(target, PROPERTY_METADATA_KEY) || {};

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        allMetadata[propertyKey] = allMetadata[propertyKey] || {};

        Reflect.set(target, PROPERTY_METADATA_KEY, allMetadata);
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getOptionalKeys(object: any) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return Reflect.get(object, PROPERTY_METADATA_KEY);
    } catch {
        return undefined;
    }
    return undefined;
}
