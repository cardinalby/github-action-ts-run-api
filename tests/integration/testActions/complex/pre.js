const core = require('@actions/core');
const octokit = require('@actions/github')
    .getOctokit(process.env.GITHUB_TOKEN,
        {baseUrl: process.env.GITHUB_API_URL});
// noinspection JSValidateTypes,JSUnresolvedVariable
octokit.rest.repos.get({
    repo: 'r',
    owner: 'o'
}).then(resp => {
    core.setOutput('resp', resp.data);
});