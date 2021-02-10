import { useCallback, Dispatch } from "react";
import { SYNC_STATE_ACTION_SOURCE_WEBAPP } from "../constants";
import { useConsumeSyncStateActionPostMessages } from "./useHybridWebAppConsumeSyncStateActionPostMessages";
import type { ActionTypeguard } from "../types/ActionTypeguard";
import type { ContextAction } from "../types/ContextAction";
import type { SharedStateHookOptions } from "../types/SharedStateHookOptions";
import type { SyncStateAction } from "../types/SyncStateAction";

type UseHybridWebAppDispatchOnPostMessages = <T extends ContextAction>(
    dispatch: Dispatch<T>,
    isActionTypeguard: ActionTypeguard<T>,
    options?: SharedStateHookOptions
) => void;

/**
 * Use this method to consume post messages and dispatch them using given parameters
 * @param callback callback which will be called dispatch gets called
 */
export const useHybridWebAppDispatchOnPostMessages: UseHybridWebAppDispatchOnPostMessages = <
    T extends ContextAction
>(
    dispatch: React.Dispatch<T>,
    isActionTypeguard: ActionTypeguard<T>,
    options?: SharedStateHookOptions
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
