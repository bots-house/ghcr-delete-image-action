const utils = require("./utils");
const core = require("@actions/core");

async function deleteByTag(config, octokit) {
  core.info(`🔎 search package version with tag ${config.tag}...`);

  const packageVersion = await utils.findPackageVersionByTag(
    octokit,
    config.owner,
    config.name,
    config.tag,
    config.is_user
  );

  core.info(`🆔 package id is #${packageVersion.id}, delete it...`);

  await utils.deletePackageVersion(
    octokit,
    config.owner,
    config.name,
    packageVersion.id,
    config.is_user
  );

  core.info(`✅ package #${packageVersion.id} deleted.`);
}

async function deleteUntaggedOrderGreaterThan(config, octokit) {
  core.info(`🔎 find not latest ${config.untaggedKeepLatest} packages...`);

  const pkgs = await utils.findPackageVersionsUntaggedOrderGreaterThan(
    octokit,
    config.owner,
    config.name,
    config.is_user,
    config.untaggedKeepLatest
  );

  core.startGroup(`🗑 delete ${pkgs.length} packages`);

  for (const pkg of pkgs) {
    try {
      await utils.deletePackageVersion(
        octokit,
        config.owner,
        config.name,
        pkg.id,
        config.is_user
      );
    } catch (error) {
      core.info(`⚠️ package #${pkg.id} not deleted: ${error.message}`);
      continue;
    }


    core.info(`✅ package #${pkg.id} deleted.`);
  }

  core.endGroup();
}

module.exports = { deleteByTag, deleteUntaggedOrderGreaterThan };
