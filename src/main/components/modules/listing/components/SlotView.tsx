import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { COLORS } from '../../../../constants/colors';
import { IStallionSlotData } from '../../../../../types/meta.types';
import {
  NATIVE_CONSTANTS,
  STD_MARGIN,
} from '../../../../constants/appConstants';

interface IStallionSlot {
  title: string;
  hash: string;
  isActive: boolean;
}

const StallionSlot: React.FC<IStallionSlot> = ({ title, hash, isActive }) => {
  return (
    <View
      style={[
        styles.centerContainer,
        styles.slotItem,
        {
          backgroundColor: isActive ? COLORS.green : COLORS.black7,
        },
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      {hash ? <Text style={styles.subtitle}>{hash}</Text> : null}
    </View>
  );
};

const SlotView: React.FC<IStallionSlotData> = (props) => {
  const { currentSlot, temp, stable } = props;
  const activeSlot = currentSlot as unknown as string;
  return (
    <View style={styles.centerContainer}>
      {temp ? (
        <StallionSlot
          title={NATIVE_CONSTANTS.TEMP_FOLDER_SLOT}
          hash={temp}
          isActive={activeSlot === NATIVE_CONSTANTS.TEMP_FOLDER_SLOT}
        />
      ) : null}
      {props.new ? (
        <StallionSlot
          title={NATIVE_CONSTANTS.NEW_FOLDER_SLOT}
          hash={props.new}
          isActive={activeSlot === NATIVE_CONSTANTS.NEW_FOLDER_SLOT}
        />
      ) : null}
      {stable ? (
        <StallionSlot
          title={NATIVE_CONSTANTS.STABLE_FOLDER_SLOT}
          hash={stable}
          isActive={activeSlot === NATIVE_CONSTANTS.STABLE_FOLDER_SLOT}
        />
      ) : null}
      <StallionSlot
        title={NATIVE_CONSTANTS.DEFAULT_FOLDER_SLOT}
        hash={''}
        isActive={activeSlot === NATIVE_CONSTANTS.DEFAULT_FOLDER_SLOT}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    padding: STD_MARGIN,
    width: '100%',
  },
  slotItem: {
    width: '80%',
    borderWidth: 1,
    borderColor: COLORS.black5,
  },
  title: { fontSize: 14, fontWeight: '500', color: COLORS.white },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default SlotView;
