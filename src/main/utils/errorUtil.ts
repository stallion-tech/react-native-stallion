import { DEFAULT_ERROR_MESSAGE } from '../constants/appConstants';

export interface IErrorMessage {
  message?: string;
}

export interface IErrorObject {
  errors?: {
    data?: IErrorMessage[];
  };
}

export const extractError = (errorObject: IErrorObject): string => {
  const errorArray = errorObject?.errors?.data;
  if (errorArray) {
    return (
      errorArray
        .map((errMsgObject) => errMsgObject?.message || '')
        ?.join(', ') || DEFAULT_ERROR_MESSAGE
    );
  } else return DEFAULT_ERROR_MESSAGE;
};
