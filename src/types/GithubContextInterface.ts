import {WebhookPayload} from "@actions/github/lib/interfaces";
import {GithubEventName} from "./GithubEventName";

export interface GithubContextInterface {
    /** @description The name of the workflow.*/
    workflow?: string;

    /** @description A unique number for each workflow run within a repository. This number does not change if you re-run the workflow run.*/
    runId?: number;

    /** @description A unique number for each run of a particular workflow in a repository. This number begins at 1 for the workflow's first run, and increments with each new run. This number does not change if you re-run the workflow run.*/
    runNumber?: number;

    /** @description The job_id of the current job.*/
    job?: string;

    // TODO:
    /**
     * @description The unique identifier (id) of the action.
     * @default action id from action.yml file or config if set in target
     **/
    action?: string;

    // TODO:
    /** @description The path where your action is located. You can use this path to access files located in the same repository as your action. This variable is only supported in composite actions.*/
    actionPath?: string;

    /** @description The name of the person or app that initiated the workflow. For example, octocat.*/
    actor?: string;

    // TODO:
    /** @description The owner and repository name. For example, octocat/Hello-World.*/
    repository?: string;

    /** @description The name of the webhook event that triggered the workflow.*/
    eventName?: GithubEventName;

    /** @description Save payload object (that is retrievable by github.context.payload) to tmp file and set GITHUB_EVENT_PATH env variable */
    payload?: WebhookPayload;

    /** @description The commit SHA that triggered the workflow. For example, ffac537e6cbbf934b08745a378932722df287a53.*/
    sha?: string;

    /** @description The branch or tag ref that triggered the workflow. For example, refs/heads/feature-branch-1. If neither a branch nor tag is available for the event type, the variable will not exist.*/
    ref?: string;

    /** @description Returns the URL of the GitHub server. For example: https://github.com.*/
    serverUrl?: string;

    /** @description Returns the API URL. For example: https://api.github.com.*/
    apiUrl?: string;

    /** @description Returns the GraphQL API URL. For example: https://api.github.com/graphql.*/
    graphqlUrl?: string;
}