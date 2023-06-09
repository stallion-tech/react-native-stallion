import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface IOverlayLoader {}

const OverlayLoader: React.FC<IOverlayLoader> = () => {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator />
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OverlayLoader;
