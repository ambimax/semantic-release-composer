# @ambimax/semantic-release-composer

[**semantic-release**](https://github.com/semantic-release/semantic-release) plugin to update a
[composer](https://getcomposer.org/) package for php.

| Step               | Description                                  |
| ------------------ | -------------------------------------------- |
| `verifyConditions` | Verify the presence of a composer.json file. |
| `prepare`          | Update the `composer.json` version           |

## Install

```bash
$ npm install @ambimax/semantic-release-composer -D
```

## Usage

The plugin can be configured in the
[**semantic-release** configuration file](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration):

```json
{
  "tagFormat": "${version}",
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@ambimax/semantic-release-composer"
  ]
}
```

## Configuration

### Options

| Options                     | Description                                | Default |
| --------------------------- | ------------------------------------------ | ------- |
| `skipOnMissingComposerJson` | Silently ignore missing composer.json file | `false` |

### Examples

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/github",
    [
      "@semantic-release/changelog",
      {
        "changelogFile": "CHANGELOG.md"
      }
    ],
    [
      "@ambimax/semantic-release-composer",
      {
        "skipOnMissingComposerJson": true
      }
    ],
    [
      "@semantic-release/git",
      {
        "assets": ["composer.json", "CHANGELOG.md"],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ]
  ]
}
```

## Author

- [Tobias Schifftner](https://www.twitter.com/tschifftner)
