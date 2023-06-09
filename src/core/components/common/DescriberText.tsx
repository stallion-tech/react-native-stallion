import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native';
import { HEADER_SLAB_HEIGHT, STD_MARGIN } from '../../constants/appConstants';

interface IDescriberText {
  boldTitle: string;
  description: string;
}

const DescriberText: React.FC<IDescriberText> = ({
  boldTitle,
  description,
}) => {
  return (
    <Text style={styles.subText}>
      <Text style={styles.bold}>{boldTitle}</Text>
      {description}
    </Text>
  );
};

const styles = StyleSheet.create({
  subText: {
    fontSize: HEADER_SLAB_HEIGHT / 3,
    marginBottom: STD_MARGIN / 2,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default DescriberText;
