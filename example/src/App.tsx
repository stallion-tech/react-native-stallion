import * as React from 'react';

import { StyleSheet, View, Pressable, Text, Alert } from 'react-native';
import {
  withStallion,
  useStallionModal,
  useStallionUpdate,
  addEventListener,
  restart,
  ACTIVE_RELEASE_HASH,
} from 'react-native-stallion';

const App: React.FC = () => {
  const { showModal } = useStallionModal();
  const { isRestartRequired, newReleaseBundle } = useStallionUpdate();

  // console.log(isRestartRequired, 'isRestartRequired', newReleaseBundle);

  React.useEffect(() => {
    if (isRestartRequired) {
      Alert.alert('New Release installed', JSON.stringify(newReleaseBundle), [
        {
          text: 'Restart',
          onPress: restart,
        },
      ]);
    }
  }, [isRestartRequired, newReleaseBundle]);

  React.useEffect(() => {
    addEventListener((event) => {
      console.log('Stallion event:', event);
      // use data
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text>Hello world</Text>
      <Pressable
        accessibilityRole="button"
        onPress={showModal}
        style={({ pressed }) => [
          styles.openModalButton,
          pressed && styles.openModalButtonPressed,
        ]}
      >
        <Text style={styles.openModalButtonText}>OpenModal</Text>
      </Pressable>
      <Text>Active Bundle Hash: {ACTIVE_RELEASE_HASH}</Text>
      {isRestartRequired ? <Text>Restart the app</Text> : null}
    </View>
  );
};

export default withStallion(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  openModalButton: {
    backgroundColor: '#0067c0',
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  openModalButtonPressed: {
    backgroundColor: '#005a9e',
  },
  openModalButtonText: {
    color: 'white',
    fontSize: 14,
  },
});
