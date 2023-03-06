import {getRunnerArch} from "../../../src/utils/platformProps";
import {runnerArchs} from "../../../src/types/GithubServiceEnvInterface";

describe('platformProps', () => {
    it('getRunnerArch', () => {
        const arch = getRunnerArch()
        expect(arch).not.toBeUndefined()
        expect(runnerArchs).toContain(arch)
    });
});