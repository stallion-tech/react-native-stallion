import { NativeSyntheticEvent, TextInputChangeEventData } from 'react-native';

export type IWithStallion = (
  BaseComponent: React.ComponentType
) => React.ComponentType;

export interface IStallionConfig {
  isEnabled: boolean;
  projectId: string;
}

export interface IUseStallionModal {
  showModal: () => void;
}

export type TextChangeEventType =
  NativeSyntheticEvent<TextInputChangeEventData>;
