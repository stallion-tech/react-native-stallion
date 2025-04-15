import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { COLORS } from '../../../../constants/colors';

interface ICardDescriptionContent {
  title: string;
  subtitle: string | number;
  bottomGap?: number;
}
const CardDescriptionContent: React.FC<ICardDescriptionContent> = ({
  title,
  subtitle,
  bottomGap,
}) => {
  return (
    <View style={[styles.centerContainer, { marginBottom: bottomGap }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.grey_color,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary_white,
  },
});

export default CardDescriptionContent;
