import { SyncActionSources } from "..";

export const isSyncStateActionSource = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    source: any
): source is SyncActionSources => {
    return (
        SyncActionSources.WEB_APP === source ||
        SyncActionSources.INNER_APP === source ||
        SyncActionSources.FRAME === source
    );
};
