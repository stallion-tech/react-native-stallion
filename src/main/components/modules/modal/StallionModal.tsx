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
import { SWITCH_STATES } from '../../../../types/meta.types';
import Prod from '../prod';

const StallionModal: React.FC = () => {
  const {
    userState,
    isModalVisible,
    onBackPress,
    onClosePress,
    loginRequired,
    isBackEnabled,
    isDownloading,
    downloadProgress,
    showProfileSection,
    metaState,
    closeProfileSection,
    presentProfileSection,
    performLogout,
    downloadError,
    handleSwitch,
    isRestartRequired,
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
            {loginRequired ? (
              <Login />
            ) : metaState.switchState === SWITCH_STATES.STAGE ? (
              <Listing />
            ) : (
              <Prod />
            )}
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
          {loginRequired || showProfileSection ? null : (
            <Footer
              switchIsOn={metaState.switchState === SWITCH_STATES.STAGE}
              onSwitchToggle={handleSwitch}
              errorMessage={downloadError}
              isRestartRequired={isRestartRequired}
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
