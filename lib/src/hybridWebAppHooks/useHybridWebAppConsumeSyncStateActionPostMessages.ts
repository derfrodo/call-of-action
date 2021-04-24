import { useCallback, useEffect } from "react";
import type { PostMessageCallbackoptions } from "../types/PostMessageCallbackoptions";
import type { ActionTypeguard } from "../types/ActionTypeguard";
import type { ContextAction } from "../types/ContextAction";
import type { SyncStateAction } from "../types/SyncStateAction";
import { usePostMessageCallback } from "./usePostMessageCallback";

type HybridWebAppConsumeSyncStateActionPostMessagesOptions = PostMessageCallbackoptions;

type UseHybridWebAppConsumeSyncStateActionPostMessages = <
    T extends ContextAction
>(
    onMessage: (action: SyncStateAction<T>) => Promise<void> | void,
    isActionTypeguard: ActionTypeguard<T>,
    options?: HybridWebAppConsumeSyncStateActionPostMessagesOptions
) => void;

/**
 * Use this method to consume post messages with SyncStateActions
 * @param callback callback which will be called dispatch gets called
 */
export const useHybridWebAppConsumeSyncStateActionPostMessages: UseHybridWebAppConsumeSyncStateActionPostMessages = <
    T extends ContextAction
>(
    onMessage: (action: SyncStateAction<T>) => Promise<void> | void,
    isActionTypeguard: ActionTypeguard<T>,
    options?: HybridWebAppConsumeSyncStateActionPostMessagesOptions
) => {
    const postMessageCallback = usePostMessageCallback(
        onMessage,
        isActionTypeguard,
        options
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((document as unknown) as any).addEventListener(
                "message",
                postMessageCallback
            );
        } catch (err) {
            console.warn(
                "Failed to register message events on document (iOS)",
                {
                    error: err,
                }
            );
        }

        return (): void => {
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ((document as unknown) as any).removeEventListener(
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
