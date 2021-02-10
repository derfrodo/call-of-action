import { ContextAction } from "./ContextAction";
import { SyncStateAction } from "./SyncStateAction";

export type SyncStateActionCallback<T extends ContextAction> = (
    action: SyncStateAction<T>
) => Promise<void> | void;
