import { SyncActionSources } from "..";

export const isSyncStateActionSource = (
    source: any
): source is SyncActionSources => {
    return (
        SyncActionSources.WEB_APP === source ||
        SyncActionSources.INNER_APP === source ||
        SyncActionSources.FRAME === source
    );
};
