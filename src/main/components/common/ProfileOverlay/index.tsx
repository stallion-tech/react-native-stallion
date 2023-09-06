import React, { memo } from 'react';
import { View, Text } from 'react-native';

import styles from './styles';
import {
  BACK_BUTTON_TEXT,
  LOGOUT_BUTTON_TEXT,
  PROFILE_TITLE,
} from '../../../constants/appConstants';
import ButtonFullWidth from '../ButtonFullWidth';

interface IProfileOverlay {
  fullName?: string;
  email?: string;
  onBackPress: () => void;
  onLogoutPress: () => void;
}

const ProfileOverlay: React.FC<IProfileOverlay> = ({
  fullName,
  email,
  onBackPress,
  onLogoutPress,
}) => {
  return (
    <View style={styles.profileContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.profileTitle}>{PROFILE_TITLE}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.profileInfoText}>{fullName}</Text>
        <Text style={styles.profileInfoText}>{email}</Text>
        <View style={styles.buttonContainer}>
          <ButtonFullWidth
            onPress={onLogoutPress}
            buttonText={LOGOUT_BUTTON_TEXT}
          />
        </View>
        <View style={styles.buttonContainer}>
          <ButtonFullWidth
            primary={false}
            onPress={onBackPress}
            buttonText={BACK_BUTTON_TEXT}
          />
        </View>
      </View>
    </View>
  );
};

export default memo(ProfileOverlay);
