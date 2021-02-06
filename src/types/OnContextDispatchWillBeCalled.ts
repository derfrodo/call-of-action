import { ContextAction } from "./ContextAction";

export type OnContextDispatchWillBeCalled<T extends ContextAction> = (
    action: T
) => void;
