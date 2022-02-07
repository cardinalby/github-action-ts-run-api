import {StringKeyValueObj} from "../types/StringKeyValueObj";

export type EchoCommandMessage = 'on'|'off'|undefined;

export interface ParsedFileCommandsInterface {
    /**
     * @description
     * Array of "add path" commands parsed from GITHUB_PATH file or from stdout.
     *
     * Add path in JS action:
     *
     *     const core = require('@actions/core');
     *     core.addPath('some/path');
     *
     * Add path in bash script (Docker action):
     *
     *     echo "some/path" >> "$GITHUB_PATH"
     */
    addedPaths: string[];

    /**
     * @description
     * Object with variables exported to workflow env parsed from GITHUB_ENV file or from stdout.
     *
     * Export variable in JS action:
     *
     *     const core = require('@actions/core');
     *     core.exportVariable('varName', 'varValue');
     *
     * Export variable in bash script (Docker action):
     *
     *     # For multi-line values you need to use delimiters
     *     echo "varName=varValue" >> "$GITHUB_PATH"
     */
    exportedVars: StringKeyValueObj;
}

export interface StdoutCommandsInterface {
    /**
     * @description
     * Array of "warning" commands parsed from stdout.
     *
     * Warning added in JS action:
     *
     *      const core = require('@actions/core');
     *      core.warning('msg');
     *
     * Warning added in bash script (Docker action):
     *
     *      echo "::warning::msg"
     */
    warnings: string[];

    /**
     * @description
     * Array of "error" commands parsed from stdout.
     *
     * Error added in JS action:
     *
     *      const core = require('@actions/core');
     *      core.error('msg');
     *
     * Error added in bash script (Docker action):
     *
     *      echo "::error::msg"
     *
     */
    errors: string[];

    /**
     * @description
     * Array of "notice" commands parsed from stdout.
     *
     * Notice added in JS action:
     *
     *      const core = require('@actions/core');
     *      core.notice('msg');
     *
     * Notice added in bash script (Docker action):
     *
     *      echo "::notice::msg"
     */
    notices: string[];

    /**
     * @description
     * Array of "debug" commands parsed from stdout.
     *
     * Debug added in JS action:
     *
     *      const core = require('@actions/core');
     *      core.debug('msg');
     *
     * Debug added in bash script (Docker action):
     *
     *      echo "::debug::msg"
     */
    debugs: string[];

    /**
     * @description
     * Object with saved state values parsed from stdout.
     *
     * State saved in JS action:
     *
     *      const core = require('@actions/core');
     *      core.saveState('stateName', 'value');
     *
     * State saved in bash script (Docker action):
     *
     *      echo "::save-state name=stateName::value"
     */
    savedState: StringKeyValueObj;

    /**
     * @description
     * Array of "add-mask" commands parsed from stdout.
     *
     * Secret added in JS action:
     *
     *      const core = require('@actions/core');
     *      core.setSecret('password');
     *
     * Secret added in bash script (Docker action):
     *
     *      echo "::add-mask::password"
     */
    secrets: string[];

    /**
     * @description
     * Echo command parsed from stdout (`'on'|'off'|undefined`).
     *
     * Echo set in JS action:
     *
     *      const core = require('@actions/core');
     *      core.setCommandEcho(true);
     *
     * Echo set in bash script (Docker action):
     *
     *      echo "::echo::on"
     */
    echo: EchoCommandMessage;

    /**
     * @description
     * Object (key: output name, value: output value) with action outputs parsed from stdout.
     *
     * Output set in JS action:
     *
     *      const core = require('@actions/core');
     *      core.setOutput('out1', 'val1');
     *
     * Output set in bash script (Docker action):
     *
     *      echo "::set-output name=out1::val1"
     */
    outputs: StringKeyValueObj;
}

export interface ParsedCommandsInterface extends ParsedFileCommandsInterface, StdoutCommandsInterface {
}