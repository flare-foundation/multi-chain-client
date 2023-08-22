// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type INodeStatus = NodeStatusBase<any>;

export abstract class NodeStatusBase<S> {
    data: S;

    constructor(data: S) {
        this.data = data;
    }

    public abstract get version(): string;
    public abstract get state(): string;

    public abstract get isHealthy(): boolean;
    public abstract get isSynced(): boolean;
}
