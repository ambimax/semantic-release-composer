const { WritableStreamBuffer } = require('stream-buffers');
const fs = require('fs');

const composerJsonContent = JSON.stringify({
  name: 'ambimax/some-composer-module',
  type: 'magento-module',
  homepage: 'https://www.ambimax.de',
  require: {
    'magento-hackathon/magento-composer-installer': '*',
  },
});

function setupBefore() {
  jest.resetModules();
  // eslint-disable-next-line global-require
  const plugin = require('../src/index');

  const context = {
    cwd: '.',
    env: {},
    stdout: new WritableStreamBuffer(),
    stderr: new WritableStreamBuffer(),
    logger: {
      log: jest.fn(),
      error: jest.fn(),
    },
    nextRelease: {
      version: '1.1.0',
    },
  };

  return { plugin, context };
}

describe('verify step', () => {
  it('verify exception when composer.json does not exist', async () => {
    expect.assertions(1);
    const { plugin, context } = setupBefore();
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    await expect(plugin.verifyConditions({}, context)).rejects.toThrow('./composer.json not found');
  });

  it('silently skip on missing composer.json', async () => {
    expect.assertions(1);
    const { plugin, context } = setupBefore();
    const pluginConfig = {
      skipOnMissingComposerJson: true,
    };
    jest.spyOn(fs, 'existsSync').mockReturnValueOnce(false);
    const result = await plugin.verifyConditions(pluginConfig, context);
    expect(result).toBe(true);
  });

  it('verify composer.json exists', async () => {
    expect.assertions(1);
    const { plugin, context } = setupBefore();
    jest.spyOn(fs, 'existsSync').mockReturnValueOnce(true);
    const result = await plugin.verifyConditions(null, context);
    expect(result).toBe(true);
  });
});

describe('prepare step', () => {
  it('verify exception when composer.json does not exist', async () => {
    expect.assertions(1);
    const { plugin, context } = setupBefore();
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    await expect(plugin.prepare({}, context)).rejects.toThrow('./composer.json not found');
  });

  it('silently skip on missing composer.json', async () => {
    expect.assertions(2);
    const { plugin, context } = setupBefore();
    const pluginConfig = {
      skipOnMissingComposerJson: true,
    };
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    const fsReadMock = jest.spyOn(fs, 'readFileSync');
    const fsWriteMock = jest.spyOn(fs, 'writeFileSync');

    await plugin.prepare(pluginConfig, context);
    expect(fsReadMock).not.toHaveBeenCalled();
    expect(fsWriteMock).not.toHaveBeenCalled();
  });

  it('verify composer.json has right version', async () => {
    expect.assertions(1);
    const { plugin, context } = setupBefore();
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'readFileSync').mockReturnValue(composerJsonContent);
    const finalJson = jest.spyOn(fs, 'writeFileSync');
    finalJson.mockImplementation();
    await plugin.prepare(null, context);

    expect(finalJson).toHaveBeenCalledWith(
      expect.stringContaining('composer.json'),
      expect.stringContaining('"version": "1.1.0"'),
    );
  });
});
