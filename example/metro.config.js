const fs = require('fs');
const path = require('path');
const escape = require('escape-string-regexp');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const pak = require('../package.json');

const root = path.resolve(__dirname, '..');
const rnwPath = fs.realpathSync(
  path.resolve(require.resolve('react-native-windows/package.json'), '..')
);

const modules = Object.keys({
  ...pak.peerDependencies,
});

const config = {
  projectRoot: __dirname,
  watchFolders: [root],

  // We need to make sure that only one version is loaded for peerDependencies
  // So we block them at the root, and alias them to the versions in example's node_modules
  resolver: {
    blockList: modules
      .map(
        (m) =>
          new RegExp(
            `^${escape(path.join(root, 'node_modules', m))}[\\\\/].*$`
          )
      )
      .concat([
        new RegExp(
          `^${escape(path.resolve(__dirname, 'windows'))}[\\\\/].*$`
        ),
        new RegExp(`^${escape(path.join(rnwPath, 'build'))}[\\\\/].*$`),
        new RegExp(`^${escape(path.join(rnwPath, 'target'))}[\\\\/].*$`),
        /.*\.ProjectImports\.zip$/,
      ]),

    extraNodeModules: modules.reduce(
      (acc, name) => {
        acc[name] = path.join(__dirname, 'node_modules', name);
        return acc;
      },
      {'react-native-windows': rnwPath}
    )
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
