import React, { memo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

import { COLORS } from '../../../constants/colors';
import { DOWNLOADING_TEXT } from '../../../constants/appConstants';

import styles from './styles';

interface IOverlayLoader {
  currentDownloadFraction: number;
}

const OverlayLoader: React.FC<IOverlayLoader> = ({
  currentDownloadFraction,
}) => {
  return (
    <View style={styles.loaderContainer}>
      {currentDownloadFraction > 0 ? (
        <>
          <Text style={styles.downloadingText}>{DOWNLOADING_TEXT}</Text>
          <View style={styles.progressOuter}>
            <View
              style={[
                styles.progressInner,
                {
                  width: `${currentDownloadFraction * 100}%`,
                },
              ]}
            />
          </View>
        </>
      ) : (
        <ActivityIndicator color={COLORS.indigo} size={'large'} />
      )}
    </View>
  );
};

export default memo(OverlayLoader);
