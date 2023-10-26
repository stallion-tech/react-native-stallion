import { StyleSheet } from 'react-native';

import { HEADER_SLAB_HEIGHT } from '../../../constants/appConstants';

const styles = StyleSheet.create({
  loaderContainer: {
    width: '100%',
    height: HEADER_SLAB_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
