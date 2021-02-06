import { useCallback } from "react";
import { ContextAction, SyncStateAction, SYNC_STATE_ACTION_SOURCE_WEBAPP } from "..";
import { useReactNativeWebViewOnMessage } from "./useHybridReactNativeWebViewOnMessage";

export const useHybridReactNativeDispatchOnWebViewOnMessage = <
    T extends ContextAction
>(
    dispatch: React.Dispatch<T>,
    isActionTypeguard: (data: any) => data is T,
    options?: { onError?: (error: any) => Promise<void> | void }
) => {
    const { onError } = options || {};
    const callback = useCallback(
        (action: SyncStateAction<T>) => {
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
