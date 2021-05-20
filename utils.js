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
    untaggedKeepLatest: core.getInput("untagged_keep_latest") || null,
    untaggedOlderThan: core.getInput("untagged_older_than") || null,
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
      const versionTags = packageVersion.metadata.container.tags;

      if (versionTags.includes(tag)) {
        return packageVersion;
      } else {
        versionTags.map((item) => {
          tags.add(item);
        });
      }
    }
  }

  throw new Error(
    `package with tag '${tag}' does not exits, available tags: ${Array.from(
      tags
    ).join(", ")}`
  );
};

let deletePackageVersion = async (octokit, owner, name, versionId) => {
  await octokit.rest.packages.deletePackageVersionForOrg({
    package_type: "container",
    package_name: name,
    org: owner,
    package_version_id: versionId,
  });
};

module.exports = {
  getConfig,
  findPackageVersionByTag,
  deletePackageVersion,
};
