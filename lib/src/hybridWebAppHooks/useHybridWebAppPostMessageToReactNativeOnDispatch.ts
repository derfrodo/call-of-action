import { useCallback, useEffect } from "react";
import {
    ContextAction,
    PostMessageToReactNativeContext,
    OnContextDispatchWillBeCalled,
    createSyncStateAction,
    SYNC_STATE_ACTION_SOURCE_WEBAPP,
    ReactNativeWebviewWindow,
} from "..";

/**
 * Use this method to enable post message on non bubbled actions for react native
 * @param callback callback which will be called dispatch gets called
 */
export const useHybridWebAppPostMessageToReactNativeOnDispatch = <
    T extends ContextAction
>(
    context: PostMessageToReactNativeContext<T>,
    options?: { onError?: (error: any) => Promise<void> | void }
) => {
    const { onError } = options || {};
    const onDispatch = useCallback<OnContextDispatchWillBeCalled<T>>(
        (action) => {
            const origin = document.location.origin || window.location.origin;
            if (!action.isBubbled) {
                const syncStateAction = createSyncStateAction(
                    { ...action, isBubbled: true },
                    SYNC_STATE_ACTION_SOURCE_WEBAPP
                );
                window.postMessage(syncStateAction, origin);
                const rnWindow = window as ReactNativeWebviewWindow;
                if (
                    rnWindow.ReactNativeWebView &&
                    rnWindow.ReactNativeWebView.postMessage
                ) {
                    try {
                        rnWindow.ReactNativeWebView.postMessage(
                            JSON.stringify(syncStateAction)
                        );
                    } catch (err) {
                        if (onError) {
                            onError(err);
                        }
                    }
                }
            }
        },
        [onError]
    );
    const {
        listenOnDispatchWillBeCalled,
        removeOnDispatchWillBeCalled,
    } = context;
    useEffect(() => {
        if (onDispatch) {
            listenOnDispatchWillBeCalled(onDispatch);
            return () => {
                removeOnDispatchWillBeCalled(onDispatch);
            };
        }
    }, [
        onDispatch,
        listenOnDispatchWillBeCalled,
        removeOnDispatchWillBeCalled,
    ]);
};

/**
 * @see {@link useHybridWebAppPostMessageToReactNativeOnDispatch} this is actual only an alias
 */
export const usePostMessageToReactNativeOnDispatch = useHybridWebAppPostMessageToReactNativeOnDispatch;
