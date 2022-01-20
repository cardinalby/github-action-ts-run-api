import {AbstractFnTarget} from "../runTarget/AbstractFnTarget";
import {RestoreProcessPropsFn, saveProcessProps} from "./saveProcessProps";
import {StdoutInterceptor} from "./StdoutInterceptor";
import {StdoutCommandsInterface} from "../../../stores/ParsedCommandsInterface";
import {StdoutCommandsExtractor} from "../../../stdout/StdoutCommandsExtractor";
import {RunOptions} from "../../../runOptions/RunOptions";
import {CommandsStore} from "../../../stores/CommandsStore";
import {AbstractExecutionEnvironment} from "../../../executionEnvironment/AbstractExecutionEnvironment";
import {ActionConfigStoreOptional} from "../../../stores/ActionConfigStore";
import {ExecutionEffectsInterface} from "../../../executionEnvironment/ExecutionEffectsInterface";

export interface FnExecutionEffects extends ExecutionEffectsInterface {
    exitCode: number|undefined;
    stdoutCommands: StdoutCommandsInterface;
    stdout: string;
}

export class FnExecutionEnvironment extends AbstractExecutionEnvironment {
    static prepare(target: AbstractFnTarget<any>, options: RunOptions): FnExecutionEnvironment {
        if (options.workingDir !== undefined) {
            process.chdir(options.workingDir);
        }
        const result = new FnExecutionEnvironment(
            options,
            target.actionConfig,
            saveProcessProps(),
            StdoutInterceptor.start(options.shouldPrintStdout)
        );
        process.env = result.env;
        return result;
    }

    public shouldParseStdout: boolean;

    protected constructor(
        options: RunOptions,
        actionConfig: ActionConfigStoreOptional|undefined,
        public restoreProcessProps: RestoreProcessPropsFn,
        public stdoutInterceptor: StdoutInterceptor
    ) {
        super(options, actionConfig);
        this.shouldParseStdout = options.shouldParseStdout;
    }

    getEffects(): FnExecutionEffects {
        const effects = super.getEffects();
        const stdoutCommands = this.shouldParseStdout
            ? StdoutCommandsExtractor.extract(this.stdoutInterceptor.interceptedData)
            : new CommandsStore()

        return {
            ...effects,
            stdoutCommands: stdoutCommands.data,
            exitCode: process.exitCode,
            stdout: this.stdoutInterceptor.interceptedData,
        };
    }

    restore() {
        this.stdoutInterceptor.unHook();
        this.restoreProcessProps();
        super.restore();
    }
}