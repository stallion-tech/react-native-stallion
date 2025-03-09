import React, { useEffect, useMemo, useCallback } from 'react';

import {
  IStallionMeta,
  SLOT_STATES,
  SWITCH_STATES,
} from '../../../types/meta.types';
import {
  IUpdateMetaAction,
  UpdateMetaActionKind,
} from '../../../types/updateMeta.types';
import { API_PATHS } from '../../constants/apiConstants';
import { IUpdateMetaState } from '../reducers/updateMetaReducer';
import { useApiClient } from '../../utils/useApiClient';
import { IStallionConfigJson } from '../../../types/config.types';

const useUpdateMetaActions = (
  updateMetaState: IUpdateMetaState,
  metaState: IStallionMeta,
  updateMetaDispatch: React.Dispatch<IUpdateMetaAction>,
  configState: IStallionConfigJson
) => {
  const { getData } = useApiClient(configState);

  const currentSlot = useMemo<SLOT_STATES | null>(() => {
    if (metaState.switchState === SWITCH_STATES.PROD) {
      return metaState.prodSlot.currentSlot;
    } else if (metaState.switchState === SWITCH_STATES.STAGE) {
      return metaState.stageSlot.currentSlot;
    }
    return null;
  }, [metaState]);

  useEffect(() => {
    if (metaState?.prodSlot?.currentSlot && !updateMetaState?.initialProdSlot) {
      updateMetaDispatch({
        type: UpdateMetaActionKind.SET_INIT_PROD_SLOT,
        payload: metaState?.prodSlot?.currentSlot,
      });
    }
  }, [metaState, updateMetaDispatch, updateMetaState, currentSlot]);

  const currentlyRunningHash = useMemo<string>(() => {
    switch (updateMetaState.initialProdSlot) {
      case SLOT_STATES.DEFAULT:
        return '';
      case SLOT_STATES.NEW:
        return metaState?.prodSlot?.newHash || '';
      case SLOT_STATES.STABLE:
        return metaState?.prodSlot?.stableHash || '';
      default:
        return '';
    }
  }, [metaState.prodSlot, updateMetaState.initialProdSlot]);

  const newReleaseHash = useMemo<string>(() => {
    return metaState.prodSlot?.tempHash || '';
  }, [metaState.prodSlot]);

  const getUpdateMetaData = useCallback(
    (releaseId: string): Promise<any> => {
      return getData(API_PATHS.GET_META_FROM_HASH, {
        projectId: configState.projectId,
        checksum: releaseId,
      });
    },
    [configState, getData]
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
