const path = require('path');
const pak = require('../package.json');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
        alias: {
          // So that `import 'react-native-smartcapture-sdk'` inside the example
          // resolves to ../src — single source of truth, no rebuild required.
          [pak.name]: path.join(__dirname, '..', pak.source),
        },
      },
    ],
    // IMPORTANT: reanimated plugin must be listed last.
    'react-native-reanimated/plugin',
  ],
};
