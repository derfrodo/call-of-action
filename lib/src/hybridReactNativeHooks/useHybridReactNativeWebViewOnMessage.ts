import { useCallback } from "react";
import { asSyncStateAction } from "../syncState/syncState";
import type { ActionTypeguard } from "../types/ActionTypeguard";
import type { ContextAction } from "../types/ContextAction";
import type { ReactNativeOnMessageEvent } from "../types/ReactNativeOnMessageEvent";
import type { SharedStateHookOptions } from "../types/SharedStateHookOptions";
import type { SyncStateActionCallback } from "../types/SyncStateActionCallback";

type UseHybridReactNativeWebViewOnMessage = <T extends ContextAction>(
    onMessage: SyncStateActionCallback<T>,
    isActionTypeguard: ActionTypeguard<T>,
    options?: SharedStateHookOptions
) => (evt: ReactNativeOnMessageEvent) => Promise<void>;

export const useHybridReactNativeWebViewOnMessage: UseHybridReactNativeWebViewOnMessage = (
    onMessage,
    isActionTypeguard,
    options
) => {
    const { onError } = options || {};

    const callback = useCallback<
        (evt: ReactNativeOnMessageEvent) => Promise<void>
    >(
        async (event: ReactNativeOnMessageEvent) => {
            try {
                const action = asSyncStateAction(
                    event?.nativeEvent?.data,
                    isActionTypeguard
                );
                if (action !== null) {
                    await onMessage(action);
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
        [isActionTypeguard, onError, onMessage]
    );
    return callback;
};
export const useReactNativeWebViewOnMessage = useHybridReactNativeWebViewOnMessage;
