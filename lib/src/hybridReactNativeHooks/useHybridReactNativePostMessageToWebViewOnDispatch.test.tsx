import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import {
    OnContextDispatchWillBeCalled,
    PostMessageToReactNativeContext,
    ReactNativeWebViewRef,
} from "../types";
import { SharedStateHookOptions } from "../types/SharedStateHookOptions";
import { useHybridReactNativePostMessageToWebViewOnDispatch } from "./useHybridReactNativePostMessageToWebViewOnDispatch";
import { useSendReactNativeMessageToWebApp } from "./useHybridReactNativeSendMessageToWebApp";

jest.mock("./useHybridReactNativeSendMessageToWebApp", () => ({
    __esModule: true,
    useSendReactNativeMessageToWebApp: jest.fn(),
}));

const useSendReactNativeMessageToWebAppMock = useSendReactNativeMessageToWebApp as jest.MockedFunction<
    typeof useSendReactNativeMessageToWebApp
>;

const makeWrapper = (): React.FC<any> => ({ children }): React.ReactElement => (
    <div>{children}</div>
);
type TestActionClass = { isBubbled?: boolean };

const sendMessageMock = jest.fn();

const getWebViewRef: () => ReactNativeWebViewRef = () => ({
    current: undefined,
});
const getTargetOrigin: () => string = () => "targetOrigin";

describe("Given useHybridWebAppPostMessageToReactNativeOnDispatch", () => {
    beforeEach(() => {
        useSendReactNativeMessageToWebAppMock.mockImplementation(
            () => sendMessageMock
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("when called, then hook calls listenOnDispatchWillBeCalled in context", async () => {
        const context: PostMessageToReactNativeContext<TestActionClass> = {
            dispatch: jest.fn(),
            listenOnDispatchWillBeCalled: jest.fn(),
            removeOnDispatchWillBeCalled: jest.fn(),
        };

        const testOptions: SharedStateHookOptions = {};
        const {} = renderHook(
            () =>
                useHybridReactNativePostMessageToWebViewOnDispatch(
                    getWebViewRef(),
                    context,
                    getTargetOrigin(),
                    testOptions
                ),
            {
                wrapper: makeWrapper(),
            }
        );
        expect(context.listenOnDispatchWillBeCalled).toBeCalledTimes(1);
        expect(context.listenOnDispatchWillBeCalled).toBeCalledWith(
            expect.anything()
        );
    });

    it("when onError changes, then hook calls removeOnDispatchWillBeCalled in context and another listener has been activated", async () => {
        const context: PostMessageToReactNativeContext<TestActionClass> = {
            dispatch: jest.fn(),
            listenOnDispatchWillBeCalled: jest.fn(),
            removeOnDispatchWillBeCalled: jest.fn(),
        };

        const testOptions: SharedStateHookOptions = { onError: jest.fn() };
        const testOptions2: SharedStateHookOptions = { onError: jest.fn() };
        const { rerender } = renderHook(
            (
                args: Parameters<
                    typeof useHybridReactNativePostMessageToWebViewOnDispatch
                >
            ) => useHybridReactNativePostMessageToWebViewOnDispatch(...args),
            {
                wrapper: makeWrapper(),
                initialProps: [
                    getWebViewRef(),
                    context,
                    getTargetOrigin(),
                    testOptions,
                ],
            }
        );
        useSendReactNativeMessageToWebAppMock.mockImplementation(() =>
            jest.fn()
        );

        rerender([getWebViewRef(), context, getTargetOrigin(), testOptions2]);
        expect(context.listenOnDispatchWillBeCalled).toBeCalledTimes(2);
        expect(context.removeOnDispatchWillBeCalled).toBeCalledTimes(1);
        expect(context.removeOnDispatchWillBeCalled).toBeCalledWith(
            expect.anything()
        );
    });
    it("when context changes, then hook calls removeOnDispatchWillBeCalled in context and another listener has been activated", async () => {
        const context: PostMessageToReactNativeContext<TestActionClass> = {
            dispatch: jest.fn(),
            listenOnDispatchWillBeCalled: jest.fn(),
            removeOnDispatchWillBeCalled: jest.fn(),
        };

        const context2: PostMessageToReactNativeContext<TestActionClass> = {
            dispatch: jest.fn(),
            listenOnDispatchWillBeCalled: jest.fn(),
            removeOnDispatchWillBeCalled: jest.fn(),
        };
        const testOptions: SharedStateHookOptions = { onError: jest.fn() };
        const { rerender } = renderHook(
            (
                args: Parameters<
                    typeof useHybridReactNativePostMessageToWebViewOnDispatch
                >
            ) => useHybridReactNativePostMessageToWebViewOnDispatch(...args),
            {
                wrapper: makeWrapper(),
                initialProps: [
                    getWebViewRef(),
                    context,
                    getTargetOrigin(),
                    testOptions,
                ],
            }
        );

        rerender([getWebViewRef(), context2, getTargetOrigin(), testOptions]);
        expect(context.listenOnDispatchWillBeCalled).toBeCalledTimes(1);
        expect(context2.listenOnDispatchWillBeCalled).toBeCalledTimes(1);
        expect(context.removeOnDispatchWillBeCalled).toBeCalledTimes(1);
        expect(context.removeOnDispatchWillBeCalled).toBeCalledWith(
            expect.anything()
        );
    });

    describe("when called and onDispatch is called", () => {
        const context: PostMessageToReactNativeContext<TestActionClass> = {
            dispatch: jest.fn(),
            listenOnDispatchWillBeCalled: jest.fn(),
            removeOnDispatchWillBeCalled: jest.fn(),
        };

        const testOptions: SharedStateHookOptions = {
            onError: jest.fn(),
        };
        let onDispatch: OnContextDispatchWillBeCalled<TestActionClass>;
        beforeEach(() => {
            const {} = renderHook(
                () =>
                    useHybridReactNativePostMessageToWebViewOnDispatch(
                        getWebViewRef(),
                        context,
                        getTargetOrigin(),
                        testOptions
                    ),
                {
                    wrapper: makeWrapper(),
                }
            );
            onDispatch = (context.listenOnDispatchWillBeCalled as jest.MockedFunction<
                typeof context.listenOnDispatchWillBeCalled
            >).mock.calls[0][0];
        });

        it("... and action is bubbled, then callback does nothing", async () => {
            const testAction: TestActionClass = { isBubbled: true };
            onDispatch(testAction);

            expect(sendMessageMock).not.toBeCalled();
        });

        it("... and action is not bubbled, then callback calls send message", async () => {
            const testAction: TestActionClass = { isBubbled: false };
            onDispatch(testAction);

            expect(sendMessageMock).toBeCalledWith(
                expect.objectContaining({ ...testAction, isBubbled: true })
            );
        });
        it("... and action is not bubbled and notify failes, then callback calls onError if present", async () => {
            const testAction: TestActionClass = { isBubbled: false };
            sendMessageMock.mockImplementation(() => {
                throw "TESTERROR";
            });
            onDispatch(testAction);
            expect(testOptions.onError).toBeCalledWith("TESTERROR");
        });
    });
});
