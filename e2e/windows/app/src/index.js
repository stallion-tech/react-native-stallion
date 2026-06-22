import React from 'react';
import { AppRegistry, Text, View } from 'react-native';
import { withStallion } from 'react-native-stallion';

const release = global.__STALLION_E2E_RELEASE__ || 'UNKNOWN';
const App = () => React.createElement(View, { style: { flex: 1, alignItems: 'center', justifyContent: 'center' } },
  React.createElement(Text, { testID: 'release-marker', accessibilityLabel: `STALLION_RELEASE_${release}` }, `STALLION_RELEASE_${release}`));
AppRegistry.registerComponent('StallionE2EApp', () => withStallion(App));
