import { useCallback } from "react";
import {
    ContextAction,
    createSyncStateAction,
    SYNC_STATE_ACTION_SOURCE_FRAME,
} from "..";
import { ReactNativeWebViewRef } from "../types/ReactNativeWebViewRef";

export const useHybridReactNativeSendMessageToWebApp = <
    T extends ContextAction
>(
    webViewRef: ReactNativeWebViewRef,
    targetOrigin?: string
) => {
    const postMessageJavascriptCode = useCallback((action: T) => {
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

    return useCallback(
        (action: T) => {
            const { current } = webViewRef || {};
            if (!current) {
                console.warn(
                    "Can not inject javascript into webview. No webview has been resolved."
                );
            } else {
                const js = postMessageJavascriptCode(action);
                current.injectJavaScript(js);
            }
        },
        [postMessageJavascriptCode, webViewRef]
    );
};
export const useSendReactNativeMessageToWebApp = useHybridReactNativeSendMessageToWebApp;
