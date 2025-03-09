import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { COLORS } from '../../../../constants/colors';
import { STD_MARGIN } from '../../../../constants/appConstants';

interface ICardDescriptionContent {
  title: string;
  subtitle: string | number;
}
const CardDescriptionContent: React.FC<ICardDescriptionContent> = ({
  title,
  subtitle,
}) => {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: { justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: STD_MARGIN * 1.3,
    fontWeight: '500',
    color: COLORS.black7,
  },
  subtitle: {
    fontSize: STD_MARGIN * 1.1,
    fontWeight: '600',
    marginTop: 5,
    color: COLORS.black,
  },
});

export default CardDescriptionContent;
