import {AbstractStore} from "../utils/AbstractStore";
import {OutputOptionsInterface} from "./OutputOptionsInterface";
import {GithubServiceEnvInterface} from "../types/GithubServiceEnvInterface";
import {StdoutTransform} from "./StdoutTransform";

const ghActionsVarName: keyof GithubServiceEnvInterface = 'GITHUB_ACTIONS';

export class OutputOptionsStore extends AbstractStore<OutputOptionsInterface> {
    get stdoutTransform(): StdoutTransform {
        return this.data.stdoutTransform !== undefined
            ? this.data.stdoutTransform
            : (process.env[ghActionsVarName] === 'true') ? StdoutTransform.SANITIZE_COMMANDS : StdoutTransform.NONE;
    }
}