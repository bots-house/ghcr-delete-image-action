const core = require("@actions/core");

/**
 * Parse input from env.
 * @returns Config
 */
let getConfig = function () {
  const config = {
    owner: core.getInput("owner", { required: true }),
    name: core.getInput("name", { required: true }),
    token: core.getInput("token", { required: true }),

    // optional, mutual exclusive options
    tag: core.getInput("tag") || null,
    untaggedKeepLatest: core.getInput("untagged-keep-latest") || null,
    untaggedOlderThan: core.getInput("untagged-older-than") || null,
  };

  const definedOptionsCount = [
    config.tag,
    config.untaggedKeepLatest,
    config.untaggedOlderThan,
  ].filter((x) => x !== null).length;

  if (definedOptionsCount == 0) {
    throw new Error("no any required options defined");
  } else if (definedOptionsCount > 1) {
    throw new Error("too many selectors defined, use only one");
  }

  if (config.untaggedKeepLatest) {
    if (
      isNaN((config.untaggedKeepLatest = parseInt(config.untaggedKeepLatest)))
    ) {
      throw new Error("untagged-keep-latest is not number");
    }
  }

  if (config.untaggedOlderThan) {
    if (
      isNaN((config.untaggedOlderThan = parseInt(config.untaggedOlderThan)))
    ) {
      throw new Error("untagged-older-than is not number");
    }
  }

  return config;
};

let findPackageVersionByTag = async function (octokit, owner, name, tag) {
  const tags = new Set();

  for await (const pkgVer of iteratePackageVersions(octokit, owner, name)) {
    const versionTags = pkgVer.metadata.container.tags;

    if (versionTags.includes(tag)) {
      return pkgVer;
    } else {
      versionTags.map((item) => {
        tags.add(item);
      });
    }
  }

  console.warn(
    `package with tag '${tag}' does not exits, available tags: ${Array.from(
      tags
    ).join(", ")}`
  );
};

let findPackageVersionsUntaggedOrderGreaterThan = async function (
  octokit,
  owner,
  name,
  n
) {
  const pkgs = [];

  for await (const pkgVer of iteratePackageVersions(octokit, owner, name)) {
    const versionTags = pkgVer.metadata.container.tags;
    if (versionTags.length == 0) {
      pkgs.push(pkgVer);
    }
  }

  pkgs.sort((a, b) => {
    return new Date(b.updated_at) - new Date(a.updated_at);
  });

  return pkgs.slice(n);
};

let iteratePackageVersions = async function* (octokit, owner, name) {
  for await (const response of octokit.paginate.iterator(
    octokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg,
    {
      package_type: "container",
      package_name: name,
      org: owner,
      state: "active",
      per_page: 100,
    }
  )) {
    for (let packageVersion of response.data) {
      yield packageVersion;
    }
  }
};

let deletePackageVersion = async (octokit, owner, name, versionId) => {
  await octokit.rest.packages.deletePackageVersionForOrg({
    package_type: "container",
    package_name: name,
    org: owner,
    package_version_id: versionId,
  });
};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

module.exports = {
  getConfig,
  findPackageVersionByTag,
  deletePackageVersion,
  findPackageVersionsUntaggedOrderGreaterThan,
  sleep,
};
