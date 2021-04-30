import { SYNC_STATE_ACTION_TYPE } from "../constants";
import { SyncStateAction } from "../types";
import type { ActionTypeguard } from "../types/ActionTypeguard";
import { isSyncStateActionSource } from "./isSyncStateActionSource";

export const isSyncStateAction = <T>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any,
    payloadTypeGuard: ActionTypeguard<T>
): obj is SyncStateAction<T> => {
    return (
        typeof obj === "object" &&
        obj !== null &&
        obj.type === SYNC_STATE_ACTION_TYPE &&
        isSyncStateActionSource(obj.source) &&
        payloadTypeGuard(obj.payload)
    );
};
