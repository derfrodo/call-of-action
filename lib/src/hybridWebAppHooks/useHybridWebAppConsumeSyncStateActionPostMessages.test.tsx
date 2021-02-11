import React from "react";
import { useHybridWebAppConsumeSyncStateActionPostMessages } from "./useHybridWebAppConsumeSyncStateActionPostMessages";
import { renderHook } from "@testing-library/react-hooks";
import { ActionTypeguard, SyncStateAction } from "../types";

const makeWrapper = (): React.FC => ({ children }) => <div>{children}</div>;

type TestActionClass = { isBubbled?: boolean };
describe("Given useHybridWebAppConsumeSyncStateActionPostMessages", () => {
    it("when called, it returns void", async () => {
        const onMessage = jest.fn<
            void | Promise<void>,
            [SyncStateAction<TestActionClass>]
        >();

        const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
            ActionTypeguard<TestActionClass>
        >;

        const { result } = renderHook(
            () =>
                useHybridWebAppConsumeSyncStateActionPostMessages(
                    onMessage,
                    isActionTypeguard
                ),
            {
                wrapper: makeWrapper(),
            }
        );
        expect(result.current).toBeUndefined();
    });
});
