import {WarningsArray} from "../../src";
import {DeprecatedStdoutCommandWarning} from "../../src";
import {StdoutCommandName} from "../../src/stdout/stdoutCommands";

export function expectDeprecatedCmdsWarnings(
    warnings: WarningsArray,
    deprecatedCommands: (string|StdoutCommandName)[]
) {
    expect(warnings).toHaveLength(deprecatedCommands.length);
    const foundCommands = warnings
        .filter(warn => warn instanceof DeprecatedStdoutCommandWarning)
        .map(warn => (warn as DeprecatedStdoutCommandWarning).command);
    expect(foundCommands.sort()).toEqual(deprecatedCommands.sort())
}