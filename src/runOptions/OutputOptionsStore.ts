import {AbstractStore} from "../utils/AbstractStore";
import {OutputOptionsInterface} from "./OutputOptionsInterface";
import {GithubServiceEnvInterface} from "../types/GithubServiceEnvInterface";
import {OutputTransform} from "./OutputTransform";

const ghActionsVarName: keyof GithubServiceEnvInterface = 'GITHUB_ACTIONS';

export class OutputOptionsStore extends AbstractStore<OutputOptionsInterface> {
    get stdoutTransform(): OutputTransform {
        return this.data.stdoutTransform !== undefined
            ? this.data.stdoutTransform
            : (process.env[ghActionsVarName] === 'true') ? OutputTransform.SANITIZE_COMMANDS : OutputTransform.NONE;
    }

    get stderrTransform(): OutputTransform {
        return this.data.stderrTransform !== undefined
            ? this.data.stderrTransform
            : (process.env[ghActionsVarName] === 'true') ? OutputTransform.SANITIZE_COMMANDS : OutputTransform.NONE;
    }
}