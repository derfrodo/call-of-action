import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { SYNC_STATE_ACTION_SOURCE_WEBAPP } from "..";
import { useReactNativeWebViewOnMessage } from "./useHybridReactNativeWebViewOnMessage";
import {
    ActionTypeguard,
    PostMessageCallbackoptions,
    SyncStateAction,
} from "../types";
import { SharedStateHookOptions } from "../types/SharedStateHookOptions";
import { useHybridReactNativeDispatchOnWebViewOnMessage } from "./useHybridReactNativeDispatchOnWebViewOnMessage";
import { SYNC_STATE_ACTION_SOURCE_FRAME } from "../constants";

jest.mock("./useHybridReactNativeWebViewOnMessage", () => {
    const act = jest.requireActual("./useHybridReactNativeWebViewOnMessage");
    return {
        ...act,
        useReactNativeWebViewOnMessage: jest.fn(),
    };
});

const useReactNativeWebViewOnMessageMock = useReactNativeWebViewOnMessage as jest.MockedFunction<
    typeof useReactNativeWebViewOnMessage
>;
const onMessageMock = jest.fn();
const makeWrapper = (): React.FC<any> => ({ children }): React.ReactElement => (
    <div>{children}</div>
);
type TestActionClass = { isBubbled?: boolean };

describe("Given useHybridReactNativeDispatchOnWebViewOnMessage", () => {
    beforeEach(() => {
        useReactNativeWebViewOnMessageMock.mockImplementation(
            () => onMessageMock
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("when called, then hook uses useReactNativeWebViewOnMessage", async () => {
        const testOptions: SharedStateHookOptions = {};
        const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
            ActionTypeguard<TestActionClass>
        >;
        const dispatch = jest.fn();
        const {} = renderHook(
            (
                args: Parameters<
                    typeof useHybridReactNativeDispatchOnWebViewOnMessage
                >
            ) => useHybridReactNativeDispatchOnWebViewOnMessage(...args),
            {
                wrapper: makeWrapper(),
                initialProps: [dispatch, isActionTypeguard, testOptions],
            }
        );
        expect(useReactNativeWebViewOnMessageMock).toBeCalled();
    });
    it("when called, then hook returns function", async () => {
        const testOptions: SharedStateHookOptions = {};
        const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
            ActionTypeguard<TestActionClass>
        >;
        const dispatch = jest.fn();
        const { result } = renderHook(
            (
                args: Parameters<
                    typeof useHybridReactNativeDispatchOnWebViewOnMessage
                >
            ) => useHybridReactNativeDispatchOnWebViewOnMessage(...args),
            {
                wrapper: makeWrapper(),
                initialProps: [dispatch, isActionTypeguard, testOptions],
            }
        );
        expect(typeof result.current).toBe("function");
    });

    describe("when called and function returned", () => {
        const dispatch = jest.fn();
        const testOptions: SharedStateHookOptions = { onError: jest.fn() };
        const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
            ActionTypeguard<TestActionClass>
        >;
        it(`... and passed callback is called and dispatch throws error for valid action then onError will be called.`, async () => {
            const testAction: SyncStateAction<TestActionClass> = {
                payload: {
                    isBubbled: true,
                },
                source: SYNC_STATE_ACTION_SOURCE_WEBAPP,
                type: "SyncStateAction",
            };
            dispatch.mockImplementation(() => {
                throw "TESTERROR";
            });
            const { result } = renderHook(
                (
                    args: Parameters<
                        typeof useHybridReactNativeDispatchOnWebViewOnMessage
                    >
                ) => useHybridReactNativeDispatchOnWebViewOnMessage(...args),
                {
                    wrapper: makeWrapper(),
                    initialProps: [dispatch, isActionTypeguard, testOptions],
                }
            );

            await result.current({
                nativeEvent: {
                    data: JSON.stringify(testAction),
                },
            });

            const callback =
                useReactNativeWebViewOnMessageMock.mock.calls[0][0];
            await callback(testAction);

            expect(testOptions.onError).toBeCalledWith("TESTERROR");
        });
        it(`... and passed callback is called and a is given valid action then dispatch will be called.`, async () => {
            const testAction: SyncStateAction<TestActionClass> = {
                payload: {
                    isBubbled: true,
                },
                source: SYNC_STATE_ACTION_SOURCE_WEBAPP,
                type: "SyncStateAction",
            };
            dispatch.mockImplementation(() => undefined);
            const { result } = renderHook(
                (
                    args: Parameters<
                        typeof useHybridReactNativeDispatchOnWebViewOnMessage
                    >
                ) => useHybridReactNativeDispatchOnWebViewOnMessage(...args),
                {
                    wrapper: makeWrapper(),
                    initialProps: [dispatch, isActionTypeguard, testOptions],
                }
            );

            await result.current({
                nativeEvent: {
                    data: JSON.stringify(testAction),
                },
            });

            const callback =
                useReactNativeWebViewOnMessageMock.mock.calls[0][0];
            await callback(testAction);

            expect(dispatch).toBeCalledWith(testAction.payload);
        });
        it(`... and passed callback is called and is given an invalid action then dispatch will not be called.`, async () => {
            const testAction: SyncStateAction<TestActionClass> = {
                payload: {
                    isBubbled: true,
                },
                source: SYNC_STATE_ACTION_SOURCE_FRAME,
                type: "SyncStateAction",
            };
            dispatch.mockImplementation(() => undefined);
            const { result } = renderHook(
                (
                    args: Parameters<
                        typeof useHybridReactNativeDispatchOnWebViewOnMessage
                    >
                ) => useHybridReactNativeDispatchOnWebViewOnMessage(...args),
                {
                    wrapper: makeWrapper(),
                    initialProps: [dispatch, isActionTypeguard, testOptions],
                }
            );

            await result.current({
                nativeEvent: {
                    data: JSON.stringify(testAction),
                },
            });

            const callback =
                useReactNativeWebViewOnMessageMock.mock.calls[0][0];
            await callback(testAction);

            expect(dispatch).not.toBeCalled();
        });
    });
});
