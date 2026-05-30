import { type TemplateName } from "./templates.js";
export interface ScaffoldOptions {
    readonly targetDirectory: string;
    readonly projectName: string;
    readonly template?: TemplateName;
}
export interface LoggerLike {
    log(message: string): void;
    error(message: string): void;
}
export declare function createProject(options: ScaffoldOptions): void;
export declare function runCli(argv: readonly string[], cwd: string, logger: LoggerLike): number;
