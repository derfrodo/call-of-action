import { useCallback } from "react";
import { ContextAction, SyncStateAction, asSyncStateAction } from "..";

export const useHybridReactNativeWebViewOnMessage = <T extends ContextAction>(
    onMessage: (action: SyncStateAction<T>) => Promise<void> | void,
    isActionTypeguard: (data: any) => data is T,
    options?: { onError?: (error: any) => Promise<void> | void }
) => {
    const { onError } = options || {};
    const callback = useCallback(
        (event: { nativeEvent: { data: string } }) => {
            try {
                const action = asSyncStateAction(
                    event?.nativeEvent?.data,
                    isActionTypeguard
                );
                if (action !== null) {
                    onMessage(action);
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
