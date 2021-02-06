import { useCallback, useEffect } from "react";
import { ContextAction, SyncStateAction, asSyncStateAction } from "..";

/**
 * Use this method to consume post messages with SyncStateActions
 * @param callback callback which will be called dispatch gets called
 */
export const useHybridWebAppConsumeSyncStateActionPostMessages = <
    T extends ContextAction
>(
    onMessage: (action: SyncStateAction<T>) => Promise<void> | void,
    isActionTypeguard: (data: any) => data is T,
    options?: { onError?: (error: any) => Promise<void> | void }
) => {
    const { onError } = options || {};
    const postMessageCallback = useCallback(
        (event: MessageEvent) => {
            try {
                const { data, origin, source } = event;
                if (origin !== window.location.origin) {
                    console.debug("Processing posted event: Origin differs", {
                        eventOrigin: origin,
                    });
                    return;
                }
                if (source !== window) {
                    console.debug("Processing posted event: Source differs", {
                        eventOrigin: origin,
                    });
                    return;
                }

                const action = asSyncStateAction(data, isActionTypeguard);
                if (action !== null) {
                    onMessage(action);
                }
            } catch (err) {
                console.error("Processing post event failed", { error: err });
                if (onError) {
                    onError(err);
                }
            }
        },
        [isActionTypeguard, onError, onMessage]
    );

    const registerCallback = useCallback(() => {
        try {
            window.addEventListener("message", postMessageCallback, undefined);
        } catch (err) {
            console.warn("Failed to register message events on window", {
                error: err,
            });
        }
        try {
            // for iOS
            (document as any).addEventListener("message", postMessageCallback);
        } catch (err) {
            console.warn(
                "Failed to register message events on document (iOS)",
                {
                    error: err,
                }
            );
        }

        return () => {
            try {
                window.removeEventListener(
                    "message",
                    postMessageCallback,
                    undefined
                );
            } catch (err) {
                console.warn("Failed to unregister message events on window", {
                    error: err,
                });
            }
            try {
                // for iOS
                (document as any).removeEventListener(
                    "message",
                    postMessageCallback
                );
            } catch (err) {
                console.warn(
                    "Failed to unregister message events on document (iOS)",
                    {
                        error: err,
                    }
                );
            }
        };
    }, [postMessageCallback]);

    useEffect(() => {
        console.debug("Register message event callback");
        return registerCallback();
    }, [registerCallback]);
};

/**
 * @see {@link useHybridWebAppConsumeSyncStateActionPostMessages} this is actual only an alias
 */
export const useConsumeSyncStateActionPostMessages = useHybridWebAppConsumeSyncStateActionPostMessages;
