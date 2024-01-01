import React, { Component } from 'react';
import { View, StyleSheet, Text, ScrollView, SafeAreaView } from 'react-native';

import Header from '../components/common/Header';
import ButtonFullWidth from '../components/common/ButtonFullWidth';

import {
  getStallionMeta,
  toggleStallionSwitchNative,
} from './StallionNaitveUtils';
import {
  STALLION_EB_BTN_TXT,
  STALLION_EB_INFO,
  STD_MARGIN,
} from '../constants/appConstants';
import { COLORS } from '../constants/colors';

interface IErrorBoundaryProps {}
interface IErrorBoundaryState {
  errorText?: string | null;
}

class ErrorBoundary extends Component<
  IErrorBoundaryProps,
  IErrorBoundaryState
> {
  constructor(props: IErrorBoundaryProps) {
    super(props);
    this.state = {
      errorText: null,
    };
    this.continueCrash = this.continueCrash.bind(this);
  }
  componentDidCatch(error: Error): void {
    getStallionMeta((stallionMeta) => {
      if (stallionMeta?.switchState) {
        toggleStallionSwitchNative(false);
        const errorString: string = [
          error.name,
          error.message,
          error.cause?.toString(),
          error.stack,
        ].join(' ');
        console.error(
          'Exception occured in js layer:',
          error,
          ', turning off the stallion switch'
        );
        this.setState({
          errorText: errorString,
        });
      } else {
        throw error;
      }
    });
  }
  continueCrash() {
    throw new Error(this.state.errorText || '');
  }
  render() {
    if (this.state.errorText) {
      return (
        <SafeAreaView style={styles.ebContainer}>
          <Header />
          <View style={styles.ebContentContainer}>
            <View style={styles.ebInfoTextContainer}>
              <Text style={styles.ebInfoText}>{STALLION_EB_INFO}</Text>
              <ButtonFullWidth
                buttonText={STALLION_EB_BTN_TXT}
                onPress={this.continueCrash}
              />
            </View>
            <ScrollView
              style={styles.ebScrollContainer}
              contentContainerStyle={styles.ebScrollContentContainer}
            >
              <Text style={styles.ebErrorText}>{this.state.errorText}</Text>
            </ScrollView>
          </View>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

const styles = StyleSheet.create({
  ebContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  ebContentContainer: {
    flex: 1,
    paddingHorizontal: STD_MARGIN,
    width: '100%',
  },
  ebInfoTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: STD_MARGIN,
  },
  ebScrollContentContainer: {
    flexGrow: 1,
  },
  ebInfoText: {
    textAlign: 'center',
    marginVertical: STD_MARGIN,
  },
  ebScrollContainer: {
    flex: 1,
    backgroundColor: COLORS.black7,
  },
  ebErrorText: {
    color: COLORS.white,
  },
});
