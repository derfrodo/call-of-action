import { useCallback } from "react";
import { SYNC_STATE_ACTION_SOURCE_FRAME } from "../constants";
import { createSyncStateAction } from "../syncState/syncState";
import { ContextAction } from "../types/ContextAction";
import { IPostMessageToReactNativeContext } from "../types/IPostMessageToReactNativeContext";
import { ReactNativeWebViewRef } from "../types/ReactNativeWebViewRef";
import { SharedStateHookOptions } from "../types/SharedStateHookOptions";

type UseHybridReactNativeWebViewOnMessage = <T extends ContextAction>(
    webViewRef: ReactNativeWebViewRef,
    context: IPostMessageToReactNativeContext<T>,
    options?: SharedStateHookOptions
) => void;

export const useHybridReactNativeSendMessageToWebApp = <
    T extends ContextAction
>(
    webViewRef: ReactNativeWebViewRef,
    targetOrigin?: string,
    options?: SharedStateHookOptions
): ((action: T) => Promise<void>) => {
    const createPostMessageJavascriptCode = useCallback((action: T) => {
        const syncStateAction = createSyncStateAction(
            action,
            SYNC_STATE_ACTION_SOURCE_FRAME
        );

        return `window.postMessage(${JSON.stringify(
            JSON.stringify(syncStateAction)
        )}, ${
            typeof targetOrigin === "string"
                ? `"${targetOrigin}"`
                : "window.location.origin"
        })`;
    }, []);

    const { onError } = options || {};
    return useCallback(
        async (action: T) => {
            try {
                const { current } = webViewRef || {};
                if (!current) {
                    console.warn(
                        "Can not inject javascript into webview. No webview has been resolved."
                    );
                } else {
                    const js = createPostMessageJavascriptCode(action);
                    await current.injectJavaScript(js);
                }
            } catch (err) {
                if (onError) {
                    onError(err);
                }
            }
        },
        [createPostMessageJavascriptCode, webViewRef]
    );
};
export const useSendReactNativeMessageToWebApp = useHybridReactNativeSendMessageToWebApp;
