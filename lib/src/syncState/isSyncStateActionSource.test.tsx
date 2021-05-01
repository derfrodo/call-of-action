import {
    SYNC_STATE_ACTION_SOURCE_FRAME,
    SYNC_STATE_ACTION_SOURCE_WEBAPP,
    SYNC_STATE_ACTION_TYPE,
} from "../constants";
import { ActionTypeguard, SyncActionSources, SyncStateAction } from "../types";
import { SharedStateHookOptions } from "../types/SharedStateHookOptions";
import { isSyncStateActionSource } from "./isSyncStateActionSource";

type TestActionClass = { isBubbled?: boolean };

describe("Given isSyncStateActionSource", () => {
    beforeEach(() => {});

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe.each<[SyncActionSources | string | any, boolean]>([
        ...Object.values(SyncActionSources as { [key in string]: string }).map<
            [any, boolean]
        >((v) => [v, true]),
        [null, false],
        [undefined, false],
    ])(
        `...,when obj is %s and payload typeguard returns %s`,
        (src, expected) => {
            it(`..., then result is ${expected}.`, async () => {
                const result = isSyncStateActionSource(src);
                expect(result).toBe(expected);
            });
        }
    );
});
