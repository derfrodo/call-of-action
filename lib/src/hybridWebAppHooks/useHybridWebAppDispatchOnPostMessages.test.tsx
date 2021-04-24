import React from "react";
import { useHybridWebAppDispatchOnPostMessages } from "./useHybridWebAppDispatchOnPostMessages";
import { renderHook } from "@testing-library/react-hooks";
import { ActionTypeguard, SyncActionSources, SyncStateAction } from "../types";
import { useConsumeSyncStateActionPostMessages } from "./useHybridWebAppConsumeSyncStateActionPostMessages";
import { SharedStateHookOptions } from "../types/SharedStateHookOptions";
import { createSyncStateAction } from "../syncState";
import {
    SYNC_STATE_ACTION_SOURCE_FRAME,
    SYNC_STATE_ACTION_SOURCE_WEBAPP,
} from "../constants";

jest.mock("./useHybridWebAppConsumeSyncStateActionPostMessages", () => ({
    __esModule: true,
    useConsumeSyncStateActionPostMessages: jest.fn(),
}));

const useConsumeSyncStateActionPostMessagesMock = useConsumeSyncStateActionPostMessages as jest.MockedFunction<
    typeof useConsumeSyncStateActionPostMessages
>;

const makeWrapper = (): React.FC => ({ children }): React.ReactElement => (
    <div>{children}</div>
);
type TestActionClass = { isBubbled?: boolean };

describe("Given useHybridWebAppDispatchOnPostMessages", () => {
    beforeEach(() => {
        useConsumeSyncStateActionPostMessagesMock.mockImplementation(
            () => undefined
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("when called, then hook calls useConsumeSyncStateActionPostMessages", async () => {
        const dispatch = jest.fn<
            ReturnType<React.Dispatch<TestActionClass>>,
            Parameters<React.Dispatch<TestActionClass>>
        >();

        const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
            ActionTypeguard<TestActionClass>
        >;
        const testOptions: SharedStateHookOptions = {};
        const {} = renderHook(
            () =>
                useHybridWebAppDispatchOnPostMessages(
                    dispatch,
                    isActionTypeguard,
                    testOptions
                ),
            {
                wrapper: makeWrapper(),
            }
        );
        expect(useConsumeSyncStateActionPostMessagesMock).toBeCalledTimes(1);
        expect(useConsumeSyncStateActionPostMessagesMock).toBeCalledWith(
            expect.anything(),
            isActionTypeguard,
            testOptions
        );
    });

    it("when called, then passes callback to useConsumeSyncStateActionPostMessages", async () => {
        const dispatch = jest.fn<
            ReturnType<React.Dispatch<TestActionClass>>,
            Parameters<React.Dispatch<TestActionClass>>
        >();

        const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
            ActionTypeguard<TestActionClass>
        >;
        const testOptions: SharedStateHookOptions = {};
        const {} = renderHook(
            () =>
                useHybridWebAppDispatchOnPostMessages(
                    dispatch,
                    isActionTypeguard,
                    testOptions
                ),
            {
                wrapper: makeWrapper(),
            }
        );
        const callback =
            useConsumeSyncStateActionPostMessagesMock.mock.calls[0][0];
        expect(typeof callback).toBe("function");
    });

    it("when called and an action with SyncState TestAction from Webapp happens, then passed callback doesnt call dispatch for this testaction", async () => {
        const dispatch = jest.fn<
            ReturnType<React.Dispatch<TestActionClass>>,
            Parameters<React.Dispatch<TestActionClass>>
        >();

        const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
            ActionTypeguard<TestActionClass>
        >;
        const testOptions: SharedStateHookOptions = {};

        const {} = renderHook(
            () =>
                useHybridWebAppDispatchOnPostMessages(
                    dispatch,
                    isActionTypeguard,
                    testOptions
                ),
            {
                wrapper: makeWrapper(),
            }
        );

        const callback =
            useConsumeSyncStateActionPostMessagesMock.mock.calls[0][0];
        const action: SyncStateAction<TestActionClass> = createSyncStateAction<
            TestActionClass
        >(
            {
                isBubbled: true,
            },
            SYNC_STATE_ACTION_SOURCE_WEBAPP
        );

        await callback(action);
        expect(dispatch).not.toBeCalled();
    });

    it("when called and an action with SyncState TestAction from InnerApp happens, then passed callback does call dispatch for this testaction", async () => {
        const dispatch = jest.fn<
            ReturnType<React.Dispatch<TestActionClass>>,
            Parameters<React.Dispatch<TestActionClass>>
        >();

        const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
            ActionTypeguard<TestActionClass>
        >;
        const testOptions: SharedStateHookOptions = {};

        const {} = renderHook(
            () =>
                useHybridWebAppDispatchOnPostMessages(
                    dispatch,
                    isActionTypeguard,
                    testOptions
                ),
            {
                wrapper: makeWrapper(),
            }
        );

        const callback =
            useConsumeSyncStateActionPostMessagesMock.mock.calls[0][0];
        const action: SyncStateAction<TestActionClass> = createSyncStateAction<
            TestActionClass
        >(
            {
                isBubbled: true,
            },
            SyncActionSources.INNER_APP
        );

        await callback(action);
        expect(dispatch).toBeCalled();
    });

    it("when called and an action with SyncState TestAction from InnerApp happens and InnerApp is ignored by option, then passed callback doesnt call dispatch for this testaction", async () => {
        const dispatch = jest.fn<
            ReturnType<React.Dispatch<TestActionClass>>,
            Parameters<React.Dispatch<TestActionClass>>
        >();

        const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
            ActionTypeguard<TestActionClass>
        >;
        const testOptions: SharedStateHookOptions = {};

        const {} = renderHook(
            () =>
                useHybridWebAppDispatchOnPostMessages(
                    dispatch,
                    isActionTypeguard,
                    {
                        ...testOptions,
                        skipSources: [SyncActionSources.INNER_APP],
                    }
                ),
            {
                wrapper: makeWrapper(),
            }
        );

        const callback =
            useConsumeSyncStateActionPostMessagesMock.mock.calls[0][0];
        const action: SyncStateAction<TestActionClass> = createSyncStateAction<
            TestActionClass
        >(
            {
                isBubbled: true,
            },
            SyncActionSources.INNER_APP
        );

        await callback(action);
        expect(dispatch).not.toBeCalled();
    });

    it("when called and an action with SyncState TestAction from frame happens, then passed callback calls dispatch for this testaction", async () => {
        const dispatch = jest.fn<
            ReturnType<React.Dispatch<TestActionClass>>,
            Parameters<React.Dispatch<TestActionClass>>
        >();

        const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
            ActionTypeguard<TestActionClass>
        >;
        const testOptions: SharedStateHookOptions = {};

        const {} = renderHook(
            () =>
                useHybridWebAppDispatchOnPostMessages(
                    dispatch,
                    isActionTypeguard,
                    testOptions
                ),
            {
                wrapper: makeWrapper(),
            }
        );

        const callback =
            useConsumeSyncStateActionPostMessagesMock.mock.calls[0][0];
        const action: SyncStateAction<TestActionClass> = createSyncStateAction<
            TestActionClass
        >(
            {
                isBubbled: true,
            },
            SYNC_STATE_ACTION_SOURCE_FRAME
        );

        await callback(action);
        expect(dispatch).toBeCalled();
    });
    it("when callback called and an error occures, then on Error will be called if present in options,", async () => {
        const dispatch = jest
            .fn<
                ReturnType<React.Dispatch<TestActionClass>>,
                Parameters<React.Dispatch<TestActionClass>>
            >()
            .mockImplementation(() => {
                throw new Error("testerror for dispatch");
            });

        const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
            ActionTypeguard<TestActionClass>
        >;
        const testOptions: SharedStateHookOptions = {
            onError: jest.fn(),
        };

        const {} = renderHook(
            () =>
                useHybridWebAppDispatchOnPostMessages(
                    dispatch,
                    isActionTypeguard,
                    testOptions
                ),
            {
                wrapper: makeWrapper(),
            }
        );

        const callback =
            useConsumeSyncStateActionPostMessagesMock.mock.calls[0][0];
        const action: SyncStateAction<TestActionClass> = createSyncStateAction<
            TestActionClass
        >(
            {
                isBubbled: true,
            },
            SYNC_STATE_ACTION_SOURCE_FRAME
        );

        await callback(action);
        expect(dispatch).toBeCalled();
        expect(testOptions.onError).toBeCalled();
    });
});
