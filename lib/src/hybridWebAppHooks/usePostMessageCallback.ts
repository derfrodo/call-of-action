import { useCallback } from "react";
import { asSyncStateAction } from "../syncState/asSyncStateAction";
import type { ActionTypeguard } from "../types/ActionTypeguard";
import type { ContextAction } from "../types/ContextAction";
import type { PostMessageCallbackoptions } from "../types/PostMessageCallbackoptions";
import type { SyncStateAction } from "../types/SyncStateAction";

type UsePostMessageCallback = <T extends ContextAction>(
    onMessage: (action: SyncStateAction<T>) => Promise<void> | void,
    isActionTypeguard: ActionTypeguard<T>,
    options?: PostMessageCallbackoptions
) => (event: MessageEvent) => void | Promise<void>;

export const usePostMessageCallback: UsePostMessageCallback = <
    T extends ContextAction
>(
    onMessage: (action: SyncStateAction<T>) => Promise<void> | void,
    isActionTypeguard: ActionTypeguard<T>,
    postMessageCallbackOptions?: PostMessageCallbackoptions
) => {
    const {
        onError,
        skipCompareSourceToWindow,
        ignoreDifferentOrigins,
        skipSources,
    } = postMessageCallbackOptions || {};
    const postMessageCallback = useCallback<
        (event: MessageEvent) => void | Promise<void>
    >(
        (event: MessageEvent) => {
            try {
                const { data, origin, source } = event;

                if (
                    ignoreDifferentOrigins !== true &&
                    origin !== window.location.origin
                ) {
                    console.debug("Processing posted event: Origin differs", {
                        currentOrigin: window.location.origin,
                        eventOrigin: origin,
                    });
                    return;
                }

                if (skipCompareSourceToWindow !== true && source !== window) {
                    console.debug("Processing posted event: Source differs", {
                        eventOrigin: origin,
                    });
                    return;
                }

                const action = asSyncStateAction(data, isActionTypeguard);

                if (action !== null) {
                    if (skipSources) {
                        const { source } = action;
                        for (const src of skipSources) {
                            if (source === src) {
                                console.debug(
                                    `Skipping action due to ignored action-source "${action.source}".`,
                                    {
                                        eventOrigin: origin,
                                        action,
                                    }
                                );
                                return;
                            }
                        }
                    }

                    return onMessage(action);
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
    return postMessageCallback;
};
