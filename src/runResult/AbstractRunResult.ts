import {RunResultInterface} from "./RunResultInterface";
import {CommandsStoreInterface} from "../stores/CommandsStoreInterface";
import {FakeTempDir} from "../githubServiceFiles/FakeTempDir";

export abstract class AbstractRunResult implements RunResultInterface
{
    readonly isSuccess: boolean;

    protected constructor(
        public readonly commands: CommandsStoreInterface,
        public readonly error: Error|any|undefined,
        public readonly isTimedOut: boolean,
        public readonly exitCode: number|undefined,
        public readonly stdout: string,
        public readonly tempDir: FakeTempDir|undefined
    ) {
        this.isSuccess = (this.exitCode === 0 || this.exitCode === undefined) && this.error === undefined;
    }
}