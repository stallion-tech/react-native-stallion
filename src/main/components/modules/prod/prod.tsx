import React, { useContext } from 'react';
import { View } from 'react-native';
import styles from './styles';
import { GlobalContext } from '../../../state';
import SlotView from '../listing/components/SlotView';

const Prod: React.FC = () => {
  const { metaState } = useContext(GlobalContext);
  return (
    <View style={styles.pageContainer}>
      <SlotView {...metaState.prodSlot} />
    </View>
  );
};

export default Prod;
