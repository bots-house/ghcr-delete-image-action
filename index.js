const core = require("@actions/core");
const github = require("@actions/github");
const utils = require("./utils");

async function run() {
  try {
    const config = utils.getConfig();
    const octokit = github.getOctokit(config.token);
    
    core.info(`🔎 search package version with tag ${config.tag}...`)

    const packageVersion = await utils.findPackageVersionByTag(
      octokit,
      config.owner,
      config.name,
      config.tag
    );
    
    core.info(`🆔 package id is #${packageVersion.id}, delete it...`)

    await utils.deletePackageVersion(
      octokit, 
      config.owner, 
      config.name, 
      packageVersion.id,
    )

    core.info(`✅ package #${packageVersion.id} deleted.`)
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
