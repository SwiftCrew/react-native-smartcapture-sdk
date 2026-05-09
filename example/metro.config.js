const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const root = path.resolve(__dirname, '..');
const pak = require('../package.json');

const peerDeps = Object.keys({ ...pak.peerDependencies });

/**
 * Metro config tuned for "library + example" monorepo:
 *
 * - `watchFolders` extends to ../ so edits to /src hot-reload into example
 * - Peer deps are blacklisted from the parent so example's copy is the only
 *   one Metro picks up — avoids React/Reanimated duplicate-hook errors.
 */
const config = {
  watchFolders: [root],
  resolver: {
    blockList: peerDeps.map(
      (m) =>
        new RegExp(`^${path.resolve(root, 'node_modules', m).replace(/[/\\]/g, '[/\\\\]')}/.*$`),
    ),
    extraNodeModules: peerDeps.reduce((acc, name) => {
      acc[name] = path.join(__dirname, 'node_modules', name);
      return acc;
    }, {}),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
