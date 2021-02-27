import {
    SYNC_STATE_ACTION_SOURCE_FRAME,
    SYNC_STATE_ACTION_SOURCE_WEBAPP,
    SYNC_STATE_ACTION_TYPE,
} from "../constants";
import type { SyncStateAction } from "../types";
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
