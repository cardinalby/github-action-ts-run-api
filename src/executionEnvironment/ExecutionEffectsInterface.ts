import {ParsedFileCommandsInterface} from "../stores/ParsedCommandsInterface";
import {FakeTempDir} from "../githubServiceFiles/FakeTempDir";

export interface ExecutionEffectsInterface {
    fileCommands: Partial<ParsedFileCommandsInterface>,
    tempDir: FakeTempDir|undefined
}