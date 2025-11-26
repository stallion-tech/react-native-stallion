import React, { useContext } from 'react';
import { Modal, SafeAreaView, StyleSheet, View } from 'react-native';

import Login from '../login';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import { HEADER_TITLE } from '../../../constants/appConstants';

import { COLORS } from '../../../constants/colors';
import Listing from '../listing';
import useStallionModal from './hooks/useStallionModal';
import OverlayLoader from '../../../components/common/OverlayLoader';
import { SWITCH_STATES } from '../../../../types/meta.types';
import Prod from '../prod';
import { GlobalContext } from '../../../state';

const StallionModal: React.FC = () => {
  const {
    isModalVisible,
    actions: { setIsModalVisible },
  } = useContext(GlobalContext);
  return (
    <Modal
      transparent={true}
      animationType="slide"
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
    isBackEnabled,
    isDownloading,
    downloadProgress,
    metaState,
    downloadError,
    handleSwitch,
    internalIsRestartRequired,
  } = useStallionModal();
  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={loginRequired ? null : HEADER_TITLE}
        onClosePress={onClosePress}
        onBackPress={isBackEnabled ? onBackPress : null}
      />
      <View style={styles.listingSection}>
        {loginRequired ? (
          <Login />
        ) : metaState.switchState === SWITCH_STATES.STAGE ? (
          <Listing />
        ) : (
          <Prod />
        )}
        {isDownloading && (
          <OverlayLoader currentDownloadFraction={downloadProgress} />
        )}
      </View>
      {loginRequired ? null : (
        <Footer
          switchIsOn={metaState.switchState === SWITCH_STATES.STAGE}
          onSwitchToggle={handleSwitch}
          errorMessage={downloadError}
          isRestartRequired={internalIsRestartRequired}
        />
      )}
    </SafeAreaView>
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
