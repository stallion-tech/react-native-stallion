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
        <View style={[styles.errorInfoSection, styles.shadowContainer]}>
          <Text style={styles.errTxt}>{errorMessage}</Text>
        </View>
      ) : null}
      <View style={[styles.footerContainer, styles.shadowContainer]}>
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
                  switchIsOn ? styles.greenColor : styles.redColor,
                  styles.evenMargin,
                ]}
              >
                {SWITCH_TITLE}
                {switchIsOn ? 'Enabled' : 'Disabled'}
              </Text>
              <Switch onValueChange={handleToggle} value={switchIsOn} />
            </View>
          </>
        ) : (
          <View style={[styles.noDownloadContainer, styles.shadowContainer]}>
            <Text style={styles.selfCenter}>No bundle is downloaded yet</Text>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    shadowOpacity: 0.1,
    shadowOffset: { height: -10, width: 10 },
    shadowRadius: 10,
  },
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
    paddingHorizontal: STD_MARGIN,
    paddingVertical: STD_MARGIN / 2,
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
  switchButtonText: {
    fontSize: HEADER_SLAB_HEIGHT / 3,
  },
  selfCenter: {
    alignSelf: 'center',
  },
  greenColor: {
    color: COLORS.green,
  },
  redColor: {
    color: COLORS.red,
  },
  evenMargin: {
    marginVertical: STD_MARGIN / 4,
  },
});

export default Footer;
