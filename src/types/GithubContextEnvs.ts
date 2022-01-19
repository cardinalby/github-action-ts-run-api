export interface GithubContextEnvs {
    [p: string]: string|undefined;

    /** @description The name of the workflow.*/
    GITHUB_WORKFLOW?: string;

    /** @description A unique number for each workflow run within a repository. This number does not change if you re-run the workflow run.*/
    GITHUB_RUN_ID?: string;

    /** @description A unique number for each run of a particular workflow in a repository. This number begins at 1 for the workflow's first run, and increments with each new run. This number does not change if you re-run the workflow run.*/
    GITHUB_RUN_NUMBER?: string;

    /** @description The job_id of the current job.*/
    GITHUB_JOB?: string;

    /** @description The unique identifier (id) of the action.*/
    GITHUB_ACTION?: string;

    /** @description The path where your action is located. You can use this path to access files located in the same repository as your action. This variable is only supported in composite actions.*/
    GITHUB_ACTION_PATH?: string;

    /** @description The name of the person or app that initiated the workflow. For example, octocat.*/
    GITHUB_ACTOR?: string;

    /** @description The owner and repository name. For example, octocat/Hello-World.*/
    GITHUB_REPOSITORY?: string;

    /** @description The name of the webhook event that triggered the workflow.*/
    GITHUB_EVENT_NAME?: string;

    /** @description The path of the file with the complete webhook event payload. For example, /github/workflow/event.json.*/
    GITHUB_EVENT_PATH?: string;

    /** @description The commit SHA that triggered the workflow. For example, ffac537e6cbbf934b08745a378932722df287a53.*/
    GITHUB_SHA?: string;

    /** @description The branch or tag ref that triggered the workflow. For example, refs/heads/feature-branch-1. If neither a branch nor tag is available for the event type, the variable will not exist.*/
    GITHUB_REF?: string;

    /** @description Returns the URL of the GitHub server. For example: https://github.com.*/
    GITHUB_SERVER_URL?: string;

    /** @description Returns the API URL. For example: https://api.github.com.*/
    GITHUB_API_URL?: string;

    /** @description Returns the GraphQL API URL. For example: https://api.github.com/graphql.*/
    GITHUB_GRAPHQL_URL?: string;
}