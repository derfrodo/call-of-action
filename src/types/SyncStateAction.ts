import { SyncActionSources } from "./SyncActionSources";

export interface SyncStateAction<T> {
    type: "SyncStateAction";
    source: SyncActionSources;
    payload: T;
}
