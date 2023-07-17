module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        extensions: [
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
          '.android.js',
          '.android.tsx',
          '.ios.js',
          '.ios.tsx',
        ],
        alias: {
          '@main': './src/main',
          '@noop': './src/noop',
          '@stallionTypes': './src/types',
          'react-native-stallion': './src/index',
        },
      },
    ],
    'jest-hoist',
  ],
};
