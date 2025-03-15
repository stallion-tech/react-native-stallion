import React, { ComponentType } from 'react';

import GlobalProvider from '../state';
import ErrorBoundary from './ErrorBoundary';

import StallionModal from '../components/modules/modal/StallionModal';

const withStallion = <T,>(BaseComponent: ComponentType<T>) => {
  const StallionProvider: React.FC<T> = ({ children, ...props }) => {
    return (
      <ErrorBoundary>
        <GlobalProvider>
          <BaseComponent {...(props as T)}>{children}</BaseComponent>
          <StallionModal />
        </GlobalProvider>
      </ErrorBoundary>
    );
  };
  return StallionProvider;
};

export default withStallion;
