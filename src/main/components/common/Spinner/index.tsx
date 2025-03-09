import React, { memo } from 'react';
import { ActivityIndicator } from 'react-native';
import { COLORS } from '../../../constants/colors';

const Spinner = () => {
  return <ActivityIndicator size={'large'} color={COLORS.black} />;
};

export default memo(Spinner);
