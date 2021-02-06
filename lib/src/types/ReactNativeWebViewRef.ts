import type { MutableRefObject } from "react";

export type ReactNativeWebViewRef = MutableRefObject<
    | {
          injectJavaScript: (js: string) => void;
      }
    | undefined
> | null;
