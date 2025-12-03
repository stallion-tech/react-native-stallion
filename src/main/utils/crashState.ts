/**
 * Simple module-level state to track if a JS crash has occurred.
 * This is used to prevent onLaunchNative from being called if a crash
 * was caught by ErrorBoundary.
 */
let hasCrashOccurred = false;

export const setCrashOccurred = (): void => {
  hasCrashOccurred = true;
};

export const hasCrashOccurredCheck = (): boolean => {
  return hasCrashOccurred;
};

export const resetCrashState = (): void => {
  hasCrashOccurred = false;
};
