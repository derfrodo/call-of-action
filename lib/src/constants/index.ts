import { SyncActionSources } from "../types";

export const SYNC_STATE_ACTION_TYPE = "SyncStateAction";
export const SYNC_STATE_ACTION_SOURCE_WEBAPP = SyncActionSources.WEB_APP; // "WebApp";
export const SYNC_STATE_ACTION_SOURCE_FRAME = SyncActionSources.FRAME; // "Frame";
export const SYNC_STATE_ACTION_SOURCES = {
    webApp: SYNC_STATE_ACTION_SOURCE_WEBAPP,
    frame: SYNC_STATE_ACTION_SOURCE_FRAME,
};
