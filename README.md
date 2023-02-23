# ghcr-delete-image

[![CI](https://github.com/bots-house/ghcr-delete-image-action/actions/workflows/ci.yml/badge.svg)](https://github.com/bots-house/ghcr-delete-image-action/actions/workflows/ci.yml)
[![wakatime](https://wakatime.com/badge/github/bots-house/ghcr-delete-image-action.svg)](https://wakatime.com/badge/github/bots-house/ghcr-delete-image-action)

Delete image from [Github Container Registry](https://github.com/features/packages) by tag. 
Useful for cleanup of pull request scoped images. 


## Usage 

## Delete image when PR was closed.

```yaml
name: Cleanup PR Images

on:
  pull_request:
    types: [closed]

jobs:
  purge-image:
    name: Delete image from ghcr.io
    runs-on: ubuntu-latest
    steps:
      - name: Delete image
        uses: bots-house/ghcr-delete-image-action@v1.1.0
        with:
          # NOTE: at now only orgs is supported
          owner: bots-house
          name: some-web-service
          # NOTE: using Personal Access Token
          token: ${{ secrets.PAT }}
          tag: pr-${{github.event.pull_request.number}}
```

## Keep latest N untagged images

```yaml
name: Cleanup Untagged Images

on:
  # every sunday at 00:00
  schedule:
    - cron: "0 0 * * SUN"
  # or manually
  workflow_dispatch:

jobs:
  delete-untagged-images:
    name: Delete Untagged Images
    runs-on: ubuntu-latest
    steps:
      - uses: bots-house/ghcr-delete-image-action@v1.1.0
        with:
          # NOTE: at now only orgs is supported
          owner: bots-house
          name: some-web-service
          # NOTE: using Personal Access Token
          token: ${{ secrets.PAT }}
          # Keep latest N untagged images
          untagged-keep-latest: 3
```