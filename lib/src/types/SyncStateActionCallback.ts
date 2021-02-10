import type { ContextAction } from "./ContextAction";
import type { SyncStateAction } from "./SyncStateAction";

export type SyncStateActionCallback<T extends ContextAction> = (
    action: SyncStateAction<T>
) => Promise<void> | void;
