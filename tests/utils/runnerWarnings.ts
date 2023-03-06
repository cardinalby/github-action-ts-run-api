import {RunnerWarning} from "../../src";
import {DeprecatedStdoutCommandWarning} from "../../src";
import {StdoutCommandName} from "../../src/stdout/stdoutCommands";

export function expectDeprecatedCmdsWarnings(
    runnerWarnings: RunnerWarning[],
    deprecatedCommands: (string|StdoutCommandName)[]
) {
    expect(runnerWarnings).toHaveLength(deprecatedCommands.length);
    const foundCommands = runnerWarnings
        .filter(warn => warn instanceof DeprecatedStdoutCommandWarning)
        .map(warn => (warn as DeprecatedStdoutCommandWarning).command);
    expect(foundCommands.sort()).toEqual(deprecatedCommands.sort())
}