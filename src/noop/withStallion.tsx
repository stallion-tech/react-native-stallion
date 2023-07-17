import React, { ComponentType } from 'react';

import { IWithStallion } from '@stallionTypes/utils.types';

const withStallion: IWithStallion = <T,>(BaseComponent: ComponentType<T>) => {
  const StallionProvider: React.FC<T> = ({ children, ...props }) => {
    return <BaseComponent {...(props as T)}>{children}</BaseComponent>;
  };
  return StallionProvider;
};

export default withStallion;
