import { useCallback, useEffect } from "react";
import type { ContextAction } from "../types/ContextAction";
import type { PostMessageToReactNativeContext } from "../types/IPostMessageToReactNativeContext";
import type { OnContextDispatchWillBeCalled } from "../types/OnContextDispatchWillBeCalled";
import type { ReactNativeWebViewRef } from "../types/ReactNativeWebViewRef";
import type { SharedStateHookOptions } from "../types/SharedStateHookOptions";
import { useSendReactNativeMessageToWebApp } from "./useHybridReactNativeSendMessageToWebApp";

type UseHybridReactNativeWebViewOnMessage = <T extends ContextAction>(
    webViewRef: ReactNativeWebViewRef,
    context: PostMessageToReactNativeContext<T>,
    targetOrigin?: string,
    options?: SharedStateHookOptions
) => void;

/**
 * Use this method to enable post message on non bubbled actions for react native
 * @param callback callback which will be called dispatch gets called
 */
export const useHybridReactNativePostMessageToWebViewOnDispatch: UseHybridReactNativeWebViewOnMessage = <
    T extends ContextAction
>(
    webViewRef: ReactNativeWebViewRef,
    context: PostMessageToReactNativeContext<T>,
    targetOrigin?: string,
    options?: SharedStateHookOptions
) => {
    const sendMessage = useSendReactNativeMessageToWebApp(
        webViewRef,
        targetOrigin,
        options
    );
    const { onError } = options || {};
    const onDispatch = useCallback<OnContextDispatchWillBeCalled<T>>(
        async (action: T) => {
            try {
                if (!action.isBubbled) {
                    await sendMessage({ ...action, isBubbled: true });
                }
            } catch (err) {
                if (onError) {
                    onError(err);
                }
            }
        },
        [sendMessage]
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
export const usePostMessageToWebViewOnDispatch = useHybridReactNativePostMessageToWebViewOnDispatch;
