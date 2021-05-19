const core = require("@actions/core");

let getConfig = function () {
  return {
    owner: core.getInput("owner", { required: true }),
    name: core.getInput("name", { required: true }),
    token: core.getInput("token", { required: true }),
    tag: core.getInput("tag", { required: true }),
  };
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
      
      if(versionTags.includes(tag)) {
        return packageVersion
      } else {
        versionTags.map(item => {
          tags.add(item)
        })
      }
    }
  }

  throw new Error(`package with tag '${tag}' does not exits, available tags: ${Array.from(tags).join(', ')}`)
};

module.exports = {
  getConfig,
  findPackageVersionByTag,
};
