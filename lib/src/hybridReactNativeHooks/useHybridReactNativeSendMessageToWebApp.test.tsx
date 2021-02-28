import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import {
    SYNC_STATE_ACTION_SOURCE_FRAME,
    SYNC_STATE_ACTION_SOURCE_WEBAPP,
} from "../constants/index";
import { createSyncStateAction } from "../syncState/createSyncStateAction";
import { ReactNativeWebViewRef } from "../types";
import { SharedStateHookOptions } from "../types/SharedStateHookOptions";
import { useHybridReactNativeSendMessageToWebApp } from "./useHybridReactNativeSendMessageToWebApp";

jest.mock("../syncState/createSyncStateAction", () => {
    const act = jest.requireActual("../syncState/createSyncStateAction");
    return {
        ...act,
        createSyncStateAction: jest.fn(),
    };
});

const createSyncStateActionMock = createSyncStateAction as jest.MockedFunction<
    typeof createSyncStateAction
>;

const makeWrapper = (): React.FC<any> => ({ children }): React.ReactElement => (
    <div>{children}</div>
);
type TestActionClass = { isBubbled?: boolean };

const getWebViewRef: () => ReactNativeWebViewRef = () => ({
    current: {
        injectJavaScript: jest.fn(),
    },
});
const getTargetOrigin: () => string = () => "targetOrigin";

describe("Given useHybridReactNativeSendMessageToWebApp", () => {
    beforeEach(() => {
        createSyncStateActionMock.mockImplementation(() => ({
            payload: "TESTPAYLOAD",
            source: SYNC_STATE_ACTION_SOURCE_WEBAPP,
            type: "SyncStateAction",
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("when called, then hook returns function", async () => {
        const testOptions: SharedStateHookOptions = {};
        const { result } = renderHook(
            (
                args: Parameters<typeof useHybridReactNativeSendMessageToWebApp>
            ) => useHybridReactNativeSendMessageToWebApp(...args),
            {
                wrapper: makeWrapper(),
                initialProps: [getWebViewRef(), getTargetOrigin(), testOptions],
            }
        );
        expect(typeof result.current).toBe("function");
    });
    describe("when function returned", () => {
        it(" and callback called with action and no webview exists, then onWarn will be called if exists.", async () => {
            const testOptions: SharedStateHookOptions = { onWarn: jest.fn() };
            const wv = { ...getWebViewRef(), current: undefined };
            const { result } = renderHook(
                (
                    args: Parameters<
                        typeof useHybridReactNativeSendMessageToWebApp
                    >
                ) => useHybridReactNativeSendMessageToWebApp(...args),
                {
                    wrapper: makeWrapper(),
                    initialProps: [wv, getTargetOrigin(), testOptions],
                }
            );
            await result.current({
                isBubbled: true,
            });
            expect(testOptions.onWarn).toBeCalledWith(
                expect.objectContaining({
                    code: "NO_WEBVIEW",
                })
            );
        });
        it(" and callback called with action and inject throws error, then onError will be called if exists.", async () => {
            const testOptions: SharedStateHookOptions = { onError: jest.fn() };
            const wv = {
                ...getWebViewRef(),
                current: {
                    injectJavaScript: jest.fn().mockImplementation(() => {
                        throw "TESTERROR";
                    }),
                },
            };
            const { result } = renderHook(
                (
                    args: Parameters<
                        typeof useHybridReactNativeSendMessageToWebApp
                    >
                ) => useHybridReactNativeSendMessageToWebApp(...args),
                {
                    wrapper: makeWrapper(),
                    initialProps: [wv, getTargetOrigin(), testOptions],
                }
            );
            await result.current({
                isBubbled: true,
            });
            expect(testOptions.onError).toBeCalledWith("TESTERROR");
        });
        it(" and callback called with action, then inject javascript will be called.", async () => {
            const testOptions: SharedStateHookOptions = {};
            const wv = getWebViewRef();
            const { result } = renderHook(
                (
                    args: Parameters<
                        typeof useHybridReactNativeSendMessageToWebApp
                    >
                ) => useHybridReactNativeSendMessageToWebApp(...args),
                {
                    wrapper: makeWrapper(),
                    initialProps: [wv, getTargetOrigin(), testOptions],
                }
            );
            await result.current({
                isBubbled: true,
            });
            expect(wv?.current?.injectJavaScript).toBeCalled();
        });
        it(" and callback called with action, then create sync action is called", async () => {
            const testOptions: SharedStateHookOptions = {};
            const wv = getWebViewRef();
            const ta = {
                isBubbled: true,
            };
            const { result } = renderHook(
                (
                    args: Parameters<
                        typeof useHybridReactNativeSendMessageToWebApp
                    >
                ) => useHybridReactNativeSendMessageToWebApp(...args),
                {
                    wrapper: makeWrapper(),
                    initialProps: [wv, undefined, testOptions],
                }
            );
            await result.current(ta);
            expect(createSyncStateActionMock).toBeCalledWith(
                ta,
                SYNC_STATE_ACTION_SOURCE_FRAME
            );
        });
        it(" and callback called with action and no target origin set, then postMessage js will be created with given target origin", async () => {
            const testOptions: SharedStateHookOptions = {};
            const wv = getWebViewRef();
            const { result } = renderHook(
                (
                    args: Parameters<
                        typeof useHybridReactNativeSendMessageToWebApp
                    >
                ) => useHybridReactNativeSendMessageToWebApp(...args),
                {
                    wrapper: makeWrapper(),
                    initialProps: [wv, undefined, testOptions],
                }
            );
            await result.current({
                isBubbled: true,
            });
            expect(wv?.current?.injectJavaScript).toBeCalledWith(
                'window.postMessage("{\\"payload\\":\\"TESTPAYLOAD\\",\\"source\\":\\"WebApp\\",\\"type\\":\\"SyncStateAction\\"}", window.location.origin)'
            );
        });
        it(" and callback called with action and target origin set, then postMessage js will be created with self as origin", async () => {
            const testOptions: SharedStateHookOptions = {};
            const wv = getWebViewRef();
            const to = "TARGETORIGIN";
            const { result } = renderHook(
                (
                    args: Parameters<
                        typeof useHybridReactNativeSendMessageToWebApp
                    >
                ) => useHybridReactNativeSendMessageToWebApp(...args),
                {
                    wrapper: makeWrapper(),
                    initialProps: [wv, to, testOptions],
                }
            );
            await result.current({
                isBubbled: true,
            });
            expect(wv?.current?.injectJavaScript).toBeCalledWith(
                `window.postMessage("{\\"payload\\":\\"TESTPAYLOAD\\",\\"source\\":\\"WebApp\\",\\"type\\":\\"SyncStateAction\\"}", "${to}")`
            );
        });
    });
});
