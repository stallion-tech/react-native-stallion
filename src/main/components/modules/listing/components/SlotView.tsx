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
          backgroundColor: isActive ? COLORS.green : '',
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color: isActive ? COLORS.white : COLORS.text_major,
          },
        ]}
      >
        {title}
      </Text>
      {hash ? (
        <Text
          numberOfLines={1}
          style={[
            styles.subtitle,
            {
              color: isActive ? COLORS.white : COLORS.text_major,
            },
          ]}
        >
          {hash}
        </Text>
      ) : null}
    </View>
  );
};

const SlotView: React.FC<IStallionSlotData> = (props) => {
  const { currentSlot, temp, stable } = props;
  const activeSlot = currentSlot as unknown as string;
  return (
    <View style={[styles.centerContainer, styles.colContainer]}>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  colContainer: {
    flexDirection: 'column',
  },
  slotItem: {
    width: '100%',
    padding: STD_MARGIN,
    borderBottomColor: COLORS.black2,
    borderBottomWidth: 0.5,
  },
  title: { fontSize: 14, fontWeight: '500', color: COLORS.white },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    width: '70%',
  },
});

export default SlotView;
