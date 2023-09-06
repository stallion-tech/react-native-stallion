import React from 'react';
import { Modal, SafeAreaView, StyleSheet, View } from 'react-native';

import Login from '../login';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import { HEADER_TITLE } from '../../../constants/appConstants';

import { COLORS } from '../../../constants/colors';
import Listing from '../listing';
import useStallionModal from './hooks/useStallionModal';
import OverlayLoader from '../../../components/common/OverlayLoader';
import ProfileOverlay from '../../common/ProfileOverlay';

const StallionModal: React.FC = () => {
  const {
    userState,
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
    showProfileSection,
    closeProfileSection,
    presentProfileSection,
    performLogout,
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
            userName={showProfileSection ? null : userState.data?.fullName}
            title={loginRequired ? null : HEADER_TITLE}
            onClosePress={onClosePress}
            onBackPress={isBackEnabled ? onBackPress : null}
            onProfilePress={presentProfileSection}
          />
          <View style={styles.listingSection}>
            {loginRequired ? <Login /> : <Listing />}
            {isDownloading ? (
              <OverlayLoader currentDownloadFraction={downloadProgress} />
            ) : null}
            {showProfileSection ? (
              <ProfileOverlay
                fullName={userState.data?.fullName}
                email={userState.data?.email}
                onBackPress={closeProfileSection}
                onLogoutPress={performLogout}
              />
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
