import * as React from 'react';

import {
  StyleSheet,
  View,
  Button,
  Text,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import {
  withStallion,
  StallionDevMenu,
  useStallionUpdate,
  addEventListener,
  restart,
  ACTIVE_RELEASE_HASH,
} from 'react-native-stallion';

const App: React.FC = () => {
  const [isDevMenuVisible, setIsDevMenuVisible] = React.useState(false);
  const { isRestartRequired, newReleaseBundle } = useStallionUpdate();

  React.useEffect(() => {
    if (isRestartRequired) {
      Alert.alert(
        'New Release installed',
        JSON.stringify(newReleaseBundle),
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Restart', onPress: restart },
        ],
        { cancelable: true }
      );
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
      <Button title="OpenModal" onPress={() => setIsDevMenuVisible(true)} />
      <Text>Active Bundle Hash: {ACTIVE_RELEASE_HASH}</Text>
      {isRestartRequired ? <Text>Restart the app</Text> : null}

      <Modal
        animationType="slide"
        presentationStyle="fullScreen"
        visible={isDevMenuVisible}
        onRequestClose={() => setIsDevMenuVisible(false)}
      >
        <SafeAreaView style={styles.devMenuSafeArea}>
          <StallionDevMenu onClosePress={() => setIsDevMenuVisible(false)} />
        </SafeAreaView>
      </Modal>
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
  devMenuSafeArea: {
    flex: 1,
  },
});
