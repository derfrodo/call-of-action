import { useCallback, useEffect } from "react";
import {
    ContextAction,
    PostMessageToReactNativeContext,
    OnContextDispatchWillBeCalled,
    createSyncStateAction,
    SYNC_STATE_ACTION_SOURCE_WEBAPP,
} from "..";
import { WpfWebviewWindow } from "../types/WpfWebviewWindow";

/**
 * Use this method to invoke wpf webview with sync state actions
 * @param callback callback which will be called dispatch gets called
 */
export const useHybridWebAppInvokeWpfWebViewOnDispatch = <
    T extends ContextAction
>(
    context: PostMessageToReactNativeContext<T>,
    options?: { onError?: (error: any) => Promise<void> | void }
) => {
    const { onError } = options || {};
    const onDispatch = useCallback<OnContextDispatchWillBeCalled<T>>(
        (action) => {
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
                    console.error("Failed to notify wpf frame", { error: err });
                    if (onError) {
                        onError(err);
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
 * @see {@link useHybridWebAppInvokeWpfWebViewOnDispatch} this is actual only an alias
 */
export const useInvokeWpfWebViewOnDispatch = useHybridWebAppInvokeWpfWebViewOnDispatch;
