import { SharedStateHookOptions } from "./SharedStateHookOptions";

export type PostMessageCallbackoptions = SharedStateHookOptions & {
    skipCompareSourceToWindow?: boolean;
};
