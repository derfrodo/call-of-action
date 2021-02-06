import { useCallback } from "react";
import {
    ContextAction,
    SyncStateAction,
    SYNC_STATE_ACTION_SOURCE_WEBAPP,
} from "..";
import { useConsumeSyncStateActionPostMessages } from "./useHybridWebAppConsumeSyncStateActionPostMessages";

/**
 * Use this method to consume post messages and dispatch them using given parameters
 * @param callback callback which will be called dispatch gets called
 */
export const useHybridWebAppDispatchOnPostMessages = <T extends ContextAction>(
    dispatch: React.Dispatch<T>,
    isActionTypeguard: (data: any) => data is T,
    options?: { onError?: (error: any) => Promise<void> | void }
) => {
    const { onError } = options || {};
    const callback = useCallback(
        (action: SyncStateAction<T>) => {
            try {
                if (
                    action &&
                    action.source !== SYNC_STATE_ACTION_SOURCE_WEBAPP
                ) {
                    dispatch(action.payload);
                }
            } catch (err) {
                console.error("Processing post event for dispatch failed", {
                    error: err,
                });
                if (onError) {
                    onError(err);
                }
            }
        },
        [dispatch, onError]
    );
    useConsumeSyncStateActionPostMessages(callback, isActionTypeguard, options);
};

/**
 * @see {@link useHybridWebAppDispatchOnPostMessages} this is actual only an alias
 */
export const useDispatchOnPostMessages = useHybridWebAppDispatchOnPostMessages;
