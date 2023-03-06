import {RunOptions} from "../../runOptions/RunOptions";
import {ActionConfigStoreOptional} from "../../runOptions/ActionConfigStore";
import {CommandWarning, RunnerWarning} from "./RunnerWarning";
import os from "os";

export class WarningsCollector {
    private warnings: RunnerWarning[] = []

    constructor(
        private readonly runOptions: RunOptions,
        private readonly actionConfig: ActionConfigStoreOptional
    ) {
        this.warnings.push(...this.actionConfig.getWarnings())
    }

    setCommandWarnings(warnings: CommandWarning[]): WarningsCollector {
        this.warnings.push(...warnings)
        return this
    }

    /**
     * Get collected warnings and print if options.outputOptions.data.printWarnings is set
     */
    getAndPrint(): RunnerWarning[] {
        this.print()
        return this.get()
    }

    /**
     * Get collected warnings
     */
    get(): RunnerWarning[] {
        return this.warnings
    }

    /**
     * Print if options.outputOptions.data.printWarnings is set
     */
    print(): void {
        if (this.runOptions.outputOptions.data.printWarnings) {
            this.warnings.forEach(warning => process.stderr.write(os.EOL + warning.message))
        }
    }
}