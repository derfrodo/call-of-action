import { SYNC_STATE_ACTION_TYPE } from "../constants";
import type { SyncActionSources, SyncStateAction } from "../types";

export const createSyncStateAction = <T>(
    action: T,
    source: SyncActionSources
): SyncStateAction<T> => {
    return {
        type: SYNC_STATE_ACTION_TYPE,
        source,
        payload: action,
    };
};
