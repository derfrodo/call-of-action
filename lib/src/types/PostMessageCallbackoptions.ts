import { SharedStateHookOptions } from "./SharedStateHookOptions";
import { SyncActionSources } from "./SyncActionSources";

export type PostMessageCallbackoptions = SharedStateHookOptions & {
    skipCompareSourceToWindow?: boolean;
    ignoreDifferentOrigins?: boolean;
    skipSources?: SyncActionSources[];
};
