import React from "react";
import { useHybridWebAppConsumeSyncStateActionPostMessages } from "./useHybridWebAppConsumeSyncStateActionPostMessages";
import { renderHook } from "@testing-library/react-hooks";
import { ActionTypeguard, SyncStateAction } from "../types";
import { usePostMessageCallback } from "./usePostMessageCallback";

jest.mock("./usePostMessageCallback", () => ({
    __esModule: true,
    usePostMessageCallback: jest.fn(),
}));

const usePostMessageCallbackMock = usePostMessageCallback as jest.MockedFunction<
    typeof usePostMessageCallback
>;

const makeWrapper = (): React.FC => ({ children }) => <div>{children}</div>;
type TestActionClass = { isBubbled?: boolean };

const windowEventListenerMock: jest.MockedFunction<typeof window.addEventListener> = jest.fn();
const documentEventListenerMock: jest.MockedFunction<typeof window.addEventListener> = jest.fn();

describe("Given useHybridWebAppConsumeSyncStateActionPostMessages", () => {
    beforeEach(() => {
        window.addEventListener = windowEventListenerMock;
        (document as any).addEventListener = documentEventListenerMock;
        usePostMessageCallbackMock.mockImplementation(() => () => {});
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("when called, then hook binds on window message event for non-iOS Webview", async () => {
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

    it("when called, then hook binds on document message event for iOS webViews", async () => {
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
    it("when called, then hook returns void", async () => {
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
    it("when message event occures on window, then hook calls usePostMessageCallback", async () => {
        const testEvent: MessageEvent = new MessageEvent("message", {
            data: "TEST DATA!",
        });
        const mockCallback = jest.fn();
        usePostMessageCallbackMock.mockImplementation(() => mockCallback);

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
        const callback = windowEventListenerMock.mock.calls.filter(
            (c) => c[0] === "message"
        )[0][1];

        if (typeof callback === "function") {
            // since we only let usePostMessageCallbackMock return a function, the else branch should never be entered
            callback(testEvent);
        } else {
            fail("We expect the mock of post message to return a function");
            // callback.handleEvent();
        }

        expect(mockCallback).toBeCalledTimes(1);
        expect(mockCallback).toBeCalledWith(testEvent);
    });
});
