import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import styles from './styles';
import { GlobalContext } from '../../../state';

const Prod: React.FC = () => {
  const { metaState } = useContext(GlobalContext);
  return (
    <View style={styles.pageContainer}>
      <Text style={styles.text}>{JSON.stringify(metaState, null, 4)}</Text>
    </View>
  );
};

export default Prod;
