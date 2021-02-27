import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { SYNC_STATE_ACTION_SOURCE_WEBAPP } from "..";
import { asSyncStateAction } from "../syncState/syncState";
import { ActionTypeguard } from "../types";
import { SharedStateHookOptions } from "../types/SharedStateHookOptions";
import { usePostMessageCallback } from "./usePostMessageCallback";

jest.mock("../syncState/syncState", () => {
    const act = jest.requireActual("../syncState/syncState");
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

    it("when called, then hook calls listenOnDispatchWillBeCalled in context", async () => {
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
});
