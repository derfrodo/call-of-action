import { useCallback, useEffect } from "react";
import { SYNC_STATE_ACTION_SOURCE_WEBAPP } from "../constants";
import { createSyncStateAction } from "../syncState/createSyncStateAction";
import { ContextAction } from "../types/ContextAction";
import type { PostMessageToReactNativeContext } from "../types/IPostMessageToReactNativeContext";
import type { OnContextDispatchWillBeCalled } from "../types/OnContextDispatchWillBeCalled";
import type { SharedStateHookOptions } from "../types/SharedStateHookOptions";
import type { WpfWebviewWindow } from "../types/WpfWebviewWindow";

type UseHybridWebAppInvokeWpfWebViewOnDispatch = <T extends ContextAction>(
    context: PostMessageToReactNativeContext<T>,
    options?: SharedStateHookOptions
) => void;
/**
 * Use this method to invoke wpf webview with sync state actions
 * @param callback callback which will be called dispatch gets called
 */
export const useHybridWebAppInvokeWpfWebViewOnDispatch: UseHybridWebAppInvokeWpfWebViewOnDispatch = <
    T extends ContextAction
>(
    context: PostMessageToReactNativeContext<T>,
    options?: SharedStateHookOptions
) => {
    const { onError } = options || {};
    const onDispatch = useCallback<OnContextDispatchWillBeCalled<T>>(
        (action) => {
            try {
                if (!action.isBubbled) {
                    const syncStateAction = createSyncStateAction(
                        { ...action, isBubbled: true },
                        SYNC_STATE_ACTION_SOURCE_WEBAPP
                    );
                    const wpfWindow = (window as unknown) as WpfWebviewWindow;
                    try {
                        if (wpfWindow.external) {
                            wpfWindow.external.notify(
                                JSON.stringify(syncStateAction)
                            );
                        }
                    } catch (err) {
                        console.error("Failed to notify wpf frame", {
                            error: err,
                        });
                        if (onError) {
                            onError(err);
                        }
                    }
                }
            } catch (err) {
                console.error("Create sync action failed", { error: err });
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
 * @see {@link useHybridWebAppInvokeWpfWebViewOnDispatch} this is actual only an alias
 */
export const useInvokeWpfWebViewOnDispatch = useHybridWebAppInvokeWpfWebViewOnDispatch;
