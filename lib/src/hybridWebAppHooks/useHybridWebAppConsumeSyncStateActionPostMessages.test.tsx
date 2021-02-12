import React from "react";
import { useHybridWebAppConsumeSyncStateActionPostMessages } from "./useHybridWebAppConsumeSyncStateActionPostMessages";
import { renderHook } from "@testing-library/react-hooks";
import { ActionTypeguard, SyncStateAction } from "../types";

const makeWrapper = (): React.FC => ({ children }) => <div>{children}</div>;

type TestActionClass = { isBubbled?: boolean };

const fakePostMessageEvent = () => {};
const windowEventListenerMock = jest.fn();
const documentEventListenerMock = jest.fn();

describe("Given useHybridWebAppConsumeSyncStateActionPostMessages", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.addEventListener = windowEventListenerMock;
        (document as any).addEventListener = documentEventListenerMock;
    });

    it("when called, it hooks on window message event for non-iOS Webview", async () => {
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
        expect(windowEventListenerMock).toBeCalledWith(
            "message",
            expect.anything(),
            undefined
        );
    });

    it("when called, it hooks on document message event for iOS webViews", async () => {
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
        expect(documentEventListenerMock).toBeCalledWith(
            "message",
            expect.anything()
        );
    });

    it("when called and failed on binding window message event, then hook will still listen on document events", async () => {
        const onMessage = jest.fn<
            void | Promise<void>,
            [SyncStateAction<TestActionClass>]
        >();

        const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
            ActionTypeguard<TestActionClass>
        >;
        windowEventListenerMock.mockImplementation((a1) => {
            if (a1 === "message") {
                throw new Error("Testerror");
            }
        });
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
        expect(windowEventListenerMock).toBeCalled();
        expect(documentEventListenerMock).toBeCalledWith(
            "message",
            expect.anything()
        );
    });
    it("when called and failed on binding document message event, then hook will still listen on window events", async () => {
        const onMessage = jest.fn<
            void | Promise<void>,
            [SyncStateAction<TestActionClass>]
        >();

        const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
            ActionTypeguard<TestActionClass>
        >;
        documentEventListenerMock.mockImplementation((a1) => {
            if (a1 === "message") {
                throw new Error("Testerror");
            }
        });
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
        expect(documentEventListenerMock).toBeCalled();
        expect(windowEventListenerMock).toBeCalledWith(
            "message",
            expect.anything(),
            undefined
        );
    });
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
