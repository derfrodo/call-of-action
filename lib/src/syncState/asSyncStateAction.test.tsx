import {
    SYNC_STATE_ACTION_SOURCE_FRAME,
    SYNC_STATE_ACTION_SOURCE_WEBAPP,
    SYNC_STATE_ACTION_TYPE,
} from "../constants";
import { ActionTypeguard, SyncActionSources, SyncStateAction } from "../types";
import { SharedStateHookOptions } from "../types/SharedStateHookOptions";
import { asSyncStateAction } from "./asSyncStateAction";
import { isSyncStateAction } from "./isSyncStateAction";

jest.mock("./isSyncStateAction", () => {
    const actual = jest.requireActual("./isSyncStateAction");
    return { ...actual, isSyncStateAction: jest.fn() };
});

const isSyncStateActionMock = isSyncStateAction as jest.MockedFunction<
    typeof isSyncStateAction
>;

type TestActionClass = { isBubbled?: boolean };

const getSyncStateAction = (
    payload: any,
    source: SyncActionSources = SYNC_STATE_ACTION_SOURCE_WEBAPP
): SyncStateAction<any> => ({
    type: SYNC_STATE_ACTION_TYPE,
    source: source,
    payload,
});

describe("Given asSyncStateAction", () => {
    beforeEach(() => {});

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe.each<[any, boolean, boolean]>([
        [getSyncStateAction("TESTPAYLOAD"), true, true],
        [getSyncStateAction("TESTPAYLOAD"), false, false],
        [
            getSyncStateAction("TESTPAYLOAD", SYNC_STATE_ACTION_SOURCE_FRAME),
            true,
            true,
        ],
        [
            getSyncStateAction("TESTPAYLOAD", SYNC_STATE_ACTION_SOURCE_FRAME),
            false,
            false,
        ],
        [{}, false, false],
        [{}, true, true],
        [() => {}, false, false],
        [null, false, false],
        [undefined, false, false],
    ])(
        `...,when obj is %s and isSyncStateActionMock returns obj: %s`,
        (obj, synResult, expected) => {
            it(`..., then result is ${expected}.`, async () => {
                const testOptions: SharedStateHookOptions = {};
                const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
                    ActionTypeguard<TestActionClass>
                >;
                isSyncStateActionMock.mockImplementation(() => synResult);
                const result = asSyncStateAction(obj, isActionTypeguard);
                expect(result).toBe(expected ? obj : null);
            });
            it(`..., then result for stringified is ${expected}.`, async () => {
                const testOptions: SharedStateHookOptions = {};
                const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
                    ActionTypeguard<TestActionClass>
                >;
                isSyncStateActionMock
                    .mockImplementationOnce(() => false)
                    .mockImplementation((o) => synResult);
                const result = asSyncStateAction(
                    JSON.stringify(obj),
                    isActionTypeguard
                );
                expect(result).toEqual(
                    expected ? obj : null
                );
            });
        }
    );
});
