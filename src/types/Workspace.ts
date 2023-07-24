import path from "path";

export class Workspace<
  Scripts extends string,
  Params extends {
    [key in Scripts]: {
      params: any;
      result: any;
    };
  }
> {
  constructor(public readonly directory: string) {}

  public getPath(script: string) {
    return path.join(this.directory, script);
  }
}

export type WorkspaceScript<W extends Workspace<any, any>> =
  W extends Workspace<infer S, any> ? S : never;

export type WorkspaceParams<
  W extends Workspace<any, any>,
  Script extends WorkspaceScript<W>
> = W extends Workspace<any, infer T> ? T[Script]["params"] : never;

export type WorkspaceResult<
  W extends Workspace<any, any>,
  Script extends WorkspaceScript<W>
> = W extends Workspace<any, infer T> ? T[Script]["result"] : never;
