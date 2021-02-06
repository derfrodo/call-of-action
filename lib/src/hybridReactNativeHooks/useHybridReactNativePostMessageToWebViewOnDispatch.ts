import { useCallback, useEffect } from "react";
import { ContextAction, IPostMessageToReactNativeContext, OnContextDispatchWillBeCalled } from "..";
import { ReactNativeWebViewRef } from "../types/ReactNativeWebViewRef";
import { useSendReactNativeMessageToWebApp } from "./useHybridReactNativeSendMessageToWebApp";

/**
 * Use this method to enable post message on non bubbled actions for react native
 * @param callback callback which will be called dispatch gets called
 */
export const useHybridReactNativePostMessageToWebViewOnDispatch = <
    T extends ContextAction
>(
    webViewRef: ReactNativeWebViewRef,
    context: IPostMessageToReactNativeContext<T>
) => {
    const sendMessage = useSendReactNativeMessageToWebApp<T>(webViewRef);
    const onDispatch = useCallback<OnContextDispatchWillBeCalled<T>>(
        (action) => {
            if (!action.isBubbled) {
                sendMessage({ ...action, isBubbled: true });
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
export const usePostMessageToWebViewOnDispatch = useHybridReactNativePostMessageToWebViewOnDispatch;
