import React from 'react';

const withStallion = (BaseComponent: React.ComponentType) => {
  const StallionProvider: React.FC = ({ children, ...props }) => {
    return <BaseComponent {...props}>{children}</BaseComponent>;
  };
  return StallionProvider;
};

export default withStallion;
