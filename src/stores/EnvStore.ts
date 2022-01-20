import {EnvInterface} from "../types/EnvInterface";
import {AbstractStore} from "./AbstractStore";
import {getFileCommandNames} from "../githubServiceFiles/GithubServiceFileName";
import {FakeFile} from "../githubServiceFiles/FakeFile";

export class EnvStore extends AbstractStore<EnvInterface>{
    unsetFileCommandPaths(): this {
        getFileCommandNames().forEach(name => {
            delete this.data[FakeFile.getFilePathEnvVariable(name)];
        });
        return this;
    }
}