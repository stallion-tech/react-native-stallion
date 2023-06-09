import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import {
  FOOTER_INFO_SUBTITLE,
  FOOTER_INFO_TITLE,
  HEADER_SLAB_HEIGHT,
  SWITCH_TITLE,
  STD_MARGIN,
} from '../../constants/appConstants';
import { COLORS } from '../../constants/colors';

interface IFooter {
  switchIsOn?: boolean;
  onSwitchToggle?: (newSwitchStatus: boolean) => void;
  activeBundle?: {
    bucketName: string;
    version: string;
  };
  errorMessage?: string | null;
}

const Footer: React.FC<IFooter> = ({
  switchIsOn,
  onSwitchToggle,
  activeBundle,
  errorMessage,
}) => {
  const handleToggle = useCallback(() => {
    onSwitchToggle?.(!switchIsOn);
  }, [switchIsOn, onSwitchToggle]);
  return (
    <>
      {errorMessage ? (
        <View style={styles.errorInfoSection}>
          <Text style={styles.errTxt}>{errorMessage}</Text>
        </View>
      ) : null}
      <View style={styles.footerContainer}>
        {activeBundle?.bucketName ? (
          <>
            <View>
              <Text style={styles.infoTitle}>
                <Text style={styles.bold}>{FOOTER_INFO_TITLE}</Text>
                {activeBundle?.bucketName}
              </Text>
              <Text style={styles.infoSubTitle}>
                <Text style={styles.bold}>{FOOTER_INFO_SUBTITLE}</Text>
                {activeBundle?.version}
              </Text>
            </View>
            <View style={styles.actionSection}>
              <Text
                style={[
                  styles.infoTitle,
                  { color: switchIsOn ? 'green' : 'red' },
                ]}
              >
                {SWITCH_TITLE}
                {switchIsOn ? 'Enabled' : 'Disabled'}
              </Text>
              <Switch
                onValueChange={handleToggle}
                value={switchIsOn}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
          </>
        ) : (
          <View style={styles.noDownloadContainer}>
            <Text style={{ alignSelf: 'center' }}>
              No bundle is downloaded yet
            </Text>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  noDownloadContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  errorInfoSection: {
    height: 40,
    margin: 14,
    backgroundColor: COLORS.error,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errTxt: {
    fontSize: 14,
    color: 'white',
  },
  footerContainer: {
    height: 60,
    padding: STD_MARGIN,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  infoTitle: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoSubTitle: {
    fontSize: 12,
  },
  actionSection: {
    alignItems: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
  switchButton: {
    height: HEADER_SLAB_HEIGHT / 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: STD_MARGIN,
    borderRadius: STD_MARGIN,
    backgroundColor: 'red',
  },
  switchButtonText: {
    fontSize: HEADER_SLAB_HEIGHT / 3,
  },
});

export default Footer;
