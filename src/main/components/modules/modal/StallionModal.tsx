import React, { useContext } from 'react';
import { Modal, SafeAreaView, StyleSheet, View } from 'react-native';

import Login from '../login';
import DevMenu from '../devMenu';
import AppHeader from '../devMenu/components/AppHeader';

import useStallionModal from './hooks/useStallionModal';
import { DS_COLORS } from '../../../constants/designTokens';
import { GlobalContext } from '../../../state';

const StallionModal: React.FC = () => {
  const {
    isModalVisible,
    actions: { setIsModalVisible },
  } = useContext(GlobalContext);
  return (
    <Modal
      animationType="slide"
      presentationStyle="fullScreen"
      visible={isModalVisible}
      onRequestClose={() => setIsModalVisible(false)}
    >
      {isModalVisible ? <Content /> : null}
    </Modal>
  );
};

const Content: React.FC = () => {
  const {
    onBackPress,
    onClosePress,
    loginRequired,
    isTesting,
    isBundleHistory,
    bucketTitle,
    bucketSubtitle,
    downloadError,
    handleSwitch,
  } = useStallionModal();

  return (
    <View style={styles.screen}>
      {loginRequired ? (
        <SafeAreaView style={styles.loginContainer}>
          <AppHeader onClosePress={onClosePress} />
          <View style={styles.loginSection}>
            <Login />
          </View>
        </SafeAreaView>
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

export default StallionModal;
