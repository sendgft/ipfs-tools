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
}
export declare const execute: ({ api }: Params) => Promise<void>;
export {};
