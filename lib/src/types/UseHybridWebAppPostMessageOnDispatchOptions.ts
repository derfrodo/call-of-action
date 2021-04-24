import { SyncActionSources } from "./SyncActionSources";
import { SharedStateHookOptions } from "./SharedStateHookOptions";

export type UseHybridWebAppPostMessageOnDispatchOptions = SharedStateHookOptions & {
    syncActionSource?: SyncActionSources;
};
