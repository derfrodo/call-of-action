import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { SYNC_STATE_ACTION_SOURCE_WEBAPP } from "..";
import { asSyncStateAction } from "../syncState/asSyncStateAction";
import { ActionTypeguard, SyncStateAction } from "../types";
import { SharedStateHookOptions } from "../types/SharedStateHookOptions";
import { useHybridReactNativeWebViewOnMessage } from "./useHybridReactNativeWebViewOnMessage";

jest.mock("../syncState/asSyncStateAction", () => {
    const act = jest.requireActual("../syncState/asSyncStateAction");
    return {
        ...act,
        asSyncStateAction: jest.fn(),
    };
});

const asSyncStateActionMock = asSyncStateAction as jest.MockedFunction<
    typeof asSyncStateAction
>;

const makeWrapper = (): React.FC<any> => ({ children }): React.ReactElement => (
    <div>{children}</div>
);
type TestActionClass = { isBubbled?: boolean };

describe("Given useHybridReactNativeWebViewOnMessage", () => {
    beforeEach(() => {
        asSyncStateActionMock.mockImplementation((action) => ({
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
        const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
            ActionTypeguard<TestActionClass>
        >;
        const onMessage = jest.fn();
        const { result } = renderHook<
            Parameters<typeof useHybridReactNativeWebViewOnMessage>,
            ReturnType<typeof useHybridReactNativeWebViewOnMessage>
        >((args) => useHybridReactNativeWebViewOnMessage(...args), {
            wrapper: makeWrapper(),
            initialProps: [onMessage, isActionTypeguard, testOptions],
        });
        expect(typeof result.current).toBe("function");
    });

    describe("when called and function returned", () => {
        const testAction: TestActionClass = { isBubbled: true };
        const testOptions: SharedStateHookOptions = { onError: jest.fn() };
        const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
            ActionTypeguard<TestActionClass>
        >;
        const onMessage = jest.fn();
        it(`... and onMessage will throw an error then onError will be called from options..`, async () => {
            onMessage.mockImplementation(() => {
                throw "TESTERROR";
            });
            const { result } = renderHook<
                Parameters<typeof useHybridReactNativeWebViewOnMessage>,
                ReturnType<typeof useHybridReactNativeWebViewOnMessage>
            >((args) => useHybridReactNativeWebViewOnMessage(...args), {
                wrapper: makeWrapper(),
                initialProps: [onMessage, isActionTypeguard, testOptions],
            });

            await result.current({
                nativeEvent: {
                    data: "TESTDATA",
                },
            });

            expect(testOptions.onError).toBeCalledWith("TESTERROR");
        });
        it(`... and asSyncAction will throw an error then onError will be called from options.`, async () => {
            asSyncStateActionMock.mockImplementation(() => {
                throw "TESTERROR2";
            });
            onMessage.mockImplementation(() => undefined);
            const { result } = renderHook<
                Parameters<typeof useHybridReactNativeWebViewOnMessage>,
                ReturnType<typeof useHybridReactNativeWebViewOnMessage>
            >((args) => useHybridReactNativeWebViewOnMessage(...args), {
                wrapper: makeWrapper(),
                initialProps: [onMessage, isActionTypeguard, testOptions],
            });

            await result.current({
                nativeEvent: {
                    data: "TESTDATA",
                },
            });

            expect(testOptions.onError).toBeCalledWith("TESTERROR2");
        });
        it(`... and cast action will work, then onMessage called.`, async () => {
            const options: SharedStateHookOptions = {
                ...testOptions,
            };
            const { result } = renderHook<
                Parameters<typeof useHybridReactNativeWebViewOnMessage>,
                ReturnType<typeof useHybridReactNativeWebViewOnMessage>
            >((args) => useHybridReactNativeWebViewOnMessage(...args), {
                wrapper: makeWrapper(),
                initialProps: [onMessage, isActionTypeguard, options],
            });
            const testAction: SyncStateAction<string> = {
                payload: "TESTPAYLOAD",
                source: SYNC_STATE_ACTION_SOURCE_WEBAPP,
                type: "SyncStateAction",
            };
            asSyncStateActionMock.mockImplementation((action) => testAction);
            await result.current({
                nativeEvent: {
                    data: "TESTDATA",
                },
            });
            expect(asSyncStateActionMock).toBeCalledTimes(1);
            expect(onMessage).toBeCalledTimes(1);
        });

        it(`... and cast action failes, then onMessage will not be called`, async () => {
            const options: SharedStateHookOptions = {
                ...testOptions,
            };
            const { result } = renderHook<
                Parameters<typeof useHybridReactNativeWebViewOnMessage>,
                ReturnType<typeof useHybridReactNativeWebViewOnMessage>
            >((args) => useHybridReactNativeWebViewOnMessage(...args), {
                wrapper: makeWrapper(),
                initialProps: [onMessage, isActionTypeguard, options],
            });
            const testAction: SyncStateAction<string> = {
                payload: "TESTPAYLOAD",
                source: SYNC_STATE_ACTION_SOURCE_WEBAPP,
                type: "SyncStateAction",
            };
            asSyncStateActionMock.mockImplementation((action) => null);

            await result.current({
                nativeEvent: {
                    data: "TESTDATA",
                },
            });
            expect(asSyncStateActionMock).toBeCalledTimes(1);
            expect(onMessage).toBeCalledTimes(0);
        });
    });
});
