import React, { ErrorInfo } from 'react';
import StallionModal from './components/StallionModal';
import StallionContextProvider from './state/StallionContext';

const withStallion = (BaseComponent: React.ComponentType) => {
  const StallionProvider: React.FC = ({ children, ...props }) => {
    return (
      <ErrorBoundary>
        <StallionContextProvider>
          <BaseComponent {...props}>{children}</BaseComponent>
          <StallionModal />
        </StallionContextProvider>
      </ErrorBoundary>
    );
  };
  return StallionProvider;
};

export default withStallion;

class ErrorBoundary extends React.Component {
  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(error, errorInfo, 'Error: Caught in error boundary');
  }
  render(): React.ReactNode {
    return this.props.children;
  }
}
