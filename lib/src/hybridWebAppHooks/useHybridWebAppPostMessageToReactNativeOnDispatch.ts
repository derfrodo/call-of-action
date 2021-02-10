import { useCallback, useEffect } from "react";
import { SYNC_STATE_ACTION_SOURCE_WEBAPP } from "../constants";
import { createSyncStateAction } from "../syncState/syncState";
import type { ContextAction } from "../types/ContextAction";
import type { PostMessageToReactNativeContext } from "../types/IPostMessageToReactNativeContext";
import type { OnContextDispatchWillBeCalled } from "../types/OnContextDispatchWillBeCalled";
import type { ReactNativeWebviewWindow } from "../types/ReactNativeWebviewWindow";
import type { SharedStateHookOptions } from "../types/SharedStateHookOptions";

type UseHybridWebAppPostMessageToReactNativeOnDispatch = <
    T extends ContextAction
>(
    context: PostMessageToReactNativeContext<T>,
    options?: SharedStateHookOptions
) => void;

/**
 * Use this method to enable post message on non bubbled actions for react native
 * @param callback callback which will be called dispatch gets called
 */
export const useHybridWebAppPostMessageToReactNativeOnDispatch: UseHybridWebAppPostMessageToReactNativeOnDispatch = <
    T extends ContextAction
>(
    context: PostMessageToReactNativeContext<T>,
    options?: SharedStateHookOptions
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
            return (): void => {
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
