import React, { ComponentType } from 'react';

import GlobalProvider from '../state';
import ErrorBoundary from './ErrorBoundary';

import StallionModal from '../components/modules/modal/StallionModal';
import { IStallionInitParams } from 'src/types/utils.types';

const withStallion = <T,>(
  BaseComponent: ComponentType<T>,
  initPrams?: IStallionInitParams
) => {
  const StallionProvider: React.FC<T> = ({ children, ...props }) => {
    return (
      <ErrorBoundary>
        <GlobalProvider stallionInitParams={initPrams}>
          <BaseComponent {...(props as T)}>{children}</BaseComponent>
          <StallionModal />
        </GlobalProvider>
      </ErrorBoundary>
    );
  };
  return StallionProvider;
};

export default withStallion;
