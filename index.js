const core = require("@actions/core");
const github = require("@actions/github");
const utils = require("./utils");

async function run() {
  try {
    const config = utils.getConfig();
    const octokit = github.getOctokit(config.token);
    
    const packageVersion = utils.findPackageVersionByTag(
      octokit,
      config.owner,
      config.name,
      config.tag
    );
    core.info(`found id of package ${packageVersion.id}`)
    
    await utils.deletePackageVersion(
      octokit, 
      config.owner, 
      config.name, 
      packageVersion.id,
    )
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
