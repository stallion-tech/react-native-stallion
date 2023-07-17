import React, { ComponentType } from 'react';

import GlobalProvider from '@main/state';
import StallionModal from '@main/components/modules/modal/StallionModal';

const withStallion = <T,>(BaseComponent: ComponentType<T>) => {
  const StallionProvider: React.FC<T> = ({ children, ...props }) => {
    return (
      <GlobalProvider>
        <BaseComponent {...(props as T)}>{children}</BaseComponent>
        <StallionModal />
      </GlobalProvider>
    );
  };
  return StallionProvider;
};

export default withStallion;
