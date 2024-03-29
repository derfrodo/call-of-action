import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { SYNC_STATE_ACTION_SOURCE_WEBAPP } from "..";
import { asSyncStateAction } from "../syncState/asSyncStateAction";
import {
    ActionTypeguard,
    PostMessageCallbackoptions,
    SyncActionSources,
    SyncStateAction,
} from "../types";
import { SharedStateHookOptions } from "../types/SharedStateHookOptions";
import { usePostMessageCallback } from "./usePostMessageCallback";

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

describe("Given usePostMessageCallback", () => {
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
            Parameters<typeof usePostMessageCallback>,
            ReturnType<typeof usePostMessageCallback>
        >((args) => usePostMessageCallback(...args), {
            wrapper: makeWrapper(),
            initialProps: [onMessage, isActionTypeguard, testOptions],
        });
        expect(typeof result.current).toBe("function");
    });

    describe("when called and function returned", () => {
        const testAction: TestActionClass = { isBubbled: true };
        const testOptions: PostMessageCallbackoptions = { onError: jest.fn() };
        const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
            ActionTypeguard<TestActionClass>
        >;
        const onMessage = jest.fn();
        it(`... and onMessage will throw an error.`, async () => {
            onMessage.mockImplementation(() => {
                throw "TESTERROR";
            });
            const { result } = renderHook<
                Parameters<typeof usePostMessageCallback>,
                ReturnType<typeof usePostMessageCallback>
            >((args) => usePostMessageCallback(...args), {
                wrapper: makeWrapper(),
                initialProps: [onMessage, isActionTypeguard, testOptions],
            });

            await result.current(
                new MessageEvent("message", {
                    source: window,
                    origin: window.location.origin,
                    data: testAction,
                })
            );

            expect(testOptions.onError).toBeCalledWith("TESTERROR");
        });

        describe.each<[boolean, boolean, boolean, boolean]>([
            [true, true, true, false],
            [true, false, true, false],
            [false, true, true, false],
            [false, false, true, true],

            [true, true, false, true],
            [true, false, false, true],
            [false, true, false, true],
            [false, false, false, true],
        ])(
            `... and skip sources: %s and sources matching: %s and origins matching: %s2`,
            (
                skipCompareSourceToWindow,
                sourceMatching,
                originMatching,
                expectPrematureReturn
            ) => {
                it(`... and function casts action: ${expectPrematureReturn} and cast action will work, then onMessage called: ${expectPrematureReturn}`, async () => {
                    const options: PostMessageCallbackoptions = {
                        ...testOptions,
                        skipCompareSourceToWindow,
                    };
                    const { result } = renderHook<
                        Parameters<typeof usePostMessageCallback>,
                        ReturnType<typeof usePostMessageCallback>
                    >((args) => usePostMessageCallback(...args), {
                        wrapper: makeWrapper(),
                        initialProps: [onMessage, isActionTypeguard, options],
                    });
                    const testAction: SyncStateAction<string> = {
                        payload: "TESTPAYLOAD",
                        source: SYNC_STATE_ACTION_SOURCE_WEBAPP,
                        type: "SyncStateAction",
                    };
                    asSyncStateActionMock.mockImplementation(
                        (action) => testAction
                    );
                    await result.current(
                        new MessageEvent("message", {
                            source: sourceMatching ? window : null,
                            origin: originMatching
                                ? window.location.origin
                                : "fakeOrigin",
                            data: testAction,
                        })
                    );
                    expect(asSyncStateActionMock).toBeCalledTimes(
                        expectPrematureReturn ? 0 : 1
                    );
                    expect(onMessage).toBeCalledTimes(
                        expectPrematureReturn ? 0 : 1
                    );
                });

                it(`... and function casts action: ${expectPrematureReturn} and cast action failes, then onMessage will not be called`, async () => {
                    const options: PostMessageCallbackoptions = {
                        ...testOptions,
                        skipCompareSourceToWindow,
                    };
                    const { result } = renderHook<
                        Parameters<typeof usePostMessageCallback>,
                        ReturnType<typeof usePostMessageCallback>
                    >((args) => usePostMessageCallback(...args), {
                        wrapper: makeWrapper(),
                        initialProps: [onMessage, isActionTypeguard, options],
                    });
                    const testAction: SyncStateAction<string> = {
                        payload: "TESTPAYLOAD",
                        source: SYNC_STATE_ACTION_SOURCE_WEBAPP,
                        type: "SyncStateAction",
                    };
                    asSyncStateActionMock.mockImplementation((action) => null);
                    await result.current(
                        new MessageEvent("message", {
                            source: sourceMatching ? window : null,
                            origin: originMatching
                                ? window.location.origin
                                : "fakeOrigin",
                            data: testAction,
                        })
                    );
                    expect(asSyncStateActionMock).toBeCalledTimes(
                        expectPrematureReturn ? 0 : 1
                    );
                    expect(onMessage).toBeCalledTimes(0);
                });
            }
        );

        it(`skips when skippedSources option is set.`, async () => {
            const options: PostMessageCallbackoptions = {
                ...testOptions,
                skipSources: [SyncActionSources.INNER_APP],
            };
            const { result } = renderHook<
                Parameters<typeof usePostMessageCallback>,
                ReturnType<typeof usePostMessageCallback>
            >((args) => usePostMessageCallback(...args), {
                wrapper: makeWrapper(),
                initialProps: [onMessage, isActionTypeguard, options],
            });
            const testAction: SyncStateAction<string> = {
                payload: "TESTPAYLOAD",
                source: SyncActionSources.INNER_APP,
                type: "SyncStateAction",
            };
            asSyncStateActionMock.mockImplementation((action) => testAction);
            await result.current(
                new MessageEvent("message", {
                    source: window,
                    origin: window.location.origin,
                    data: testAction,
                })
            );
            expect(asSyncStateActionMock).toBeCalledTimes(1);
            expect(onMessage).toBeCalledTimes(0);
        });
        it(`does not skip if origin is not equal, when ignore different origins option is set.`, async () => {
            const options: PostMessageCallbackoptions = {
                ...testOptions,
                ignoreDifferentOrigins: true
            };
            const { result } = renderHook<
                Parameters<typeof usePostMessageCallback>,
                ReturnType<typeof usePostMessageCallback>
            >((args) => usePostMessageCallback(...args), {
                wrapper: makeWrapper(),
                initialProps: [onMessage, isActionTypeguard, options],
            });
            const testAction: SyncStateAction<string> = {
                payload: "TESTPAYLOAD",
                source: SyncActionSources.INNER_APP,
                type: "SyncStateAction",
            };
            asSyncStateActionMock.mockImplementation((action) => testAction);
            await result.current(
                new MessageEvent("message", {
                    source: window,
                    origin: "fakeOrigin",
                    data: testAction,
                })
            );
            expect(asSyncStateActionMock).toBeCalledTimes(1);
            expect(onMessage).toBeCalledTimes(1);
        });
    });
});
