import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { View, Modal, SafeAreaView, StyleSheet } from 'react-native';
import { NO_AUTH_ERROR_MESSAGE } from '../constants/appConstants';

import { StallionContext } from '../state/StallionController';
import useStallionList from '../utils/useStallionList';

import DataList from './common/DataList';
import Footer from './common/Footer';
import Header from './common/Header';
import ListActionBlock from './common/ListActionBlock';
import OverlayLoader from './common/OverlayLoader';
import { COLORS } from '../constants/colors';

const StallionModal: React.FC = () => {
  const {
    fetchBuckets,
    showModal,
    setShowModal,
    stallionMeta,
    toggleStallionSwitch,
    downloadData,
    bucketData,
    authTokens,
  } = useContext(StallionContext);

  const onBackPress = useCallback(() => setShowModal(false), [setShowModal]);

  const { listData, isLoading, listError, handleBucketPress } = useStallionList();

  useEffect(() => {
    if (authTokens) {
      fetchBuckets();
    }
  }, [fetchBuckets, authTokens]);

  const activeBucketName = useMemo<string>(() => {
    const targetBucket = bucketData?.data?.filter(
      (bucket) => bucket?.id === stallionMeta?.activeBucket
    )?.[0];
    return targetBucket?.name || '';
  }, [bucketData, stallionMeta]);

  const noAuthState = useMemo(() => {
    if (authTokens?.apiKey && authTokens?.secretKey) return false;
    return true;
  }, [authTokens]);
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showModal}
      onRequestClose={onBackPress}
    >
      <SafeAreaView style={styles.container}>
        <Header onBackPress={onBackPress} />
        <View style={styles.listingSection}>
          {isLoading || listError ? (
            <ListActionBlock
              isLoading={isLoading}
              error={noAuthState ? NO_AUTH_ERROR_MESSAGE : listError}
            />
          ) : (
            <DataList
              listData={listData}
              handleBucketPress={handleBucketPress}
            />
          )}
          {downloadData?.loading ? <OverlayLoader /> : null}
        </View>
        <Footer
          activeBundle={{
            bucketName: activeBucketName,
            version: stallionMeta?.activeVersion || '',
          }}
          switchIsOn={stallionMeta?.switchState}
          onSwitchToggle={toggleStallionSwitch}
          errorMessage={downloadData?.error}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    backgroundColor: COLORS.background_grey,
  },
  listingSection: {
    flex: 1,
  },
});

export default StallionModal;
