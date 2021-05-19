const core = require("@actions/core");

let getConfig = function () {
  return {
    owner: core.getInput("owner", { required: true }),
    name: core.getInput("name", { required: true }),
    token: core.getInput("token", { required: true }),
    tag: core.getInput("tag", { required: true }),
  };
};

module.exports = {
  getConfig,
};
