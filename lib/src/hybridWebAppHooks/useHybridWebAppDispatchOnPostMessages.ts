import { Dispatch, useCallback } from "react";
import { isReturnStatement } from "typescript";
import { SYNC_STATE_ACTION_SOURCE_WEBAPP } from "../constants";
import type { ActionTypeguard } from "../types/ActionTypeguard";
import type { ContextAction } from "../types/ContextAction";
import { PostMessageCallbackoptions } from "../types/PostMessageCallbackoptions";
import type { SyncStateAction } from "../types/SyncStateAction";
import { useConsumeSyncStateActionPostMessages } from "./useHybridWebAppConsumeSyncStateActionPostMessages";

type HybridWebAppDispatchOnPostMessagesOptions = PostMessageCallbackoptions;

type UseHybridWebAppDispatchOnPostMessages = <T extends ContextAction>(
    dispatch: Dispatch<T>,
    isActionTypeguard: ActionTypeguard<T>,
    options?: HybridWebAppDispatchOnPostMessagesOptions
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
    options?: HybridWebAppDispatchOnPostMessagesOptions
) => {
    const { onError, skipSources } = options || {};
    const callback = useCallback(
        (action: SyncStateAction<T>) => {
            try {
                const sourcesToIgnore = skipSources || [
                    SYNC_STATE_ACTION_SOURCE_WEBAPP,
                ];

                if (action) {
                    const { source } = action;
                    for (const src of sourcesToIgnore) {
                        if (source === src) {
                            return;
                        }
                    }
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
