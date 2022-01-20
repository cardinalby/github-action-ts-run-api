import {GithubContextEnvsInterface} from "./GithubContextEnvsInterface";
import {GithubServiceEnvInterface} from "./GithubServiceEnvInterface";

export interface EnvInterface extends GithubContextEnvsInterface, GithubServiceEnvInterface {
    [name: string]: string|undefined;
}