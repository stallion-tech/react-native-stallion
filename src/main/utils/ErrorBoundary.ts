import { Component, ErrorInfo } from 'react';

import { toggleStallionSwitchNative } from './StallionNaitveModule';

class ErrorBoundary extends Component {
  componentDidCatch(_: Error, errorInfo: ErrorInfo): void {
    console.error(
      'Exception occured in js layer:',
      errorInfo,
      ', turning off stallion switch'
    );
    toggleStallionSwitchNative(false);
  }
  render() {
    return this.props.children;
  }
}

export default ErrorBoundary;
