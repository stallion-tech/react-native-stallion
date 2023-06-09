import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

interface IListActionBlock {
  error?: string | null;
  isLoading: boolean;
}

const ListActionBlock: React.FC<IListActionBlock> = ({ error, isLoading }) => {
  return (
    <View style={styles.loaderContainer}>
      {isLoading ? <ActivityIndicator /> : error ? <Text>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ListActionBlock;
