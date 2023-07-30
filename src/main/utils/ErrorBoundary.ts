import { Component, ErrorInfo } from 'react';

import { toggleStallionSwitchNative } from './StallionNaitveUtils';

class ErrorBoundary extends Component {
  componentDidCatch(_: Error, errorInfo: ErrorInfo): void {
    toggleStallionSwitchNative(false);
    console.error(
      'Exception occured in js layer:',
      errorInfo,
      ', turning off stallion switch'
    );
  }
  render() {
    return this.props.children;
  }
}

export default ErrorBoundary;
