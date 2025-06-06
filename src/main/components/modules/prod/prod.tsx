import React, { useContext } from 'react';
import { ScrollView, Text, View } from 'react-native';
import styles from './styles';
import { GlobalContext } from '../../../state';
import MetaCard from '../listing/components/MetaCard';
import ConfigView from '../listing/components/ConfigView';

const Prod: React.FC = () => {
  const { updateMetaState, configState } = useContext(GlobalContext);
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.pageContainer}>
        <ConfigView config={configState} />
        {updateMetaState.currentlyRunningBundle ? (
          <>
            <Text style={styles.cardTitle}>Currently Active Bundle</Text>
            <MetaCard meta={updateMetaState.currentlyRunningBundle} />
          </>
        ) : null}
        {updateMetaState.newBundle ? (
          <>
            <Text style={styles.cardTitle}>New Bundle</Text>
            <MetaCard meta={updateMetaState.newBundle} />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default Prod;
