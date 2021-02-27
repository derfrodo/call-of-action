import {
    SYNC_STATE_ACTION_TYPE,
    SYNC_STATE_ACTION_SOURCE_WEBAPP,
    SYNC_STATE_ACTION_SOURCE_FRAME,
} from "../constants";
import type { SyncStateAction, SyncActionSources } from "../types";
import type { ActionTypeguard } from "../types/ActionTypeguard";

export const isSyncStateAction = <T>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any,
    payloadTypeGuard: ActionTypeguard<T>
): obj is SyncStateAction<T> => {
    return (
        typeof obj === "object" &&
        obj !== null &&
        obj.type === SYNC_STATE_ACTION_TYPE &&
        (obj.source === SYNC_STATE_ACTION_SOURCE_WEBAPP ||
            obj.source === SYNC_STATE_ACTION_SOURCE_FRAME) &&
        payloadTypeGuard(obj.payload)
    );
};

export const asSyncStateAction = <T>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any,
    payloadTypeGuard: ActionTypeguard<T>
): SyncStateAction<T> | null => {
    try {
        const fromObj = isSyncStateAction(obj, payloadTypeGuard) ? obj : null;
        try {
            if (fromObj === null && typeof obj === "string") {
                const parsed = JSON.parse(obj);
                const fromStr = isSyncStateAction(parsed, payloadTypeGuard)
                    ? parsed
                    : null;
                return fromStr;
            }
        } catch (err) {
            console.debug("Failed to parse object with JSON", { error: err });
        }
        return fromObj;
    } catch (err) {
        console.debug("Failed to parse object to SyncStateAction", {
            error: err,
        });
    }
    return null;
};

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
