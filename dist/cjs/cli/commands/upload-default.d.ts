export declare const getMeta: () => {
    summary: string;
    params: {
        name: string;
        typeLabel: string;
        description: string;
    }[];
};
interface Params {
    api: string;
    gateway: string;
}
export declare const execute: ({ api, gateway }: Params) => Promise<void>;
export {};
