export declare const getMeta: () => {
    summary: string;
    params: {
        name: string;
        typeLabel: string;
        description: string;
    }[];
    options: {
        name: string;
        description: string;
        defaultValue: string;
    }[];
};
interface Params {
    path: string;
    api: string;
    gateway: string;
}
export declare const execute: ({ path: fileOrFolder, api, gateway }: Params) => Promise<void>;
export {};
