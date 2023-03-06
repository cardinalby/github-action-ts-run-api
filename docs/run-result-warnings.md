# Run result warnings

Starting from release **2.3.0** the library produces **warnings** emulating the behavior of GitHub Runner.

**By default**, warnings are **printed to stderr** at the end of the run.

If you want to check them by yourself, you can **disable** this behavior by 
passing `{printRunnerWarnings: false}` to [`RunOptions.setOutputOptions()`](./run-options.md#-setoutputoptions).

You can **access** the produced warnings via [`runResult.runnerWarnings`](./run-result.md#-runnerwarnings) field.
The property is an array of [`RunnerWarning`](../src/runResult/warnings/RunnerWarning.ts)) objects
and contains typed warnings so that you can handle them selectively.

Pay attention and update your actions!

## Warning types

The following warning classes are exported by the library and can be used to check `runResult.warnings` items:

### 🔻 [`DeprecatedNodeVersionWarning`](../src/runResult/warnings/DeprecatedNodeVersionWarning.ts)
Node 12 version actions are deprecated since April 2022 ([Source](https://github.blog/changelog/2022-09-22-github-actions-all-actions-will-begin-running-on-node16-instead-of-node12/)).

### 🔻 [`DeprecatedStdoutCommandWarning`](../src/runResult/warnings/DeprecatedStdoutCommandWarning.ts)
Being produced if a deprecated stdout command was issued:
[set-state, set-output](https://github.blog/changelog/2022-10-11-github-actions-deprecating-save-state-and-set-output-commands/),
[set-env, add-path](https://github.blog/changelog/2020-10-01-github-actions-deprecating-set-env-and-add-path-commands/).

To fix this warning in JS action, update to the latest [`@actions/core`](https://www.npmjs.com/package/@actions/core) 
version.