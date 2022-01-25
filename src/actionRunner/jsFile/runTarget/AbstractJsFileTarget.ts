import {SyncRunTargetInterface} from "../../../runTarget/SyncRunTargetInterface";
import {RunOptions} from "../../../runOptions/RunOptions";
import {JsFileRunResult} from "../JsFileRunResult";
import {spawnChildProc} from "./spawnChildProc";
import {StdoutCommandsExtractor} from "../../../stdout/StdoutCommandsExtractor";
import {CommandsStore} from "../../../runResult/CommandsStore";
import {ActionConfigStore} from "../../../runOptions/ActionConfigStore";
import {ActionConfigInterface} from "../../../types/ActionConfigInterface";
import {BaseRunMilieuComponentsFactory} from "../../../runMilieu/BaseRunMilieuComponentsFactory";
import {ChildProcRunMilieuFactory} from "../runMilieu/ChildProcRunMilieuFactory";
import os from "os";
import {SpawnProc} from "../../../utils/spawnProc";

export abstract class AbstractJsFileTarget<AC extends ActionConfigInterface|undefined> implements SyncRunTargetInterface {
    protected constructor(
        public readonly jsFilePath: string,
        public readonly actionConfig: ActionConfigStore<AC>,
        public readonly actionYmlPath: string|undefined,
    ) {}

    run(options: RunOptions): JsFileRunResult
    {
        const runMilieu = (new ChildProcRunMilieuFactory(
            new BaseRunMilieuComponentsFactory(options, this.actionConfig, this.actionYmlPath)
        )).createMilieu(options.validate());
        const spawnResult = spawnChildProc(this.jsFilePath, options, runMilieu.env);
        try {
            SpawnProc.printOutput(
                spawnResult, options.outputOptions.shouldPrintStdout, options.outputOptions.data.printStderr
            );
            const commands = spawnResult.stdout && options.outputOptions.data.parseStdoutCommands
                ? StdoutCommandsExtractor.extract(spawnResult.stdout)
                : new CommandsStore();
            const effects = runMilieu.getEffects(os.EOL);
            if (options.fakeFsOptions.data.fakeCommandFiles) {
                commands.apply(effects.fileCommands);
            }
            return new JsFileRunResult(
                commands.data,
                spawnResult.error,
                spawnResult.status !== null ? spawnResult.status : undefined,
                spawnResult.stdout,
                spawnResult.stderr,
                effects.runnerDirs.data.temp,
                effects.runnerDirs.data.workspace,
                spawnResult
            );
        } finally {
            runMilieu.restore();
        }
    }

    abstract clone(): this;
}