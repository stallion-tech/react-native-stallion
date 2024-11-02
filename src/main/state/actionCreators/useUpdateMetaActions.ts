import React, { useState, useEffect, useMemo, useCallback } from 'react';

import {
  IStallionMeta,
  SLOT_STATES,
  SWITCH_STATES,
} from '../../../types/meta.types';
import {
  IUpdateMetaAction,
  UpdateMetaActionKind,
} from '../../../types/updateMeta.types';
import { API_BASE_URL, API_PATHS } from '../../constants/apiConstants';
import SharedDataManager from '../../utils/SharedDataManager';
import { getAppHeaders } from '../../utils/apiUtils';
import { IUpdateMetaState } from '../reducers/updateMetaReducer';

const useUpdateMetaActions = (
  updateMetaState: IUpdateMetaState,
  metaState: IStallionMeta,
  updateMetaDispatch: React.Dispatch<IUpdateMetaAction>
) => {
  const dataManager = SharedDataManager.getInstance();
  const [initialProdSlot, setInitialProdSlot] = useState<SLOT_STATES>();
  const [initialSwitchSlot, setInitialSwitchSlot] = useState<string>();

  const currentSlot = useMemo<SLOT_STATES | null>(() => {
    if (metaState.switchState === SWITCH_STATES.PROD) {
      return metaState.prodSlot.currentSlot;
    } else if (metaState.switchState === SWITCH_STATES.STAGE) {
      return metaState.stageSlot.currentSlot;
    }
    return null;
  }, [metaState]);

  useEffect(() => {
    if (metaState?.prodSlot?.currentSlot && !initialProdSlot) {
      setInitialProdSlot(metaState?.prodSlot?.currentSlot);
    }
    if (!initialSwitchSlot) {
      setInitialSwitchSlot(metaState.switchState + currentSlot);
    }
  }, [
    metaState,
    initialProdSlot,
    setInitialProdSlot,
    initialSwitchSlot,
    setInitialSwitchSlot,
    currentSlot,
  ]);

  useEffect(() => {
    if (initialSwitchSlot) {
      const currentSwitchSlot = metaState.switchState + currentSlot;
      if (initialSwitchSlot !== currentSwitchSlot) {
        updateMetaDispatch({
          type: UpdateMetaActionKind.SET_SLOT_CHANGED,
          payload: true,
        });
      } else {
        updateMetaDispatch({
          type: UpdateMetaActionKind.SET_SLOT_CHANGED,
          payload: false,
        });
      }
    }
  }, [
    metaState.switchState,
    initialSwitchSlot,
    currentSlot,
    updateMetaDispatch,
  ]);

  const currentlyRunningHash = useMemo<string>(() => {
    switch (initialProdSlot) {
      case SLOT_STATES.DEFAULT:
        return '';
      case SLOT_STATES.NEW:
        return metaState?.prodSlot?.new || '';
      case SLOT_STATES.STABLE:
        return metaState?.prodSlot?.stable || '';
      case SLOT_STATES.TEMP:
        return metaState?.prodSlot?.temp || '';
      default:
        return '';
    }
  }, [metaState.prodSlot, initialProdSlot]);

  const newReleaseHash = useMemo<string>(() => {
    return metaState.prodSlot?.temp || '';
  }, [metaState.prodSlot]);

  const getUpdateMetaData = useCallback(
    (releaseId: string): Promise<any> => {
      return fetch(API_BASE_URL + API_PATHS.GET_META_FROM_HASH, {
        method: 'POST',
        body: JSON.stringify({
          projectId: dataManager?.getProjectId(),
          checksum: releaseId,
        }),
        headers: getAppHeaders(),
      }).then((res) => res.json());
    },
    [dataManager]
  );

  useEffect(() => {
    if (currentlyRunningHash && !updateMetaState.currentlyRunningBundle) {
      getUpdateMetaData(currentlyRunningHash).then((res) => {
        if (res.data) {
          updateMetaDispatch({
            type: UpdateMetaActionKind.SET_CURRENTLY_RUNNING_META,
            payload: res.data,
          });
        }
      });
    }
  }, [
    currentlyRunningHash,
    updateMetaState,
    updateMetaDispatch,
    getUpdateMetaData,
  ]);

  useEffect(() => {
    if (newReleaseHash && !updateMetaState.newBundle) {
      getUpdateMetaData(newReleaseHash).then((res) => {
        if (res.data) {
          updateMetaDispatch({
            type: UpdateMetaActionKind.SET_NEW_BUNDLE_META,
            payload: res.data,
          });
        }
      });
    }
  }, [newReleaseHash, updateMetaState, updateMetaDispatch, getUpdateMetaData]);
};

export default useUpdateMetaActions;
