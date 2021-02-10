import type { ContextAction } from "./ContextAction";

export type OnContextDispatchWillBeCalled<T extends ContextAction> = (
    action: T
) => Promise<void> | void;
