import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import {
  DOWNLOADING_TEXT,
  STD_MARGIN,
} from '../../../core/constants/appConstants';
import { COLORS } from '../../../core/constants/colors';

interface IOverlayLoader {
  currentDownloadFraction: number;
}

const PROGRESS_BAR_HEIGHT = STD_MARGIN;

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

const styles = StyleSheet.create({
  loaderContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.black7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressOuter: {
    width: '80%',
    height: PROGRESS_BAR_HEIGHT,
    borderRadius: PROGRESS_BAR_HEIGHT / 2,
    backgroundColor: COLORS.black7,
    justifyContent: 'flex-start',
    flexDirection: 'row',
    margin: STD_MARGIN,
  },
  progressInner: {
    height: PROGRESS_BAR_HEIGHT,
    borderRadius: PROGRESS_BAR_HEIGHT / 2,
    backgroundColor: COLORS.indigo,
  },
  downloadingText: {
    color: COLORS.white,
    fontSize: STD_MARGIN * 2,
  },
});

export default OverlayLoader;
