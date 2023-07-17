module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        alias: {
          '@main': '../src/main',
          '@noop': '../src/noop',
          '@stallionTypes': '../src/types',
          'react-native-stallion': '../src/index',
        },
      },
    ],
    'jest-hoist',
  ],
};
