import {
    SYNC_STATE_ACTION_SOURCE_FRAME,
    SYNC_STATE_ACTION_SOURCE_WEBAPP,
    SYNC_STATE_ACTION_TYPE,
} from "../constants";
import { ActionTypeguard, SyncActionSources, SyncStateAction } from "../types";
import { SharedStateHookOptions } from "../types/SharedStateHookOptions";
import { isSyncStateAction } from "./syncState";

type TestActionClass = { isBubbled?: boolean };

const getSyncStateAction = (
    payload: any,
    source: SyncActionSources = SYNC_STATE_ACTION_SOURCE_WEBAPP
): SyncStateAction<any> => ({
    type: SYNC_STATE_ACTION_TYPE,
    source: source,
    payload,
});
describe("Given isSyncStateAction", () => {
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
        [{}, true, false],
        [() => {}, false, false],
        [() => {}, true, false],
        [null, false, false],
        [undefined, true, false],
    ])(
        `...,when obj is %s and payload typeguard returns %s`,
        (obj, tgResult, expected) => {
            it(`..., then result is ${expected}.`, async () => {
                const testOptions: SharedStateHookOptions = {};
                const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
                    ActionTypeguard<TestActionClass>
                >;
                isActionTypeguard.mockImplementation(() => tgResult);
                const result = isSyncStateAction(obj, isActionTypeguard);
                expect(result).toBe(expected);
            });
        }
    );
});
