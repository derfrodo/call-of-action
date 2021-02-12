import { SharedStateHookOptions } from "./SharedStateHookOptions";

export type PostMessageCallbackoptions = SharedStateHookOptions & {
    compareSourceToWindow?: boolean;
};
