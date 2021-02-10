import type { ContextAction } from "./ContextAction";
import type { OnContextDispatchWillBeCalled } from "./OnContextDispatchWillBeCalled";

export interface PostMessageToReactNativeContext<T extends ContextAction> {
    dispatch: React.Dispatch<T>;
    listenOnDispatchWillBeCalled: (
        callback: OnContextDispatchWillBeCalled<T>
    ) => void;
    removeOnDispatchWillBeCalled: (
        callback: OnContextDispatchWillBeCalled<T>
    ) => void;
}
