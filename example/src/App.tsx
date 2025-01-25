import * as React from 'react';

import { StyleSheet, View, Button, Text, Alert } from 'react-native';
import {
  withStallion,
  useStallionModal,
  useStallionUpdate,
  addEventListener,
} from 'react-native-stallion';

const App: React.FC = () => {
  const { showModal } = useStallionModal();
  const { isRestartRequired, currentlyRunningBundle, newReleaseBundle } =
    useStallionUpdate();

  console.log(
    isRestartRequired,
    'isRestartRequired',
    currentlyRunningBundle,
    newReleaseBundle
  );

  React.useEffect(() => {
    if (isRestartRequired) {
      Alert.alert('Restart the app', newReleaseBundle?.toString());
    }
  }, [isRestartRequired]);

  React.useEffect(() => {
    addEventListener((data) => {
      // use data
    });
  }, []);
  return (
    <View style={styles.container}>
      <Text>Hello world</Text>
      <Button title="OpenModal" onPress={showModal} />
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
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
