import * as React from 'react';

import { StyleSheet, View, Button, Text } from 'react-native';
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
    'StallionInfo',
    isRestartRequired,
    currentlyRunningBundle,
    newReleaseBundle
  );

  React.useEffect(() => {
    addEventListener((data) => {
      console.log('StallionEvent', data);
    });
  }, []);
  return (
    <View style={styles.container}>
      <Text>Hello world</Text>
      <Button title="OpenModal" onPress={showModal} />
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
