import {AbstractStore} from "./AbstractStore";
import {GithubServiceEnvInterface} from "../types/GithubServiceEnvInterface";
import {getRunnerArch, getRunnerOs} from "../utils/platformProps";

export class GithubServiceEnvStore extends AbstractStore<GithubServiceEnvInterface> {
    static readonly CI_DEFAULT = 'true';
    static readonly GITHUB_ACTIONS_DEFAULT = 'true';
    static readonly RUNNER_NAME_DEFAULT = 'test-utils-runner';

    setDefaults(): this {
        this._data.CI = GithubServiceEnvStore.CI_DEFAULT;
        this._data.GITHUB_ACTIONS = GithubServiceEnvStore.GITHUB_ACTIONS_DEFAULT;
        this._data.RUNNER_NAME = GithubServiceEnvStore.RUNNER_NAME_DEFAULT;

        const runnerOs = getRunnerOs();
        if (runnerOs !== undefined) {
            this._data.RUNNER_OS = runnerOs;
        }

        const runnerArch = getRunnerArch();
        if (runnerArch !== undefined) {
            this._data.RUNNER_ARCH = runnerArch;
        }
        return this;
    }
}