import {AbstractStore} from "../../../utils/AbstractStore";
import {DockerOptions} from "./DockerOptions";
import {UserInfo} from "os";
import os from "os";

let userInfo: UserInfo<string>|undefined;

export class DockerOptionsStore extends AbstractStore<DockerOptions> {
    static create(options?: Partial<DockerOptions>) {
        return (new DockerOptionsStore({
            runUnderCurrentLinuxUser: true,
            network: undefined
        })).apply(options || {});
    }

    getUserForRun(): string|undefined {
        if (!this._data.runUnderCurrentLinuxUser || os.platform() !== 'linux') {
            return undefined;
        }
        if (userInfo === undefined) {
            userInfo = os.userInfo();
        }
        if (userInfo.uid < 0 || userInfo.gid < 0) {
            return undefined;
        }
        return `${userInfo.uid}:${userInfo.gid}`;
    }
}