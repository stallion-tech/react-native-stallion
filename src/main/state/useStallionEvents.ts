import { useEffect, useCallback } from 'react';
import { NativeEventEmitter } from 'react-native';
import {
  NativeEventTypesProd,
  STALLION_NATIVE_EVENT,
  NativeEventTypesStage,
} from '../constants/appConstants';
import { stallionEventEmitter } from '../utils/StallionEventEmitter';
import {
  acknowledgeEventsNative,
  onLaunchNative,
  popEventsNative,
} from '../utils/StallionNativeUtils';
import StallionNativeModule from '../../StallionNativeModule';
import { IStallionConfigJson } from '../../types/config.types';
import { useApiClient } from '../utils/useApiClient';
import { API_PATHS } from '../constants/apiConstants';

const REFRESH_META_EVENTS: {
  [key: string]: boolean;
} = {
  [NativeEventTypesProd.DOWNLOAD_COMPLETE_PROD]: true,
  [NativeEventTypesProd.ROLLED_BACK_PROD]: true,
  [NativeEventTypesProd.AUTO_ROLLED_BACK_PROD]: true,
  [NativeEventTypesProd.STABILIZED_PROD]: true,
};

export interface IStallionNativeEventData {
  type: NativeEventTypesProd | NativeEventTypesStage;
  eventId: string;
  eventTimestamp: number;
  releasehash?: string;
  error?: string;
  progress?: string;
}

const STALLION_EVENT_POLLING_INTERVAL = 9000; // 9s

const processStallionEvent = (
  eventString: string
): null | IStallionNativeEventData => {
  try {
    return JSON.parse(eventString) as IStallionNativeEventData;
  } catch (_) {
    return null;
  }
};

export const useStallionEvents = (
  refreshMeta: () => Promise<void>,
  setProgress: (newProgress: number) => void,
  configState: IStallionConfigJson
) => {
  const { getData } = useApiClient(configState);

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(StallionNativeModule);
    eventEmitter.addListener(
      STALLION_NATIVE_EVENT,
      (nativeEventString: string) => {
        console.log(nativeEventString, 'processStallionEvent');
        const eventData = processStallionEvent(nativeEventString);
        if (!eventData) return;

        const eventType = eventData?.type as string;
        if (REFRESH_META_EVENTS[eventType]) {
          requestAnimationFrame(refreshMeta);
        }
        switch (eventType) {
          case NativeEventTypesProd.DOWNLOAD_STARTED_PROD:
          case NativeEventTypesProd.DOWNLOAD_COMPLETE_PROD:
          case NativeEventTypesProd.DOWNLOAD_ERROR_PROD:
          case NativeEventTypesProd.INSTALLED_PROD:
          case NativeEventTypesProd.SYNC_ERROR_PROD:
          case NativeEventTypesProd.ROLLED_BACK_PROD:
          case NativeEventTypesProd.STABILIZED_PROD:
          case NativeEventTypesProd.EXCEPTION_PROD:
          case NativeEventTypesProd.AUTO_ROLLED_BACK_PROD:
            stallionEventEmitter.emit(eventData);
            break;
          case NativeEventTypesStage.DOWNLOAD_PROGRESS_STAGE:
            try {
              const progress = Number(eventData?.progress);
              if (progress) {
                setProgress(progress);
              }
            } catch (_) {}
            break;
        }
      }
    );
    return () => {
      eventEmitter.removeAllListeners(STALLION_NATIVE_EVENT);
    };
  }, [refreshMeta, setProgress]);

  useEffect(() => {
    requestAnimationFrame(() => {
      onLaunchNative('Success');
    });
  }, []);

  const syncStallionEvents = useCallback(
    (stallionEvents: IStallionNativeEventData[]) => {
      if (configState?.projectId) {
        getData(API_PATHS.LOG_EVENTS, {
          projectId: configState.projectId,
          eventData: stallionEvents,
        }).then((res) => {
          if (res?.success) {
            try {
              const eventIds = stallionEvents.map((event) => event.eventId);
              const eventIdString = JSON.stringify(eventIds);
              acknowledgeEventsNative(eventIdString);
            } catch (_) {}
          }
        });
      }
    },
    [getData, configState]
  );

  const popEvents = useCallback(() => {
    popEventsNative().then((eventsString: string) => {
      try {
        const eventsArr: IStallionNativeEventData[] = JSON.parse(eventsString);
        console.log(eventsArr, 'popEventsNative');
        if (eventsArr?.length) {
          syncStallionEvents(eventsArr);
          requestAnimationFrame(refreshMeta);
          setTimeout(popEvents, STALLION_EVENT_POLLING_INTERVAL);
        }
      } catch (_) {}
    });
  }, [syncStallionEvents, refreshMeta]);

  useEffect(() => {
    popEvents();
  }, [popEvents]);
};
