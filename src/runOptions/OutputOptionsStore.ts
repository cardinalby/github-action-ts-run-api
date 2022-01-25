import {AbstractStore} from "../utils/AbstractStore";
import {OutputOptionsInterface} from "./OutputOptionsInterface";
import {GithubServiceEnvInterface} from "../types/GithubServiceEnvInterface";

export class OutputOptionsStore extends AbstractStore<OutputOptionsInterface> {
    get shouldPrintStdout() {
        const ghActionsVarName: keyof GithubServiceEnvInterface = 'GITHUB_ACTIONS';
        return this.data.printStdout !== undefined
            ? this.data.printStdout
            : (process.env[ghActionsVarName] !== 'true')
    }
}