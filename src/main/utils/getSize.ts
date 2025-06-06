const DIGITAL_STORAGE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

export const getDigitalStorageSize = (sizeInBytes: number): string => {
  let digitalStorageUnitIndex = 0;

  while (
    sizeInBytes >= 1024 &&
    digitalStorageUnitIndex < DIGITAL_STORAGE_UNITS.length - 1
  ) {
    sizeInBytes /= 1024;
    digitalStorageUnitIndex++;
  }

  return `${sizeInBytes?.toFixed(2)} ${
    DIGITAL_STORAGE_UNITS?.[digitalStorageUnitIndex]
  }`;
};
