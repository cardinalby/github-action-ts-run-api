import {Context} from "@actions/github/lib/context";

/**
 * Normal retrieving context using "@actions/github" leads to its caching in
 * "@actions/github/github.js" module which is not suitable for tests running in the same process
 * and sharing the same "require" cache
 */
export function getNewGithubContext(): Context {
    return new (require("@actions/github/lib/context").Context)();
}