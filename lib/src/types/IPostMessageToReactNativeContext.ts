import { ContextAction } from "./ContextAction";
import { OnContextDispatchWillBeCalled } from "./OnContextDispatchWillBeCalled";

export interface IPostMessageToReactNativeContext<T extends ContextAction> {
    dispatch: React.Dispatch<T>;
    listenOnDispatchWillBeCalled: (
        callback: OnContextDispatchWillBeCalled<T>
    ) => void;
    removeOnDispatchWillBeCalled: (
        callback: OnContextDispatchWillBeCalled<T>
    ) => void;
}
