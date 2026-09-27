import React, { useContext, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import Login from './modules/login';
import DevMenu from './modules/devMenu';
import AppHeader from './modules/devMenu/components/AppHeader';
import useStallionModal from './modules/modal/hooks/useStallionModal';

import { DS_COLORS } from '../constants/designTokens';
import { GlobalContext } from '../state';
import { IStallionDevMenuProps } from '../../types/utils.types';

const StallionDevMenu: React.FC<IStallionDevMenuProps> = ({ onClosePress }) => {
  const {
    actions: { refreshMeta },
  } = useContext(GlobalContext);

  const {
    onBackPress,
    loginRequired,
    isTesting,
    isBundleHistory,
    bucketTitle,
    bucketSubtitle,
    downloadError,
    handleSwitch,
  } = useStallionModal();

  useEffect(() => {
    refreshMeta();
  }, [refreshMeta]);

  return (
    <View style={styles.screen}>
      {loginRequired ? (
        <View style={styles.loginContainer}>
          <AppHeader onClosePress={onClosePress} />
          <View style={styles.loginSection}>
            <Login />
          </View>
        </View>
      ) : (
        <DevMenu
          isTesting={isTesting}
          isBundleHistory={isBundleHistory}
          bucketTitle={bucketTitle}
          bucketSubtitle={bucketSubtitle}
          downloadError={downloadError}
          onBackPress={onBackPress}
          onClosePress={onClosePress}
          onTabChange={handleSwitch}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // The dev menu takes the whole screen; there is no scrim behind it.
  screen: {
    flex: 1,
    backgroundColor: DS_COLORS.screenBg,
  },
  // Login is mode-agnostic — you cannot reach the Testing/Production toggle
  // until you are signed in — so its header stays untinted.
  loginContainer: {
    flex: 1,
    backgroundColor: DS_COLORS.cardBg,
  },
  loginSection: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: DS_COLORS.headerHairline,
  },
});

export default StallionDevMenu;
