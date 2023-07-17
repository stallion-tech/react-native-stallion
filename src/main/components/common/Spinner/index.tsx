import React, { memo } from 'react';
import { ActivityIndicator } from 'react-native';

const Spinner = () => {
  return <ActivityIndicator size={'large'} />;
};

export default memo(Spinner);
