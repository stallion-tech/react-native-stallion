import React, { useCallback, useContext } from 'react';
import { Modal, SafeAreaView, StyleSheet } from 'react-native';

import StallionDevMenu from '../../StallionDevMenu';
import { DS_COLORS } from '../../../constants/designTokens';
import { GlobalContext } from '../../../state';

const StallionModal: React.FC = () => {
  const {
    isModalVisible,
    actions: { setIsModalVisible },
  } = useContext(GlobalContext);

  const onClosePress = useCallback(() => {
    requestAnimationFrame(() => setIsModalVisible(false));
  }, [setIsModalVisible]);

  return (
    <Modal
      animationType="slide"
      presentationStyle="fullScreen"
      visible={isModalVisible}
      onRequestClose={() => setIsModalVisible(false)}
    >
      {isModalVisible ? (
        <SafeAreaView style={styles.safeArea}>
          <StallionDevMenu onClosePress={onClosePress} />
        </SafeAreaView>
      ) : null}
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DS_COLORS.screenBg,
  },
});

export default StallionModal;
