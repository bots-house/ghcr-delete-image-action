const utils = require("./utils");
const github = require("@actions/github");

let withEnv = (envs, cb) => {
  for (const k in envs) {
    process.env[k] = envs[k];
  }

  cb();

  for (const k in envs) {
    delete process.env[k];
  }
};

describe("getConfig", () => {
  test("throw error if value is missing", () => {
    expect(() => {
      utils.getConfig();
    }).toThrow();
  });

  const sharedRequiredOpts = {
    INPUT_OWNER: "bots-house",
    INPUT_NAME: "ghcr-delete-image-action",
    INPUT_TOKEN: "some-token",
  };

  test("returns valid config", () => {
    withEnv(
      {
        ...sharedRequiredOpts,
        INPUT_TAG: "latest",
      },
      () => {
        expect(utils.getConfig()).toStrictEqual({
          owner: "bots-house",
          name: "ghcr-delete-image-action",
          token: "some-token",
          tag: "latest",
          untaggedKeepLatest: null,
          untaggedOlderThan: null,
        });
      }
    );
  });

  test("throw error if no any required defined", () => {
    withEnv(
      {
        ...sharedRequiredOpts,
      },
      () => {
        expect(() => utils.getConfig()).toThrow(
          "no any required options defined"
        );
      }
    );
  });

  test("throw error if more then on selector defined", () => {
    withEnv(
      {
        ...sharedRequiredOpts,
        INPUT_UNTAGGED_KEEP_LATEST: "2",
        INPUT_UNTAGGED_OLDER_THAN: "3",
      },
      () => {
        expect(() => utils.getConfig()).toThrow(
          "too many selectors defined, use only one"
        );
      }
    );
  });

  test("throw error if untagged keep latest is not number", () => {
    withEnv(
      {
        ...sharedRequiredOpts,
        INPUT_UNTAGGED_KEEP_LATEST: "asdf",
      },
      () => {
        expect(() => utils.getConfig()).toThrow(
          "untagged-keep-latest is not number"
        );
      }
    );
  });

  test("throw error if untagged older than is not number", () => {
    withEnv(
      {
        ...sharedRequiredOpts,
        INPUT_UNTAGGED_OLDER_THAN: "asdf",
      },
      () => {
        expect(() => utils.getConfig()).toThrow(
          "untagged-older-than is not number"
        );
      }
    );
  });
});

describe("findPackageVersionByTag", () => {
  const token = process.env["INTEGRATION_TEST_TOKEN"];
  expect(token).toBeTruthy();

  const octokit = github.getOctokit(token);

  test("existing version returns object", async () => {
    const packageVersion = await utils.findPackageVersionByTag(
      octokit,
      "bots-house",
      "docker-telegram-bot-api",
      "fbb8b4c-b21d667"
    );
    expect(packageVersion.id).toBe(266441);
  }, 15000);

  test("not existing version throw error", () => {
    return expect(
      utils.findPackageVersionByTag(
        octokit,
        "bots-house",
        "docker-telegram-bot-api",
        "test"
      )
    ).rejects.toThrow(new RegExp("package with tag"));
  });
});
