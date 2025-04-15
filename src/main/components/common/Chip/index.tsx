import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ChipVariant = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
} as const;

type ChipVariantType = (typeof ChipVariant)[keyof typeof ChipVariant];

interface ChipProps {
  label: string;
  variant?: ChipVariantType;
}

const Chip: React.FC<ChipProps> = ({
  label,
  variant = ChipVariant.SUCCESS,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case ChipVariant.SUCCESS:
        return {
          backgroundColor: '#DCFCE7',
          textColor: '#016630',
          borderColor: '#262626',
        };
      case ChipVariant.WARNING:
        return {
          backgroundColor: '#FFF3E0',
          textColor: '#F57C00',
          borderColor: '#FFB74D',
        };
      case ChipVariant.ERROR:
        return {
          backgroundColor: '#FFEBEE',
          textColor: '#D32F2F',
          borderColor: '#EF5350',
        };
      case 'info':
        return {
          backgroundColor: '#E0E0E0',
          textColor: '#1447e6',
          borderColor: '#262626',
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: variantStyles.textColor,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
});

export default Chip;
