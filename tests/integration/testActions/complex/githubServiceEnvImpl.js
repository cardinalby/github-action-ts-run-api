exports.run = (github, fs, path) => {
    fs.writeFileSync(path.join(process.env.RUNNER_TEMP, 'out.json'), JSON.stringify({
        pr_number: github.context.payload.pull_request.number,
        server_url: github.context.serverUrl,
        event_name: github.context.eventName,
        github_actions_env: process.env.GITHUB_ACTIONS,
        github_ref_name_env: process.env.GITHUB_REF_NAME,
        runner_os: process.env.RUNNER_OS
    }));
}