import React from 'react';
import { View } from 'react-native';

import AppHeader from './components/AppHeader';
import DetailHeader from './components/DetailHeader';
import ErrorBanner from './components/ErrorBanner';
import ModeToggle from './components/ModeToggle';

import BundleHistory from './screens/BundleHistory';
import Production from './screens/Production';
import TestingBuckets from './screens/TestingBuckets';

import styles from './styles';

interface IDevMenu {
  isTesting: boolean;
  isBundleHistory: boolean;
  bucketTitle: string;
  bucketSubtitle: string;
  downloadError?: string | null;
  onBackPress: () => void;
  onClosePress: () => void;
  onTabChange: (isTesting: boolean) => void;
}

const DevMenu: React.FC<IDevMenu> = ({
  isTesting,
  isBundleHistory,
  bucketTitle,
  bucketSubtitle,
  downloadError,
  onBackPress,
  onClosePress,
  onTabChange,
}) => (
  <View style={styles.root}>
    <View style={styles.headerSafeArea}>
      {isBundleHistory ? (
        <DetailHeader
          title={bucketTitle}
          subtitle={bucketSubtitle}
          onBackPress={onBackPress}
          onClosePress={onClosePress}
        />
      ) : (
        <>
          <AppHeader onClosePress={onClosePress} />
          <View style={styles.toggleArea}>
            <ModeToggle isTesting={isTesting} onChange={onTabChange} />
          </View>
        </>
      )}
    </View>
    {downloadError ? (
      <View style={styles.bannerWrapper}>
        <ErrorBanner message={downloadError} />
      </View>
    ) : null}
    {/* Touches the bottom of the sheet, so it absorbs the home-indicator inset. */}
    <View style={styles.content}>
      {isBundleHistory ? (
        <BundleHistory />
      ) : isTesting ? (
        <TestingBuckets />
      ) : (
        <Production />
      )}
    </View>
  </View>
);

export default DevMenu;
