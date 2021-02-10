import type { ContextAction } from "./ContextAction";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionTypeguard<T extends ContextAction> = (data: any) => data is T;
