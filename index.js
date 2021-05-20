const core = require("@actions/core");
const github = require("@actions/github");
const utils = require("./utils");
const actions = require("./actions");

async function run() {
  try {
    const config = utils.getConfig();
    const octokit = github.getOctokit(config.token);

    if (config.tag) {
      await actions.deleteByTag(config, octokit);
    } else if (config.untaggedKeepLatest) {
      await actions.deleteUntaggedOrderGreaterThan(config, octokit);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
