import type { SyncStateAction } from "../types";
import type { ActionTypeguard } from "../types/ActionTypeguard";
import { isSyncStateAction } from "./isSyncStateAction";

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
