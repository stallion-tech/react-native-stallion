import React, { useContext, useMemo, useEffect } from 'react';
import { Text, View } from 'react-native';
import styles from './styles';
import { GlobalContext } from '../../../state';
import SlotView from '../listing/components/SlotView';
import SharedDataManager from '../../../utils/SharedDataManager';

const Prod: React.FC = () => {
  const {
    metaState,
    userState,
    actions: { getUserProfile },
  } = useContext(GlobalContext);
  const uid = useMemo(() => {
    return SharedDataManager.getInstance()?.getUid() || '';
  }, []);
  useEffect(() => {
    if (!userState.data?.email) {
      getUserProfile();
    }
  }, [userState.data, getUserProfile]);
  return (
    <View style={styles.pageContainer}>
      <SlotView {...metaState.prodSlot} />
      <Text style={styles.uidText}>Unique Id:</Text>
      <Text style={styles.uidValue}>{uid}</Text>
    </View>
  );
};

export default Prod;
