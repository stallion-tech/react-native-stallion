import React from 'react';
import StallionModal from './components/StallionModal';
import StallionContextProvider from './state/StallionContext';

const withStallion = (BaseComponent: React.ComponentType) => {
  const StallionProvider: React.FC = ({ children, ...props }) => {
    return (
      <StallionContextProvider>
        <BaseComponent {...props}>{children}</BaseComponent>
        <StallionModal />
      </StallionContextProvider>
    );
  };
  return StallionProvider;
};

export default withStallion;
