import { Workspace } from "../../index.js";
import { WorkspaceParams, WorkspaceResult, WorkspaceScript } from "../Workspace.js";
/**
 * Exists inside the Worker thread, used to communicate with the Instrument.
 */
export declare class Worker<W extends Workspace<any, any>, S extends WorkspaceScript<W>> {
    constructor();
    get params(): WorkspaceParams<W, S>;
    resolve(result: WorkspaceResult<W, S>): void;
}
//# sourceMappingURL=Worker.d.ts.map