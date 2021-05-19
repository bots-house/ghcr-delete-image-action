const utils = require("./utils");
const github = require("@actions/github");

describe("getConfig", () => {
  test("throw error if value is missing", () => {
    expect(() => {
      utils.getConfig();
    }).toThrow();
  });

  test("returns valid config", () => {
    process.env["INPUT_OWNER"] = "bots-house";
    process.env["INPUT_NAME"] = "ghcr-delete-image";
    process.env["INPUT_TOKEN"] = "some-token";
    process.env["INPUT_TAG"] = "latest";

    expect(utils.getConfig()).toStrictEqual({
      owner: "bots-house",
      name: "ghcr-delete-image",
      token: "some-token",
      tag: "latest",
    });
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
    return expect(utils.findPackageVersionByTag(
      octokit,
      "bots-house",
      "docker-telegram-bot-api",
      "test"
    )).rejects.toThrow(new RegExp("package with tag"));

  });
});
