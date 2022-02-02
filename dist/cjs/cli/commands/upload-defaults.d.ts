export declare const getMeta: () => {
    summary: string;
    params: {
        name: string;
        typeLabel: string;
        description: string;
        defaultValue: string;
    }[];
    options: {
        name: string;
        description: string;
        defaultValue: string;
    }[];
};
interface Params {
    folder: string;
    api: string;
    gateway: string;
}
export declare const execute: ({ folder, api, gateway }: Params) => Promise<void>;
export {};
