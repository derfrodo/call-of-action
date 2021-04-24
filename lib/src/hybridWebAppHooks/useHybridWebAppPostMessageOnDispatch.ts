import { useCallback, useEffect } from "react";
import { SYNC_STATE_ACTION_SOURCE_WEBAPP } from "../constants";
import { createSyncStateAction } from "../syncState/createSyncStateAction";
import { UseHybridWebAppPostMessageOnDispatchOptions } from "../types";
import type { ContextAction } from "../types/ContextAction";
import type { PostMessageToReactNativeContext } from "../types/IPostMessageToReactNativeContext";
import type { OnContextDispatchWillBeCalled } from "../types/OnContextDispatchWillBeCalled";
import type { ReactNativeWebviewWindow } from "../types/ReactNativeWebviewWindow";

type UseHybridWebAppPostMessageOnDispatch = <T extends ContextAction>(
    context: PostMessageToReactNativeContext<T>,
    options?: UseHybridWebAppPostMessageOnDispatchOptions
) => void;

/**
 * Use this method to enable post message on non bubbled actions for react native
 * @param callback callback which will be called dispatch gets called
 */
export const useHybridWebAppPostMessageOnDispatch: UseHybridWebAppPostMessageOnDispatch = <
    T extends ContextAction
>(
    context: PostMessageToReactNativeContext<T>,
    options?: UseHybridWebAppPostMessageOnDispatchOptions
) => {
    const { onError, syncActionSource } = options || {};
    const onDispatch = useCallback<OnContextDispatchWillBeCalled<T>>(
        (action) => {
            try {
                const origin =
                    document.location.origin || window.location.origin;
                if (!action.isBubbled) {
                    const syncStateAction = createSyncStateAction(
                        { ...action, isBubbled: true },
                        syncActionSource ?? SYNC_STATE_ACTION_SOURCE_WEBAPP
                    );
                    window.postMessage(JSON.stringify(syncStateAction), origin);
                }
            } catch (err) {
                if (onError) {
                    onError(err);
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
 * @see {@link useHybridWebAppPostMessageOnDispatch} this is actual only an alias
 */
export const usePostMessageOnDispatch = useHybridWebAppPostMessageOnDispatch;
