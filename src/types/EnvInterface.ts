import {GithubContextEnvs} from "./GithubContextEnvs";
import {GithubServiceEnvInterface} from "./GithubServiceEnvInterface";

export interface EnvInterface extends GithubContextEnvs, GithubServiceEnvInterface {
    [name: string]: string|undefined;
}