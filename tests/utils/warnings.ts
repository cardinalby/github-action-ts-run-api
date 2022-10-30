import {WarningsArray} from "../../src/runResult/warnings/WarningsArray";
import {DeprecatedStdoutCommandWarning} from "../../src/runResult/warnings/DeprecatedStdoutCommandWarning";
import {StdoutCommandName} from "../../src/stdout/StdoutCommandName";

export function expectWarningsContains(
    warnings: WarningsArray,
    deprecatedCommands: (string|StdoutCommandName)[]
) {
    expect(warnings).toHaveLength(deprecatedCommands.length);
    const foundCommands = warnings
        .filter(warn => warn instanceof DeprecatedStdoutCommandWarning)
        .map(warn => (warn as DeprecatedStdoutCommandWarning).command);
    expect(foundCommands.sort()).toEqual(deprecatedCommands.sort())
}