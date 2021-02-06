export type WpfWebviewWindow = {
    InvokeFromExternal?: (message: string) => any;
    external?: { notify: (message: string) => any };
};
