import React, { useContext, useEffect } from 'react';
import { ScrollView, Text } from 'react-native';
import styles from './styles';
import { GlobalContext } from '../../../state';
import SlotView from '../listing/components/SlotView';
import MetaCard from '../listing/components/MetaCard';

const Prod: React.FC = () => {
  const {
    metaState,
    userState,
    updateMetaState,
    actions: { getUserProfile },
  } = useContext(GlobalContext);
  useEffect(() => {
    if (!userState.data?.email) {
      getUserProfile();
    }
  }, [userState.data, getUserProfile]);
  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <SlotView {...metaState.prodSlot} />
      {updateMetaState.currentlyRunningBundle ? (
        <>
          <Text style={styles.cardTitle}>Currently Running Bundle</Text>
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
  );
};

export default Prod;
