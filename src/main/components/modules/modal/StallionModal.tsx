import React, { useContext } from 'react';
import { Modal, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';

import Login from '../login';
import Header from '../../../components/common/Header';
import { HEADER_TITLE } from '../../../constants/appConstants';

import { COLORS } from '../../../constants/colors';
import Listing from '../listing';
import useStallionModal from './hooks/useStallionModal';
import { GlobalContext } from '../../../state';
import Home from '../home';

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
    showBucketListing,
  } = useStallionModal();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark_bg} />
      <Header
        title={loginRequired ? null : HEADER_TITLE}
        onClosePress={onClosePress}
        onBackPress={isBackEnabled ? onBackPress : null}
      />
      <View style={styles.listingSection}>
        {loginRequired ? (
          <Login />
        ) : !showBucketListing ? (
          <Home />
        ) : (
          <Listing />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignContent: 'center',
    backgroundColor: COLORS.dark_bg,
  },
  listingSection: {
    flex: 1,
  },
});

export default StallionModal;
