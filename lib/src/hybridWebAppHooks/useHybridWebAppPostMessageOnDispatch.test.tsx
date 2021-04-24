import React from "react";
import { useHybridWebAppPostMessageOnDispatch } from "./useHybridWebAppPostMessageOnDispatch";
import { renderHook } from "@testing-library/react-hooks";
import {
    ActionTypeguard,
    OnContextDispatchWillBeCalled,
    PostMessageToReactNativeContext,
    SyncActionSources,
    SyncStateAction,
    UseHybridWebAppPostMessageOnDispatchOptions,
} from "../types";
import { useConsumeSyncStateActionPostMessages } from "./useHybridWebAppConsumeSyncStateActionPostMessages";
import { SharedStateHookOptions } from "../types/SharedStateHookOptions";
import { createSyncStateAction } from "../syncState/createSyncStateAction";
import { SYNC_STATE_ACTION_SOURCE_WEBAPP } from "..";

jest.mock("./useHybridWebAppConsumeSyncStateActionPostMessages", () => ({
    __esModule: true,
    useConsumeSyncStateActionPostMessages: jest.fn(),
}));

jest.mock("../syncState/createSyncStateAction", () => {
    const act = jest.requireActual("../syncState/createSyncStateAction");
    return {
        ...act,
        createSyncStateAction: jest.fn(),
    };
});

const useConsumeSyncStateActionPostMessagesMock = useConsumeSyncStateActionPostMessages as jest.MockedFunction<
    typeof useConsumeSyncStateActionPostMessages
>;

const createSyncStateActionMock = createSyncStateAction as jest.MockedFunction<
    typeof createSyncStateAction
>;

const makeWrapper = (): React.FC<any> => ({ children }): React.ReactElement => (
    <div>{children}</div>
);
type TestActionClass = { isBubbled?: boolean };

const notifyMock = jest.fn();
const originalPostMessage = window.postMessage;
const addPostMessageMockToWindow = () => {
    (window as any).postMessage = notifyMock.mockImplementation(
        originalPostMessage
    );
};
const removePostMessageMockFromWindow = () => {
    (window as any).postMessage = originalPostMessage;
};

describe("Given useHybridWebAppPostMessageOnDispatch", () => {
    beforeEach(() => {
        useConsumeSyncStateActionPostMessagesMock.mockImplementation(
            () => undefined
        );
        createSyncStateActionMock.mockImplementation((action, src) => ({
            payload: "TESTPAYLOAD",
            source: src,
            type: "SyncStateAction",
        }));
    });

    afterEach(() => {
        removePostMessageMockFromWindow();
        jest.clearAllMocks();
    });

    it("when called, then hook calls listenOnDispatchWillBeCalled in context", async () => {
        const context: PostMessageToReactNativeContext<TestActionClass> = {
            dispatch: jest.fn(),
            listenOnDispatchWillBeCalled: jest.fn(),
            removeOnDispatchWillBeCalled: jest.fn(),
        };

        const testOptions: UseHybridWebAppPostMessageOnDispatchOptions = {};
        const {} = renderHook(
            () => useHybridWebAppPostMessageOnDispatch(context, testOptions),
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
        const { rerender } = renderHook<
            [
                PostMessageToReactNativeContext<TestActionClass>,
                SharedStateHookOptions | undefined
            ],
            ReturnType<typeof useHybridWebAppPostMessageOnDispatch>
        >((args) => useHybridWebAppPostMessageOnDispatch(...args), {
            wrapper: makeWrapper(),
            initialProps: [context, testOptions],
        });

        rerender([context, testOptions2]);
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
        const { rerender } = renderHook<
            [
                PostMessageToReactNativeContext<TestActionClass>,
                SharedStateHookOptions | undefined
            ],
            ReturnType<typeof useHybridWebAppPostMessageOnDispatch>
        >((args) => useHybridWebAppPostMessageOnDispatch(...args), {
            wrapper: makeWrapper(),
            initialProps: [context, testOptions],
        });

        rerender([context2, testOptions]);
        expect(context.listenOnDispatchWillBeCalled).toBeCalledTimes(1);
        expect(context2.listenOnDispatchWillBeCalled).toBeCalledTimes(1);
        expect(context.removeOnDispatchWillBeCalled).toBeCalledTimes(1);
        expect(context.removeOnDispatchWillBeCalled).toBeCalledWith(
            expect.anything()
        );
    });

    it("when called and onDispatch is called and action is not bubbled and specific source is not set, then callback calls notify function webapp source", async () => {
        const testAction: TestActionClass = { isBubbled: false };
        addPostMessageMockToWindow();

        const testOptions: UseHybridWebAppPostMessageOnDispatchOptions = {
            onError: jest.fn(),
        };
        const context: PostMessageToReactNativeContext<TestActionClass> = {
            dispatch: jest.fn(),
            listenOnDispatchWillBeCalled: jest.fn(),
            removeOnDispatchWillBeCalled: jest.fn(),
        };
        const {} = renderHook(
            () => useHybridWebAppPostMessageOnDispatch(context, testOptions),
            {
                wrapper: makeWrapper(),
            }
        );
        const onDispatch = (context.listenOnDispatchWillBeCalled as jest.MockedFunction<
            typeof context.listenOnDispatchWillBeCalled
        >).mock.calls[0][0];

        onDispatch(testAction);

        expect(notifyMock).toBeCalledWith(
            JSON.stringify({
                payload: "TESTPAYLOAD",
                source: SyncActionSources.WEB_APP,
                type: "SyncStateAction",
            }),
            expect.any(String)
        );
    });
it("when called and onDispatch is called and action is not bubbled and specific source is set, then callback calls notify function with source", async () => {
        const testAction: TestActionClass = { isBubbled: false };
        addPostMessageMockToWindow();

        const testOptions: UseHybridWebAppPostMessageOnDispatchOptions = {
            onError: jest.fn(),
            syncActionSource: SyncActionSources.INNER_APP,
        };
        const context: PostMessageToReactNativeContext<TestActionClass> = {
            dispatch: jest.fn(),
            listenOnDispatchWillBeCalled: jest.fn(),
            removeOnDispatchWillBeCalled: jest.fn(),
        };
        const {} = renderHook(
            () => useHybridWebAppPostMessageOnDispatch(context, testOptions),
            {
                wrapper: makeWrapper(),
            }
        );
        const onDispatch = (context.listenOnDispatchWillBeCalled as jest.MockedFunction<
            typeof context.listenOnDispatchWillBeCalled
        >).mock.calls[0][0];

        onDispatch(testAction);

        expect(notifyMock).toBeCalledWith(
            JSON.stringify({
                payload: "TESTPAYLOAD",
                source: SyncActionSources.INNER_APP,
                type: "SyncStateAction",
            }),
            expect.any(String)
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
                    useHybridWebAppPostMessageOnDispatch(context, testOptions),
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

            expect(createSyncStateAction).not.toBeCalled();
        });

        it("... and action is not bubbled, then callback creates sync action", async () => {
            const testAction: TestActionClass = { isBubbled: false };
            onDispatch(testAction);

            expect(createSyncStateAction).toBeCalledWith(
                expect.objectContaining({ ...testAction, isBubbled: true }),
                SYNC_STATE_ACTION_SOURCE_WEBAPP
            );
        });
        it("... and action is not bubbled, then callback creates sync action", async () => {
            const testAction: TestActionClass = { isBubbled: false };

            onDispatch(testAction);

            expect(createSyncStateAction).toBeCalledWith(
                expect.objectContaining({ ...testAction, isBubbled: true }),
                SYNC_STATE_ACTION_SOURCE_WEBAPP
            );
        });
        it("... and action is not bubbled, then callback calls notify function", async () => {
            const testAction: TestActionClass = { isBubbled: false };
            addPostMessageMockToWindow();
            onDispatch(testAction);

            expect(notifyMock).toBeCalledWith(
                JSON.stringify({
                    payload: "TESTPAYLOAD",
                    source: SYNC_STATE_ACTION_SOURCE_WEBAPP,
                    type: "SyncStateAction",
                }),
                expect.any(String)
            );
        });
        it("... and action is not bubbled and notify failes, then callback calls onError if present", async () => {
            const testAction: TestActionClass = { isBubbled: false };
            addPostMessageMockToWindow();
            notifyMock.mockImplementation(() => {
                throw "TESTERROR";
            });
            onDispatch(testAction);
            expect(testOptions.onError).toBeCalledWith("TESTERROR");
        });
        it("... and action is not bubbled and create sync action failes, then callback calls onError if present", async () => {
            const testAction: TestActionClass = { isBubbled: false };
            addPostMessageMockToWindow();
            createSyncStateActionMock.mockImplementation(() => {
                throw "TESTERROR";
            });
            onDispatch(testAction);
            expect(testOptions.onError).toBeCalledWith("TESTERROR");
        });
    });
});
