export type SharedStateHookOptions = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError?: (error: any) => Promise<void> | void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onWarn?: (warning: any) => Promise<void> | void;
};
