import React from 'react';
import { Modal, SafeAreaView, StyleSheet, View } from 'react-native';

import Login from '../login';
import Header from '@main/components/common/Header';
import Footer from '@main/components/common/Footer';

import { COLORS } from '@main/constants/colors';
import Listing from '../listing';
import useStallionModal from './hooks/useStallionModal';
import OverlayLoader from '@main/components/common/OverlayLoader';

const StallionModal: React.FC = () => {
  const {
    isModalVisible,
    onBackPress,
    onClosePress,
    loginRequired,
    metaState,
    isBackEnabled,
    activeBucketMeta,
    toggleStallionSwitch,
    isDownloading,
    downloadProgress,
    downloadError,
  } = useStallionModal();
  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isModalVisible}
      onRequestClose={onClosePress}
    >
      {isModalVisible ? (
        <SafeAreaView style={styles.container}>
          <Header
            onClosePress={onClosePress}
            onBackPress={isBackEnabled ? onBackPress : null}
          />
          <View style={styles.listingSection}>
            {loginRequired ? <Login /> : <Listing />}
            {isDownloading ? (
              <OverlayLoader currentDownloadFraction={downloadProgress} />
            ) : null}
          </View>
          {loginRequired ? null : (
            <Footer
              switchIsOn={metaState.switchState}
              activeBundle={activeBucketMeta}
              onSwitchToggle={toggleStallionSwitch}
              errorMessage={downloadError}
            />
          )}
        </SafeAreaView>
      ) : null}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignContent: 'center',
    backgroundColor: COLORS.white,
  },
  listingSection: {
    flex: 1,
  },
});

export default StallionModal;
