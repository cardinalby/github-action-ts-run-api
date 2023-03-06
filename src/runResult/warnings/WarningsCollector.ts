import {RunOptions} from "../../runOptions/RunOptions";
import {ActionConfigStoreOptional} from "../../runOptions/ActionConfigStore";
import {WarningsArray} from "./WarningsArray";
import {Warning} from "./Warning";

export class WarningsCollector {
    private commandWarnings: Warning[] = []

    constructor(
        private readonly runOptions: RunOptions,
        private readonly actionConfig: ActionConfigStoreOptional
    ) {
    }

    setCommandWarnings(warnings: Warning[]): WarningsCollector {
        this.commandWarnings = warnings
        return this
    }

    /**
     * Collect warnings and print if options.outputOptions.data.printWarnings is set
     */
    extractWarnings(): WarningsArray {
        const warnings = new WarningsArray(
            ...this.actionConfig.getWarnings(),
            ...this.commandWarnings
        )
        if (this.runOptions.outputOptions.data.printWarnings) {
            warnings.print()
        }
        return warnings
    }
}