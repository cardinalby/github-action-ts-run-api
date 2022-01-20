import structuredClone from "realistic-structured-clone";
import {GithubContextInterface} from "../types/GithubContextInterface";
import {GithubEventName} from "../types/GithubEventName";
import {AbstractStore} from "./AbstractStore";
import {GithubContextEnvs} from "../types/GithubContextEnvs";
import {filterObjectKeys} from "../utils/collections";
import {FakeFile} from "../githubServiceFiles/FakeFile";
import {GithubServiceFileName} from "../githubServiceFiles/GithubServiceFileName";
import fs from "fs-extra";

export interface ContextExportResult {
    eventPayloadFile: FakeFile|undefined,
    envVariables: GithubContextEnvs
}

export class GithubContextStore extends AbstractStore<GithubContextInterface> {
    static readonly WORKFLOW_DEFAULT = 'test_workflow';
    static readonly RUN_NUMBER_DEFAULT = 1;
    static readonly JOB_DEFAULT = 'test_job';
    static readonly ACTOR_DEFAULT = 'tester';
    static readonly EVENT_NAME_DEFAULT: GithubEventName = 'workflow_dispatch';
    static readonly SERVER_URL_DEFAULT = 'https://github.com';
    static readonly API_URL_DEFAULT = 'https://api.github.com';
    static readonly GRAPHQL_URL_DEFAULT = 'https://api.github.com/graphql';

    setDefaults(): this {
        this._data.workflow = GithubContextStore.WORKFLOW_DEFAULT;
        this._data.runId = Math.floor(Math.random() * 2147483646) + 1;
        this._data.runNumber = GithubContextStore.RUN_NUMBER_DEFAULT;
        this._data.job = GithubContextStore.JOB_DEFAULT;
        this._data.actor = GithubContextStore.ACTOR_DEFAULT;
        this._data.eventName = GithubContextStore.EVENT_NAME_DEFAULT;
        this._data.serverUrl = GithubContextStore.SERVER_URL_DEFAULT;
        this._data.apiUrl = GithubContextStore.API_URL_DEFAULT;
        this._data.graphqlUrl = GithubContextStore.GRAPHQL_URL_DEFAULT;
        return this;
    }

    export(): ContextExportResult {
        const envVariables = filterObjectKeys({
            GITHUB_WORKFLOW: this._data.workflow,
            GITHUB_RUN_ID: this._data.runId?.toString() ,
            GITHUB_RUN_NUMBER: this._data.runNumber?.toString(),
            GITHUB_JOB: this._data.job,
            GITHUB_ACTION: this._data.action,
            GITHUB_ACTION_PATH: this._data.actionPath,
            GITHUB_ACTOR: this._data.actor,
            GITHUB_REPOSITORY: this._data.repository,
            GITHUB_EVENT_NAME: this._data.eventName,
            GITHUB_SHA: this._data.sha,
            GITHUB_REF: this._data.ref,
            GITHUB_SERVER_URL: this._data.serverUrl,
            GITHUB_API_URL: this._data.apiUrl,
            GITHUB_GRAPHQL_URL: this._data.graphqlUrl,
        }, (key, value) => value !== undefined);
        let eventPayloadFile = this.createEventPayloadFile();
        return { eventPayloadFile, envVariables }
    }

    clone(): this {
        return new GithubContextStore({
            ...this._data,
            payload: structuredClone(this._data.payload)
        }) as this;
    }

    private createEventPayloadFile(): FakeFile|undefined {
        if (this._data.payload === undefined) {
            return undefined;
        }
        const file = FakeFile.create(GithubServiceFileName.EVENT_PATH);
        fs.writeFileSync(file.filePath, JSON.stringify(this._data.payload));
        return file;
    }
}