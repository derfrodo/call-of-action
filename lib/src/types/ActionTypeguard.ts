import { ContextAction } from "./ContextAction";

export type ActionTypeguard<T extends ContextAction> = (data: any) => data is T;
