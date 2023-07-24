export declare class Workspace<Scripts extends string, Params extends {
    [key in Scripts]: {
        params: any;
        result: any;
    };
}> {
    readonly directory: string;
    constructor(directory: string);
    getPath(script: string): string;
}
export type WorkspaceScript<W extends Workspace<any, any>> = W extends Workspace<infer S, any> ? S : never;
export type WorkspaceParams<W extends Workspace<any, any>, Script extends WorkspaceScript<W>> = W extends Workspace<any, infer T> ? T[Script]["params"] : never;
export type WorkspaceResult<W extends Workspace<any, any>, Script extends WorkspaceScript<W>> = W extends Workspace<any, infer T> ? T[Script]["result"] : never;
//# sourceMappingURL=Workspace.d.ts.map