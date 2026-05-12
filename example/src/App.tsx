import * as React from 'react';

import { StyleSheet, View, Button, Text, Alert } from 'react-native';
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
      <Button title="OpenModal" onPress={showModal} />
      <Text>Active Bundle Hash: {ACTIVE_RELEASE_HASH}</Text>
      {isRestartRequired ? <Text>Restart the app</Text> : null}
    </View>
  );
};

export default withStallion(App, {
  baseUrl: 'https://api.stalliontech.io',
});

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
});
