const fs = require('fs');
const { execSync } = require("child_process");
const SemanticReleaseError = require('@semantic-release/error');

let verified;

async function verifyConditions(pluginConfig, context) {
  const { cwd, logger } = context;
  const composerJsonFile = `${cwd}/composer.json`;

  if (fs.existsSync(composerJsonFile)) {
    logger.log('composer.json found in %s', cwd);
  } else {
    logger.log(`${composerJsonFile} not found`);
    if (
      typeof pluginConfig.skipOnMissingComposerJson === 'undefined' ||
      !pluginConfig.skipOnMissingComposerJson
    ) {
      throw new SemanticReleaseError(`${composerJsonFile} not found`, 'EVERIFYCONDITIONS');
    }
  }

  verified = true;
  return true;
}

async function prepare(pluginConfig, context) {
  if (!verified) {
    await verifyConditions(pluginConfig, context);
  }

  const {
    cwd,
    nextRelease: { version },
    logger,
  } = context;

  const composerJsonFile = `${cwd}/composer.json`;

  if (!fs.existsSync(composerJsonFile)) {
    logger.log('composer.json not found: Silently skipping...');
    return;
  }

  logger.log('Write version %s to %s', version, composerJsonFile);

  const file = fs.readFileSync(composerJsonFile);
  const data = JSON.parse(file || '{}');
  data.version = version;
  fs.writeFileSync(composerJsonFile, JSON.stringify(data, null, 4));

  logger.log('Prepared composer.json');

  const composerLockFile = `${cwd}/composer.lock`;
  if (fs.existsSync(composerLockFile)) {
    // update lock file with new version
    logger.log('Updating %s for version %s ', composerLockFile, version);

    execSync('composer update --lock', (error, stdout, stderr) => {
      if (error) {
        logger.error(`composer.lock clould not be updated: ${error.message}`);
        return;
      }
      if (stderr) {
        logger.error(`composer.lock clould not be updated: ${stderr}`);
        return;
      }
      logger.log('Updated composer.lock');
    });
  }
  else {
    logger.log('composer.lock not found: skipping...');
  }
}

module.exports = { verifyConditions, prepare };
