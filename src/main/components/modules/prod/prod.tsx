import React, { useContext, useMemo } from 'react';
import { Text, View } from 'react-native';
import styles from './styles';
import { GlobalContext } from '../../../state';
import SlotView from '../listing/components/SlotView';
import SharedDataManager from '../../../utils/SharedDataManager';

const Prod: React.FC = () => {
  const { metaState } = useContext(GlobalContext);
  const uid = useMemo(() => {
    return SharedDataManager.getInstance()?.getUid() || '';
  }, []);
  return (
    <View style={styles.pageContainer}>
      <SlotView {...metaState.prodSlot} />
      <Text>Unique Id: {uid}</Text>
    </View>
  );
};

export default Prod;
