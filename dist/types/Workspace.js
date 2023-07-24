import path from "path";
export class Workspace {
    directory;
    constructor(directory) {
        this.directory = directory;
    }
    getPath(script) {
        return path.join(this.directory, script);
    }
}
//# sourceMappingURL=Workspace.js.map