import { useCallback, Dispatch } from "react";
import { SYNC_STATE_ACTION_SOURCE_WEBAPP } from "../constants";
import type { ActionTypeguard } from "../types/ActionTypeguard";
import type { ContextAction } from "../types/ContextAction";
import type { ReactNativeOnMessageEvent } from "../types/ReactNativeOnMessageEvent";
import type { SharedStateHookOptions } from "../types/SharedStateHookOptions";
import type { SyncStateAction } from "../types/SyncStateAction";
import { useReactNativeWebViewOnMessage } from "./useHybridReactNativeWebViewOnMessage";

type UseHybridReactNativeDispatchOnWebViewOnMessage = <T extends ContextAction>(
    dispatch: Dispatch<T>,
    isActionTypeguard: ActionTypeguard<T>,
    options?: SharedStateHookOptions
) => (evt: ReactNativeOnMessageEvent) => Promise<void>;

export const useHybridReactNativeDispatchOnWebViewOnMessage: UseHybridReactNativeDispatchOnWebViewOnMessage = (
    dispatch,
    isActionTypeguard,
    options
) => {
    const { onError } = options || {};
    const callback = useCallback(
        (action: SyncStateAction<Parameters<typeof dispatch>[0]>) => {
            try {
                if (
                    action !== null &&
                    action.source === SYNC_STATE_ACTION_SOURCE_WEBAPP
                ) {
                    dispatch(action.payload);
                }
            } catch (err) {
                console.error("Failed to react on sync state action event", {
                    error: err,
                });
                if (onError) {
                    onError(err);
                }
            }
        },
        [dispatch, onError]
    );

    return useReactNativeWebViewOnMessage(callback, isActionTypeguard, options);
};

export const useDispatchOnReactNativeWebViewOnMessage = useHybridReactNativeDispatchOnWebViewOnMessage;
