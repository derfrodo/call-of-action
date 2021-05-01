import {
    SYNC_STATE_ACTION_SOURCE_FRAME,
    SYNC_STATE_ACTION_SOURCE_WEBAPP,
    SYNC_STATE_ACTION_TYPE,
} from "../constants";
import { ActionTypeguard, SyncActionSources, SyncStateAction } from "../types";
import { SharedStateHookOptions } from "../types/SharedStateHookOptions";
import { isSyncStateAction } from "./isSyncStateAction";
import { isSyncStateActionSource } from "./isSyncStateActionSource";

jest.mock("./isSyncStateActionSource", ()=>{
    jest.requireActual("./isSyncStateActionSource")
    return{
        isSyncStateActionSource: jest.fn()
    }
})

type TestActionClass = { isBubbled?: boolean };

const isSyncStateActionSourceMock = isSyncStateActionSource as jest.MockedFunction<typeof isSyncStateActionSource>
const getSyncStateAction = (
    payload: any,
    source: SyncActionSources = SYNC_STATE_ACTION_SOURCE_WEBAPP
): SyncStateAction<any> => ({
    type: SYNC_STATE_ACTION_TYPE,
    source: source,
    payload,
});
describe("Given isSyncStateAction", () => {
    beforeEach(() => {
        isSyncStateActionSourceMock.mockImplementation(()=>true)
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
    it(`when is no valid sync state action source, then result is false.`, async () => {
        const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
            ActionTypeguard<TestActionClass>
        >;
        isSyncStateActionSourceMock.mockImplementation(()=>false)
        isActionTypeguard.mockImplementation(() => true);
        const action = getSyncStateAction("pload");
        const result = isSyncStateAction(action, isActionTypeguard);
        expect(result).toBe(false);
    });
    it(`when is valid sync state action source, then result is true.`, async () => {
        const isActionTypeguard = (jest.fn() as unknown) as jest.MockedFunction<
            ActionTypeguard<TestActionClass>
        >;
        isSyncStateActionSourceMock.mockImplementation(()=>true)
        isActionTypeguard.mockImplementation(() => true);
        const action = getSyncStateAction("pload");
        const result = isSyncStateAction(action, isActionTypeguard);
        expect(result).toBe(true);
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
