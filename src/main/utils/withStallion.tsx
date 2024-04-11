import React, { ComponentType } from 'react';

import GlobalProvider from '../state';
import ErrorBoundary from './ErrorBoundary';
import SharedDataManager from './SharedDataManager';

import StallionModal from '../components/modules/modal/StallionModal';

import { IStallionInitParams } from '../../types/utils.types';

const withStallion = <T,>(
  BaseComponent: ComponentType<T>,
  initPrams?: IStallionInitParams
) => {
  SharedDataManager.getInstance()?.setInitProjectId(initPrams?.projectId || '');
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
